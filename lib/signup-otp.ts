import { z } from "zod";

export const OTP_TTL_SECONDS = 5 * 60;
export const OTP_MAX_ATTEMPTS = 5;
const OTP_LENGTH = 4;
const MAX_RANDOM_UINT32 = 0x1_0000_0000;
const OTP_SPACE = 10 ** OTP_LENGTH;
const MAX_UNBIASED_RANDOM = MAX_RANDOM_UINT32 - (MAX_RANDOM_UINT32 % OTP_SPACE);

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const otpRequestSchema = z.object({ email: emailSchema }).strict();
const otpVerificationSchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(72),
  otp: z.string().regex(/^\d{4}$/),
}).strict();

export function parseOtpRequest(value: unknown) {
  const parsed = otpRequestSchema.safeParse(value);
  if (!parsed.success) throw new Error("Email đăng ký không hợp lệ.");
  return parsed.data;
}

export function parseOtpVerification(value: unknown) {
  const parsed = otpVerificationSchema.safeParse(value);
  if (!parsed.success) throw new Error("Thông tin đăng ký hoặc mã OTP không hợp lệ.");
  return parsed.data;
}

export function getResendDelaySeconds(sendCount: number) {
  return Math.min(Math.max(Math.trunc(sendCount) + 1, 2), OTP_TTL_SECONDS / 60) * 60;
}

export function generateOtpCode() {
  const values = new Uint32Array(1);
  do crypto.getRandomValues(values); while (values[0] >= MAX_UNBIASED_RANDOM);
  return String(values[0] % OTP_SPACE).padStart(OTP_LENGTH, "0");
}

export async function hashOtp(email: string, otp: string, secret: string) {
  if (secret.length < 32) throw new Error("OTP_HMAC_SECRET phải có ít nhất 32 ký tự.");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`${email}\0${otp}`)));
  return [...signature].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyOtpHash(email: string, otp: string, secret: string, expectedHash: string) {
  const actualHash = await hashOtp(email, otp, secret);
  if (actualHash.length !== expectedHash.length) return false;
  let difference = 0;
  for (let index = 0; index < actualHash.length; index += 1) {
    difference |= actualHash.charCodeAt(index) ^ expectedHash.charCodeAt(index);
  }
  return difference === 0;
}

export function renderOtpEmail({ shopName, otp }: { shopName: string; otp: string }) {
  const safeName = escapeHtml(shopName);
  return {
    subject: `Mã xác nhận ${shopName}`,
    htmlContent: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#101a36"><h2>Xác nhận tài khoản ${safeName}</h2><p>Mã xác nhận của bạn là:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p><p>Mã có hiệu lực trong 5 phút. Không chia sẻ mã này với người khác.</p></div>`,
    textContent: `Xác nhận tài khoản ${shopName}\n\nMã xác nhận: ${otp}\n\nMã có hiệu lực trong 5 phút. Không chia sẻ mã này với người khác.`,
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}
