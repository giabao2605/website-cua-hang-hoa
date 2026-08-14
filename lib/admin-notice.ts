export type AdminSection = "overview" | "orders" | "contacts" | "accounts" | "products" | "shipping" | "settings";
export type AdminNoticeInput = Readonly<{ type: "success" | "error"; text: string }> | null;
export type AdminNotice = (Exclude<AdminNoticeInput, null> & Readonly<{ section: AdminSection }>) | null;

export const ADMIN_NOTICE_DURATION_MS = 5_000;

export function createAdminNotice(section: AdminSection, notice: AdminNoticeInput): AdminNotice {
  return notice ? { ...notice, section } : null;
}

export function isAdminNoticeVisible(notice: AdminNotice, section: AdminSection): notice is Exclude<AdminNotice, null> {
  return notice?.section === section;
}

export function shouldStoreAdminNotice(sourceSection: AdminSection, activeSection: AdminSection): boolean {
  return sourceSection === activeSection;
}
