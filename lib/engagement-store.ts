import { z } from "zod";
import { parseContactRequest, parseNewsletterSubscription } from "./customer-messages.ts";
import { getD1Binding } from "./platform.ts";

export type ContactRequestRecord = Readonly<{
  id: string;
  name: string;
  phone: string;
  email: string;
  occasion: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}>;

let memoryContacts: readonly ContactRequestRecord[] = [];
let memorySubscribers: Readonly<Record<string, string>> = {};

export async function createContactRequest(value: unknown) {
  const input = parseContactRequest(value);
  const record: ContactRequestRecord = {
    id: crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    email: input.email ?? "",
    occasion: input.occasion,
    message: input.message,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const db = getD1Binding();
  if (db) {
    await db.prepare("INSERT INTO contact_requests (id, name, phone, email, occasion, message, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?)")
      .bind(record.id, record.name, record.phone, record.email, record.occasion, record.message, record.createdAt, record.createdAt)
      .run();
  } else {
    memoryContacts = [record, ...memoryContacts];
  }
  return { id: record.id };
}

export async function subscribeNewsletter(value: unknown) {
  const input = parseNewsletterSubscription(value);
  const now = new Date().toISOString();
  const db = getD1Binding();
  if (db) {
    await db.prepare(`
      INSERT INTO newsletter_subscribers (email, active, source, created_at, updated_at)
      VALUES (?, 1, 'footer', ?, ?)
      ON CONFLICT(email) DO UPDATE SET active = 1, updated_at = excluded.updated_at
    `).bind(input.email, now, now).run();
  } else {
    memorySubscribers = { ...memorySubscribers, [input.email]: now };
  }
  return { email: input.email };
}

export async function listContactRequests(): Promise<ContactRequestRecord[]> {
  const db = getD1Binding();
  if (!db) return [...memoryContacts];
  const result = await db.prepare("SELECT id, name, phone, email, occasion, message, status, created_at FROM contact_requests ORDER BY created_at DESC LIMIT 100")
    .all<Record<string, string>>();
  return result.results.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    occasion: row.occasion,
    message: row.message,
    status: row.status as ContactRequestRecord["status"],
    createdAt: row.created_at,
  }));
}

export async function countActiveNewsletterSubscribers() {
  const db = getD1Binding();
  if (!db) return Object.keys(memorySubscribers).length;
  const row = await db.prepare("SELECT COUNT(*) AS count FROM newsletter_subscribers WHERE active = 1").first<{ count: number }>();
  return Number(row?.count ?? 0);
}

export async function updateContactRequestStatus(id: string, value: unknown) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Mã yêu cầu tư vấn không hợp lệ.");
  const parsed = z.object({ status: z.enum(["new", "contacted", "closed"]) }).safeParse(value);
  if (!parsed.success) throw new Error("Trạng thái yêu cầu tư vấn không hợp lệ.");
  const db = getD1Binding();
  if (!db) {
    const existing = memoryContacts.find((request) => request.id === id);
    if (!existing) throw new Error("Không tìm thấy yêu cầu tư vấn.");
    memoryContacts = memoryContacts.map((request) => request.id === id ? { ...request, status: parsed.data.status } : request);
    return { id, status: parsed.data.status };
  }
  const result = await db.prepare("UPDATE contact_requests SET status = ?, updated_at = ? WHERE id = ?")
    .bind(parsed.data.status, new Date().toISOString(), id)
    .run();
  if (Number(result.meta.changes ?? 0) !== 1) throw new Error("Không tìm thấy yêu cầu tư vấn.");
  return { id, status: parsed.data.status };
}
