"use client";

import { FormEvent, useState } from "react";

type Feedback = Readonly<{ type: "success" | "error"; message: string }> | null;

export function NewsletterForm() {
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
        }),
      });
      const body = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? "Không thể đăng ký nhận tin lúc này.");
      form.reset();
      setFeedback({ type: "success", message: "Đã đăng ký thư hoa theo mùa." });
    } catch (cause) {
      setFeedback({ type: "error", message: cause instanceof Error ? cause.message : "Không thể đăng ký nhận tin lúc này." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <div className="newsletter-fields">
        <input name="email" type="email" placeholder="Email của bạn" aria-label="Email nhận tin" maxLength={254} autoComplete="email" required />
        <button type="submit" disabled={submitting}>{submitting ? "Đang lưu..." : "Đăng ký"}</button>
      </div>
      <label className="newsletter-consent"><input name="consent" type="checkbox" required /> Tôi đồng ý nhận tin từ Trâm Florist.</label>
      <label className="form-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {feedback && <p className={`newsletter-feedback newsletter-feedback-${feedback.type}`} role="status" aria-live="polite">{feedback.message}</p>}
    </form>
  );
}
