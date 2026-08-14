export type AdminIdentity = Readonly<{
  email?: string;
  email_confirmed_at?: string;
}>;

export function hasAdminAccess(user: AdminIdentity) {
  if (!user.email || !user.email_confirmed_at) return false;
  return isAdminEmail(user.email);
}

export function isAdminEmail(email: string) {
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return allowedEmails.includes(email.toLowerCase());
}
