import { renderOtpEmail } from "./signup-otp.ts";

export async function sendSignupOtpEmail(input: { to: string; otp: string; senderEmail: string; senderName: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("Transactional email is not configured.");
  const content = renderOtpEmail({ shopName: input.senderName, otp: input.otp });
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: input.senderEmail, name: input.senderName },
      to: [{ email: input.to }],
      subject: content.subject,
      htmlContent: content.htmlContent,
      textContent: content.textContent,
    }),
  });
  if (!response.ok) throw new Error("Transactional email provider rejected the request.");
}
