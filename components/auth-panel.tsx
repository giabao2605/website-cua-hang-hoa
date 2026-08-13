"use client";

import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase/client";

export type AuthMode = "login" | "signup" | "verify" | "forgot" | "reset";

export function AuthPanel({ initialMode = "login", initialError = "" }: { initialMode?: AuthMode; initialError?: string }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "signup") {
        const password = String(form.get("password") ?? "");
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(form.get("fullName") ?? "") },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/tai-khoan`,
          },
        });
        if (authError) throw authError;
        setMode("verify");
        setMessage("Mã OTP đã được gửi tới email. Vui lòng kiểm tra cả hộp thư rác.");
      } else if (mode === "verify") {
        const { error: authError } = await supabase.auth.verifyOtp({
          email,
          token: String(form.get("otp") ?? ""),
          type: "email",
        });
        if (authError) throw authError;
        window.location.href = "/tai-khoan";
      } else if (mode === "forgot") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/tai-khoan?mode=reset")}`,
        });
        if (authError) throw authError;
        setMessage("Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi tới hộp thư.");
      } else if (mode === "reset") {
        const password = String(form.get("password") ?? "");
        const confirmation = String(form.get("passwordConfirmation") ?? "");
        if (password !== confirmation) throw new Error("Mật khẩu nhập lại chưa khớp.");
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setMessage("Mật khẩu đã được cập nhật. Bạn có thể tiếp tục dùng tài khoản.");
        window.setTimeout(() => { window.location.href = "/tai-khoan"; }, 900);
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password: String(form.get("password") ?? ""),
        });
        if (authError) throw authError;
        window.location.href = "/tai-khoan";
      }
    } catch (cause) {
      if (cause instanceof Error && /email not confirmed/i.test(cause.message)) setMode("verify");
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
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/tai-khoan` },
      });
      if (authError) throw authError;
      setMessage("Đã gửi lại OTP. Vui lòng chờ ít phút trước khi yêu cầu thêm lần nữa.");
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  const socialAvailable = mode === "login" || mode === "signup";
  const needsEmail = mode !== "reset";
  const needsPassword = mode === "login" || mode === "signup" || mode === "reset";
  return (
    <div className="auth-card">
      <div className="auth-heading"><span className="eyebrow">Trâm Florist Members</span><h1>{authTitle(mode)}</h1><p>{mode === "login" ? "Đăng nhập để theo dõi đơn và lưu thông tin giao hoa." : mode === "verify" ? `Nhập mã OTP 6 số đã gửi tới ${email}.` : mode === "reset" ? "Chọn mật khẩu mới cho tài khoản của bạn." : "Thông tin tài khoản được bảo vệ bởi Supabase Auth."}</p></div>
      {!configured && <div className="config-notice"><AlertCircle /><span><strong>Xác thực thật chưa được cấu hình trên localhost</strong><small>Giao diện không tạo tài khoản giả. Thêm biến môi trường Supabase để bật email OTP và Google.</small></span></div>}
      {error && <div className="form-error"><AlertCircle />{error}</div>}
      {message && <div className="form-success"><CheckCircle2 />{message}</div>}
      {socialAvailable && <button className="google-button" type="button" disabled={!configured || loading} onClick={google}><span>G</span>Tiếp tục với Google</button>}
      {socialAvailable && <div className="auth-divider"><span>hoặc với email</span></div>}
      <form onSubmit={submit}>
        {mode === "signup" && <label>Họ và tên<input name="fullName" required minLength={2} autoComplete="name" /></label>}
        {needsEmail && <label>Email<div className="input-icon"><Mail /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} name="email" required autoComplete="email" /></div></label>}
        {needsPassword && <label>{mode === "reset" ? "Mật khẩu mới" : "Mật khẩu"}<div className="input-icon"><LockKeyhole /><input type={showPassword ? "text" : "password"} name="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label="Hiện hoặc ẩn mật khẩu">{showPassword ? <EyeOff /> : <Eye />}</button></div>{mode !== "login" && <small>Tối thiểu 8 ký tự; nên có chữ hoa, chữ thường và số.</small>}</label>}
        {mode === "reset" && <label>Nhập lại mật khẩu<input type={showPassword ? "text" : "password"} name="passwordConfirmation" required minLength={8} autoComplete="new-password" /></label>}
        {mode === "verify" && <label>Mã OTP<input className="otp-input" name="otp" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" autoComplete="one-time-code" /></label>}
        <button className="button button-primary button-full" disabled={!configured || loading}>{loading ? "Đang xử lý..." : submitLabel(mode)}</button>
      </form>
      {mode === "verify" && <button className="auth-text-button" type="button" disabled={loading} onClick={resendOtp}>Gửi lại mã OTP</button>}
      {mode === "login" && <button className="auth-text-button" type="button" onClick={() => switchMode(setMode, "forgot", setError, setMessage)}>Quên mật khẩu?</button>}
      {mode !== "reset" && <div className="auth-switch">{mode === "login" ? <>Chưa có tài khoản? <button type="button" onClick={() => switchMode(setMode, "signup", setError, setMessage)}>Đăng ký ngay</button></> : <>Đã có tài khoản? <button type="button" onClick={() => switchMode(setMode, "login", setError, setMessage)}>Đăng nhập</button></>}</div>}
    </div>
  );
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
  if (/email not confirmed/i.test(message)) return "Email chưa được xác nhận. Vui lòng nhập OTP đã gửi tới hộp thư.";
  if (/expired|invalid.*token|token.*invalid/i.test(message)) return "Mã OTP hoặc liên kết đã hết hạn. Vui lòng yêu cầu lại.";
  if (/rate limit|too many/i.test(message)) return "Bạn thao tác quá nhanh. Vui lòng chờ một lúc rồi thử lại.";
  if (/session/i.test(message)) return "Phiên khôi phục mật khẩu không còn hiệu lực. Vui lòng yêu cầu liên kết mới.";
  return message || "Không thể xử lý đăng nhập lúc này.";
}

function switchMode(
  setMode: (mode: AuthMode) => void,
  mode: AuthMode,
  setError: (message: string) => void,
  setMessage: (message: string) => void,
) {
  setError("");
  setMessage("");
  setMode(mode);
}
