type RateLimitEntry = Readonly<{ count: number; resetAt: number }>;

let rateLimits: Readonly<Record<string, RateLimitEntry>> = {};

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new Error("Nguồn yêu cầu không hợp lệ.");
  }
}

export async function parseJsonRequest<T = unknown>(request: Request, maxBytes = 64_000): Promise<T> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new Error("Yêu cầu phải ở định dạng JSON.");
  }
  const declaredSize = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredSize) && declaredSize > maxBytes) throw new Error("Dữ liệu yêu cầu quá lớn.");
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > maxBytes) throw new Error("Dữ liệu yêu cầu quá lớn.");
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    throw new Error("Dữ liệu JSON không hợp lệ.");
  }
}

export function getRequestClientKey(request: Request): string {
  const forwarded = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "local";
  return forwarded.split(",", 1)[0].trim().slice(0, 64) || "local";
}

export function consumeRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const current = rateLimits[key];
  const next = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + windowMs }
    : { count: current.count + 1, resetAt: current.resetAt };
  rateLimits = { ...rateLimits, [key]: next };
  if (Object.keys(rateLimits).length > 2_000) {
    rateLimits = Object.fromEntries(Object.entries(rateLimits).filter(([, entry]) => entry.resetAt > now));
  }
  return next.count <= limit;
}

export function resetRateLimitsForTests() {
  rateLimits = {};
}

export function safeInternalPath(value: string | null | undefined, fallback = "/") {
  const containsControlCharacter = value ? [...value].some((character) => character.charCodeAt(0) < 32) : false;
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || containsControlCharacter) {
    return fallback;
  }
  return value;
}
