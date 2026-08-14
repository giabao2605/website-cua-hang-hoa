"use client";

import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, KeyboardEvent, ClipboardEvent, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase/client";

export type AuthMode = "login" | "signup" | "verify" | "forgot" | "reset";
const EMPTY_OTP = ["", "", "", ""] as const;

export function AuthPanel({ initialMode = "login", initialError = "" }: { initialMode?: AuthMode; initialError?: string }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>([...EMPTY_OTP]);
  const [retryAfter, setRetryAfter] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (mode !== "verify" || (retryAfter <= 0 && expiresIn <= 0)) return;
    const timer = window.setInterval(() => {
      setRetryAfter((current) => Math.max(0, current - 1));
      setExpiresIn((current) => Math.max(0, current - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [mode, retryAfter, expiresIn]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      if (mode === "signup") {
        const data = await requestOtp(email);
        setOtpDigits([...EMPTY_OTP]);
        setRetryAfter(data.retryAfterSeconds);
        setExpiresIn(data.expiresInSeconds);
        setMode("verify");
        setMessage("Mã OTP 4 số đã được gửi tới email. Vui lòng kiểm tra cả hộp thư rác.");
      } else if (mode === "verify") {
        const otp = otpDigits.join("");
        await requestJson("/api/auth/signup-otp", "PUT", { email, fullName, password, otp });
        const supabase = createSupabaseBrowserClient();
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        window.location.href = "/tai-khoan";
      } else if (mode === "forgot") {
        const supabase = createSupabaseBrowserClient();
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/tai-khoan?mode=reset")}`,
        });
        if (authError) throw authError;
        setMessage("Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi tới hộp thư.");
      } else if (mode === "reset") {
        const confirmation = String(form.get("passwordConfirmation") ?? "");
        if (password !== confirmation) throw new Error("Mật khẩu nhập lại chưa khớp.");
        const supabase = createSupabaseBrowserClient();
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setMessage("Mật khẩu đã được cập nhật. Bạn có thể tiếp tục dùng tài khoản.");
        window.setTimeout(() => { window.location.href = "/tai-khoan"; }, 900);
      } else {
        const supabase = createSupabaseBrowserClient();
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        window.location.href = "/tai-khoan";
      }
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setError("");
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/tai-khoan` },
      });
      if (authError) throw authError;
    } catch (cause) {
      setError(authErrorMessage(cause));
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await requestOtp(email);
      setOtpDigits([...EMPTY_OTP]);
      setRetryAfter(data.retryAfterSeconds);
      setExpiresIn(data.expiresInSeconds);
      setMessage("Đã gửi mã OTP mới. Mã trước đó không còn hiệu lực.");
    } catch (cause) {
      if (cause instanceof OtpRequestError && cause.retryAfterSeconds) setRetryAfter(cause.retryAfterSeconds);
      setError(authErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  function changeEmail() {
    setMode("signup");
    setOtpDigits([...EMPTY_OTP]);
    setRetryAfter(0);
    setExpiresIn(0);
    setError("");
    setMessage("");
  }

  const socialAvailable = mode === "login" || mode === "signup";
  const needsEmail = mode !== "reset";
  const needsPassword = mode === "login" || mode === "signup" || mode === "reset";
  const otpComplete = otpDigits.every(Boolean);
  return (
    <div className="auth-card">
      <div className="auth-heading"><span className="eyebrow">Trâm Florist Members</span><h1>{authTitle(mode)}</h1><p>{mode === "login" ? "Đăng nhập để theo dõi đơn và lưu thông tin giao hoa." : mode === "verify" ? `Nhập mã OTP 4 số đã gửi tới ${email}.` : mode === "reset" ? "Chọn mật khẩu mới cho tài khoản của bạn." : "Thông tin tài khoản được bảo vệ bởi Supabase Auth."}</p></div>
      {!configured && <div className="config-notice"><AlertCircle /><span><strong>Xác thực thật chưa được cấu hình trên localhost</strong><small>Thêm cấu hình Supabase phía máy chủ để bật đăng ký, đăng nhập và Google.</small></span></div>}
      {error && <div className="form-error"><AlertCircle />{error}</div>}
      {message && <div className="form-success"><CheckCircle2 />{message}</div>}
      {socialAvailable && <button className="google-button" type="button" disabled={!configured || loading} onClick={google}><span>G</span>Tiếp tục với Google</button>}
      {socialAvailable && <div className="auth-divider"><span>hoặc với email</span></div>}
      <form onSubmit={submit}>
        {mode === "signup" && <label>Họ và tên<input name="fullName" required minLength={2} value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" /></label>}
        {needsEmail && <label>Email<div className="input-icon"><Mail /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} name="email" required readOnly={mode === "verify"} autoComplete="email" /></div></label>}
        {needsPassword && <label>{mode === "reset" ? "Mật khẩu mới" : "Mật khẩu"}<div className="input-icon"><LockKeyhole /><input type={showPassword ? "text" : "password"} name="password" required minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label="Hiện hoặc ẩn mật khẩu">{showPassword ? <EyeOff /> : <Eye />}</button></div>{mode !== "login" && <small>Tối thiểu 8 ký tự; nên có chữ hoa, chữ thường và số.</small>}</label>}
        {mode === "reset" && <label>Nhập lại mật khẩu<input type={showPassword ? "text" : "password"} name="passwordConfirmation" required minLength={8} maxLength={72} autoComplete="new-password" /></label>}
        {mode === "verify" && <div className="otp-field"><span>Mã OTP</span><OtpBoxes digits={otpDigits} onChange={setOtpDigits} disabled={loading} /><small>{expiresIn > 0 ? `Mã hết hạn sau ${formatCountdown(expiresIn)}.` : "Mã đã hết hạn. Hãy gửi lại mã mới."}</small></div>}
        <button className="button button-primary button-full" disabled={!configured || loading || (mode === "verify" && !otpComplete)}>{loading ? "Đang xử lý..." : submitLabel(mode)}</button>
      </form>
      {mode === "verify" && <div className="otp-actions"><button className="auth-text-button" type="button" disabled={loading || retryAfter > 0} onClick={resendOtp}>{retryAfter > 0 ? `Gửi lại sau ${formatCountdown(retryAfter)}` : "Gửi lại mã OTP"}</button><button className="auth-text-button" type="button" disabled={loading} onClick={changeEmail}>Đổi email</button></div>}
      {mode === "login" && <button className="auth-text-button" type="button" onClick={() => switchMode(setMode, "forgot", setError, setMessage)}>Quên mật khẩu?</button>}
      {mode !== "reset" && <div className="auth-switch">{mode === "login" ? <>Chưa có tài khoản? <button type="button" onClick={() => switchMode(setMode, "signup", setError, setMessage)}>Đăng ký ngay</button></> : <>Đã có tài khoản? <button type="button" onClick={() => switchMode(setMode, "login", setError, setMessage)}>Đăng nhập</button></>}</div>}
    </div>
  );
}

function OtpBoxes({ digits, onChange, disabled }: { digits: string[]; onChange: (digits: string[]) => void; disabled: boolean }) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function update(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = digits.map((current, position) => position === index ? digit : current);
    onChange(next);
    if (digit && index < next.length - 1) inputs.current[index + 1]?.focus();
  }

  function keyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = digits.map((current, position) => position === index - 1 ? "" : current);
      onChange(next);
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < digits.length - 1) {
      event.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  }

  function paste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits.length - index);
    if (!pasted) return;
    event.preventDefault();
    const next = [...digits];
    [...pasted].forEach((digit, offset) => { next[index + offset] = digit; });
    onChange(next);
    inputs.current[Math.min(index + pasted.length, digits.length) - 1]?.focus();
  }

  return <div className="otp-boxes" role="group" aria-label="Mã OTP 4 số">
    {digits.map((digit, index) => <input
      key={index}
      ref={(element) => { inputs.current[index] = element; }}
      type="text"
      value={digit}
      onChange={(event) => update(index, event.target.value)}
      onKeyDown={(event) => keyDown(index, event)}
      onPaste={(event) => paste(index, event)}
      inputMode="numeric"
      pattern="[0-9]"
      maxLength={1}
      autoComplete={index === 0 ? "one-time-code" : "off"}
      aria-label={`Số OTP thứ ${index + 1}`}
      disabled={disabled}
      required
    />)}
  </div>;
}

async function requestOtp(email: string) {
  return requestJson<{ email: string; expiresInSeconds: number; retryAfterSeconds: number }>("/api/auth/signup-otp", "POST", { email });
}

async function requestJson<T>(url: string, method: "POST" | "PUT", payload: unknown): Promise<T> {
  const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const body = await response.json() as { data?: T; error?: { message?: string; retryAfterSeconds?: number } };
  if (!response.ok || !body.data) throw new OtpRequestError(body.error?.message ?? "Không thể xử lý đăng ký lúc này.", body.error?.retryAfterSeconds);
  return body.data;
}

class OtpRequestError extends Error {
  readonly retryAfterSeconds?: number;
  constructor(message: string, retryAfterSeconds?: number) {
    super(message);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function authTitle(mode: AuthMode) {
  if (mode === "signup") return "Tạo tài khoản";
  if (mode === "verify") return "Xác nhận email";
  if (mode === "forgot") return "Khôi phục mật khẩu";
  if (mode === "reset") return "Đặt mật khẩu mới";
  return "Chào bạn trở lại";
}

function submitLabel(mode: AuthMode) {
  if (mode === "signup") return "Đăng ký và nhận OTP";
  if (mode === "verify") return "Xác nhận mã OTP";
  if (mode === "forgot") return "Gửi hướng dẫn";
  if (mode === "reset") return "Lưu mật khẩu mới";
  return "Đăng nhập";
}

function authErrorMessage(cause: unknown) {
  const message = cause instanceof Error ? cause.message : "";
  if (/invalid login credentials/i.test(message)) return "Email hoặc mật khẩu chưa đúng.";
  if (/email not confirmed/i.test(message)) return "Email chưa được xác nhận. Vui lòng liên hệ cửa hàng để được hỗ trợ.";
  if (/expired|hết hạn/i.test(message)) return "Mã OTP hoặc liên kết đã hết hạn. Vui lòng yêu cầu lại.";
  if (/rate limit|too many|quá nhiều/i.test(message)) return "Bạn thao tác quá nhanh. Vui lòng chờ một lúc rồi thử lại.";
  if (/session/i.test(message)) return "Phiên khôi phục mật khẩu không còn hiệu lực. Vui lòng yêu cầu liên kết mới.";
  return message || "Không thể xử lý đăng nhập lúc này.";
}

function switchMode(
  setMode: (mode: AuthMode) => void,
  mode: AuthMode,
  setError: (message: string) => void,
  setMessage: (message: string) => void,
) {
  setMode(mode);
  setError("");
  setMessage("");
}
