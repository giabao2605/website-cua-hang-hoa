import { parseSiteSettingsInput } from "./admin-domain.ts";
import { getD1Binding, requireD1Binding } from "./platform.ts";
import { defaultSiteSettings, type SiteSettings } from "./site.ts";

const settingKeys = {
  shopName: "shop_name",
  tagline: "tagline",
  phone: "phone",
  address: "address",
  openingHours: "opening_hours",
  zaloUrl: "zalo_url",
  momoNumber: "momo_number",
  momoOwner: "momo_owner",
  momoQrImage: "momo_qr_image",
  otpSenderEmail: "otp_sender_email",
  codEnabled: "cod_enabled",
  momoEnabled: "momo_enabled",
} as const;

type EditableSiteSettings = Omit<SiteSettings, "phoneDisplay">;
type SettingsRow = Readonly<{ key: string; value: string }>;

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getD1Binding();
  if (!db) return defaultSiteSettings;
  try {
    return await readSiteSettings(db, false);
  } catch {
    return defaultSiteSettings;
  }
}

export async function requireSiteSettings(): Promise<SiteSettings> {
  return readSiteSettings(requireD1Binding(), true);
}

export async function saveSiteSettings(value: unknown): Promise<SiteSettings> {
  const input = parseSiteSettingsInput(value);
  const db = requireD1Binding();
  const now = new Date().toISOString();
  const entries = Object.entries(settingKeys) as Array<[keyof EditableSiteSettings, string]>;
  await db.batch(entries.map(([property, key]) => db.prepare(`
    INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).bind(key, String(input[property]), now)));
  return { ...input, phoneDisplay: formatPhone(input.phone) };
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  return value === undefined ? fallback : value === "true" || value === "1";
}

async function readSiteSettings(db: D1Database, strict: boolean): Promise<SiteSettings> {
  const result = await db.prepare("SELECT key, value FROM site_settings").all<SettingsRow>();
  const values = Object.fromEntries(result.results.map((row) => [row.key, row.value]));
  if (strict) {
    const optionalKeys = new Set<string>([settingKeys.momoQrImage, settingKeys.otpSenderEmail]);
    const missing = Object.values(settingKeys).filter((key) => !optionalKeys.has(key) && values[key] === undefined);
    if (missing.length) throw new Error("Cấu hình vận hành tạm thời không sẵn sàng.");
  }
  const input = {
    shopName: values.shop_name ?? defaultSiteSettings.shopName,
    tagline: values.tagline ?? defaultSiteSettings.tagline,
    phone: values.phone ?? defaultSiteSettings.phone,
    address: values.address ?? defaultSiteSettings.address,
    openingHours: values.opening_hours ?? defaultSiteSettings.openingHours,
    zaloUrl: values.zalo_url ?? defaultSiteSettings.zaloUrl,
    momoNumber: values.momo_number ?? defaultSiteSettings.momoNumber,
    momoOwner: values.momo_owner ?? defaultSiteSettings.momoOwner,
    momoQrImage: values.momo_qr_image ?? defaultSiteSettings.momoQrImage,
    otpSenderEmail: values.otp_sender_email ?? defaultSiteSettings.otpSenderEmail,
    codEnabled: parseBoolean(values.cod_enabled, defaultSiteSettings.codEnabled),
    momoEnabled: parseBoolean(values.momo_enabled, defaultSiteSettings.momoEnabled),
  };
  const parsed = strict ? parseSiteSettingsInput(input) : input;
  return { ...parsed, phoneDisplay: formatPhone(parsed.phone) };
}

function formatPhone(phone: string) {
  return phone.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
}
