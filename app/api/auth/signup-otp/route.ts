import { assertSameOrigin, consumeRateLimit, getRequestClientKey, parseJsonRequest } from "../../../../lib/api-security.ts";
import { SignupOtpError, issueSignupOtp, registerWithSignupOtp } from "../../../../lib/signup-otp-service.ts";
import { createConfirmedSupabaseUser } from "../../../../lib/supabase/admin.ts";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    assertSignupEnvironment(true);
    if (!consumeRateLimit(`signup-otp-send:${getRequestClientKey(request)}`, 10, 15 * 60 * 1_000)) {
      return otpError("rate_limited", "Có quá nhiều yêu cầu gửi mã. Vui lòng thử lại sau.", 429, 60);
    }
    const payload = await parseJsonRequest(request, 2_000);
    const data = await issueSignupOtp(payload);
    return Response.json({ data });
  } catch (error) {
    return handleOtpError(error);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    assertSignupEnvironment(false);
    if (!consumeRateLimit(`signup-otp-verify:${getRequestClientKey(request)}`, 30, 15 * 60 * 1_000)) {
      return otpError("rate_limited", "Có quá nhiều lần xác nhận. Vui lòng thử lại sau.", 429, 60);
    }
    const payload = await parseJsonRequest(request, 4_000);
    const data = await registerWithSignupOtp(payload, { createUser: createConfirmedSupabaseUser });
    return Response.json({ data });
  } catch (error) {
    return handleOtpError(error);
  }
}

function handleOtpError(error: unknown) {
  if (error instanceof SignupOtpError) {
    const status = error.code === "otp_cooldown" ? 429
      : error.code === "otp_not_configured" || error.code === "email_delivery_failed" ? 503
      : error.code === "account_exists" ? 409
      : 422;
    return otpError(error.code, error.message, status, error.retryAfterSeconds, error.attemptsRemaining);
  }
  const message = error instanceof Error ? error.message : "";
  const status = /Nguồn yêu cầu/.test(message) ? 403 : /JSON|định dạng|quá lớn|Email đăng ký|Thông tin đăng ký/.test(message) ? 422 : 500;
  return otpError(status === 403 ? "forbidden_origin" : status === 422 ? "invalid_request" : "signup_failed", status === 500 ? "Không thể xử lý đăng ký lúc này." : message, status);
}

function otpError(code: string, message: string, status: number, retryAfterSeconds?: number, attemptsRemaining?: number) {
  const headers = retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined;
  return Response.json({ error: { code, message, retryAfterSeconds, attemptsRemaining } }, { status, headers });
}

function assertSignupEnvironment(needsEmailProvider: boolean) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY || (needsEmailProvider && !process.env.BREVO_API_KEY) || (process.env.OTP_HMAC_SECRET?.length ?? 0) < 32) {
    throw new SignupOtpError("otp_not_configured", "Đăng ký bằng email chưa được cấu hình đầy đủ.");
  }
}
