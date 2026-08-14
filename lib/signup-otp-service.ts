import { requireD1Binding } from "./platform.ts";
import { requireSiteSettings } from "./site-settings-store.ts";
import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_SECONDS,
  generateOtpCode,
  getResendDelaySeconds,
  hashOtp,
  parseOtpRequest,
  parseOtpVerification,
  verifyOtpHash,
} from "./signup-otp.ts";
import { sendSignupOtpEmail } from "./transactional-email.ts";

export type SignupOtpRow = Readonly<{
  email: string;
  codeHash: string;
  expiresAt: number;
  nextSendAt: number;
  sendCount: number;
  verifyAttempts: number;
  createdAt: number;
  updatedAt: number;
}>;

type IssueDependencies = Readonly<{
  db?: D1Database;
  secret?: string;
  now?: number;
  createCode?: () => string;
  getSettings?: () => Promise<{ shopName: string; otpSenderEmail: string }>;
  sendEmail?: (input: { to: string; otp: string; senderEmail: string; senderName: string }) => Promise<void>;
}>;

type RegisterDependencies = Readonly<{
  db?: D1Database;
  secret?: string;
  now?: number;
  createUser: (input: { email: string; password: string; fullName: string; emailConfirm: true }) => Promise<void>;
}>;

export class SignupOtpError extends Error {
  readonly code: "otp_cooldown" | "otp_invalid" | "otp_expired" | "otp_attempts_exhausted" | "email_delivery_failed" | "otp_not_configured" | "account_exists";
  readonly retryAfterSeconds?: number;
  readonly attemptsRemaining?: number;

  constructor(
    code: "otp_cooldown" | "otp_invalid" | "otp_expired" | "otp_attempts_exhausted" | "email_delivery_failed" | "otp_not_configured" | "account_exists",
    message: string,
    retryAfterSeconds?: number,
    attemptsRemaining?: number,
  ) {
    super(message);
    this.name = "SignupOtpError";
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.attemptsRemaining = attemptsRemaining;
  }
}

export async function issueSignupOtp(value: unknown, dependencies: IssueDependencies = {}) {
  const { email } = parseOtpRequest(value);
  const db = dependencies.db ?? requireD1Binding();
  const now = dependencies.now ?? Date.now();
  const secret = requireOtpSecret(dependencies.secret);
  const existing = await readOtp(db, email);
  if (existing && existing.nextSendAt > now) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.nextSendAt - now) / 1_000));
    throw new SignupOtpError("otp_cooldown", "Vui lòng chờ trước khi gửi lại mã.", retryAfterSeconds);
  }

  const settings = await (dependencies.getSettings ?? requireSiteSettings)();
  if (!settings.otpSenderEmail) {
    throw new SignupOtpError("otp_not_configured", "Email gửi OTP chưa được cấu hình.");
  }
  const otp = (dependencies.createCode ?? generateOtpCode)();
  const codeHash = await hashOtp(email, otp, secret);
  const sendCount = (existing?.sendCount ?? 0) + 1;
  const retryAfterSeconds = getResendDelaySeconds(sendCount);
  const expiresInSeconds = OTP_TTL_SECONDS;
  const createdAt = existing?.createdAt ?? now;

  const reservation = await db.prepare(`
    INSERT INTO signup_otps (email, code_hash, expires_at, next_send_at, send_count, verify_attempts, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      code_hash = excluded.code_hash,
      expires_at = excluded.expires_at,
      next_send_at = excluded.next_send_at,
      send_count = signup_otps.send_count + 1,
      verify_attempts = 0,
      updated_at = excluded.updated_at
    WHERE signup_otps.next_send_at <= ?
  `).bind(email, codeHash, now + expiresInSeconds * 1_000, now + retryAfterSeconds * 1_000, sendCount, 0, createdAt, now, now).run();
  if (Number(reservation.meta.changes ?? 0) !== 1) {
    const current = await readOtp(db, email);
    const retry = current ? Math.max(1, Math.ceil((current.nextSendAt - now) / 1_000)) : retryAfterSeconds;
    throw new SignupOtpError("otp_cooldown", "Vui lòng chờ trước khi gửi lại mã.", retry);
  }

  try {
    await (dependencies.sendEmail ?? sendSignupOtpEmail)({
      to: email,
      otp,
      senderEmail: settings.otpSenderEmail,
      senderName: settings.shopName,
    });
  } catch {
    await restorePreviousOtp(db, email, codeHash, existing);
    throw new SignupOtpError("email_delivery_failed", "Không thể gửi email xác nhận lúc này.");
  }

  return { email, expiresInSeconds, retryAfterSeconds };
}

