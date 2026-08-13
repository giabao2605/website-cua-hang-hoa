export function getD1Binding(): D1Database | null {
  return (globalThis as typeof globalThis & { __TRAM_FLORIST_DB__?: D1Database }).__TRAM_FLORIST_DB__ ?? null;
}

export function requireD1Binding(): D1Database {
  const binding = getD1Binding();
  if (!binding) throw new Error("Cơ sở dữ liệu D1 chưa sẵn sàng.");
  return binding;
}

export function getMediaBinding(): R2Bucket | null {
  return (globalThis as typeof globalThis & { __TRAM_FLORIST_MEDIA__?: R2Bucket }).__TRAM_FLORIST_MEDIA__ ?? null;
}

export function requireMediaBinding(): R2Bucket {
  const binding = getMediaBinding();
  if (!binding) throw new Error("Kho ảnh R2 chưa sẵn sàng.");
  return binding;
}
