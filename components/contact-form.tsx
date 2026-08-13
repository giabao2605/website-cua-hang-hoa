"use client";

import { FormEvent, useState } from "react";

type Feedback = Readonly<{ type: "success" | "error"; message: string }> | null;

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          occasion: data.get("occasion"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });
      const body = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? "Không thể gửi yêu cầu lúc này.");
      form.reset();
      setFeedback({ type: "success", message: "Trâm đã nhận yêu cầu. Shop sẽ liên hệ lại sớm nhất có thể." });
    } catch (cause) {
      setFeedback({ type: "error", message: cause instanceof Error ? cause.message : "Không thể gửi yêu cầu lúc này." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <h2>Gửi yêu cầu tư vấn</h2>
      <label>Họ và tên<input name="name" required minLength={2} maxLength={80} autoComplete="name" /></label>
      <label>Số điện thoại<input name="phone" required inputMode="tel" autoComplete="tel" /></label>
      <label>Email, không bắt buộc<input name="email" type="email" maxLength={254} autoComplete="email" /></label>
      <label>Dịp tặng<select name="occasion" defaultValue="Sinh nhật"><option>Sinh nhật</option><option>Kỷ niệm</option><option>Chúc mừng</option><option>Hoa cưới / sự kiện</option><option>Khác</option></select></label>
      <label>Điều bạn muốn chia sẻ<textarea name="message" rows={5} minLength={10} maxLength={1_000} required /></label>
      <label className="form-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? "Đang gửi..." : "Gửi yêu cầu"}</button>
      {feedback && <p className={`form-feedback form-feedback-${feedback.type}`} role="status" aria-live="polite">{feedback.message}</p>}
      <small>Thông tin chỉ được dùng để tư vấn và xử lý yêu cầu của bạn.</small>
    </form>
  );
}