export async function registerWithSignupOtp(value: unknown, dependencies: RegisterDependencies) {
  const input = parseOtpVerification(value);
  const db = dependencies.db ?? requireD1Binding();
  const now = dependencies.now ?? Date.now();
  const secret = requireOtpSecret(dependencies.secret);
  const row = await readOtp(db, input.email);
  if (!row) throw new SignupOtpError("otp_invalid", "Mã OTP không hợp lệ.");
  if (row.expiresAt <= now) {
    await db.prepare("DELETE FROM signup_otps WHERE email = ?").bind(input.email).run();
    throw new SignupOtpError("otp_expired", "Mã OTP đã hết hạn.");
  }
  if (row.verifyAttempts >= OTP_MAX_ATTEMPTS) {
    throw new SignupOtpError("otp_attempts_exhausted", "Mã OTP đã bị khóa do nhập sai quá nhiều lần.", undefined, 0);
  }

  if (!await verifyOtpHash(input.email, input.otp, secret, row.codeHash)) {
    const update = await db.prepare(`
      UPDATE signup_otps SET verify_attempts = verify_attempts + 1, updated_at = ?
      WHERE email = ? AND code_hash = ? AND expires_at > ? AND verify_attempts < ?
    `).bind(now, input.email, row.codeHash, now, OTP_MAX_ATTEMPTS).run();
    if (Number(update.meta.changes ?? 0) !== 1) throw await currentVerificationError(db, input.email, now);
    const current = await readOtp(db, input.email);
    const attemptsRemaining = Math.max(0, OTP_MAX_ATTEMPTS - (current?.verifyAttempts ?? OTP_MAX_ATTEMPTS));
    const code = attemptsRemaining > 0 ? "otp_invalid" : "otp_attempts_exhausted";
    throw new SignupOtpError(code, attemptsRemaining > 0 ? "Mã OTP không đúng." : "Mã OTP đã bị khóa do nhập sai quá nhiều lần.", undefined, attemptsRemaining);
  }

  const claim = await db.prepare(`
    DELETE FROM signup_otps
    WHERE email = ? AND code_hash = ? AND expires_at > ? AND verify_attempts < ?
  `).bind(input.email, row.codeHash, now, OTP_MAX_ATTEMPTS).run();
  if (Number(claim.meta.changes ?? 0) !== 1) throw await currentVerificationError(db, input.email, now);

  try {
    await dependencies.createUser({
      email: input.email,
      password: input.password,
      fullName: input.fullName,
      emailConfirm: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "account_exists") {
      throw new SignupOtpError("account_exists", "Email này đã có tài khoản.");
    }
    throw error;
  }

  return { email: input.email };
}

async function currentVerificationError(db: D1Database, email: string, now: number) {
  const current = await readOtp(db, email);
  if (current?.expiresAt !== undefined && current.expiresAt <= now) return new SignupOtpError("otp_expired", "Mã OTP đã hết hạn.");
  if (current && current.verifyAttempts >= OTP_MAX_ATTEMPTS) {
    return new SignupOtpError("otp_attempts_exhausted", "Mã OTP đã bị khóa do nhập sai quá nhiều lần.", undefined, 0);
  }
  return new SignupOtpError("otp_invalid", "Mã OTP không hợp lệ.");
}

async function restorePreviousOtp(db: D1Database, email: string, failedHash: string, previous: SignupOtpRow | null) {
  if (!previous) {
    await db.prepare("DELETE FROM signup_otps WHERE email = ? AND code_hash = ?").bind(email, failedHash).run();
    return;
  }
  await db.prepare(`
    UPDATE signup_otps SET code_hash = ?, expires_at = ?, next_send_at = ?, send_count = ?,
      verify_attempts = ?, created_at = ?, updated_at = ?
    WHERE email = ? AND code_hash = ?
  `).bind(
    previous.codeHash,
    previous.expiresAt,
    previous.nextSendAt,
    previous.sendCount,
    previous.verifyAttempts,
    previous.createdAt,
    previous.updatedAt,
    email,
    failedHash,
  ).run();
}

function requireOtpSecret(value?: string) {
  const secret = value ?? process.env.OTP_HMAC_SECRET ?? "";
  if (secret.length < 32) throw new SignupOtpError("otp_not_configured", "Dịch vụ OTP chưa được cấu hình.");
  return secret;
}

async function readOtp(db: D1Database, email: string) {
  return db.prepare(`
    SELECT email, code_hash AS codeHash, expires_at AS expiresAt, next_send_at AS nextSendAt,
      send_count AS sendCount, verify_attempts AS verifyAttempts, created_at AS createdAt, updated_at AS updatedAt
    FROM signup_otps WHERE email = ? LIMIT 1
  `).bind(email).first<SignupOtpRow>();
}
