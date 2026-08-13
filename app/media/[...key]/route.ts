import { getMediaBinding } from "../../../lib/platform";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await params;
  const key = segments.join("/");
  if (!/^products\/[0-9]{4}\/[0-9]{2}\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/.test(key)) return new Response("Không tìm thấy ảnh.", { status: 404 });
  const bucket = getMediaBinding();
  if (!bucket) return new Response("Kho ảnh chưa sẵn sàng.", { status: 503 });
  const object = await bucket.get(key);
  if (!object) return new Response("Không tìm thấy ảnh.", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("x-content-type-options", "nosniff");
  headers.set("content-security-policy", "default-src 'none'; sandbox");
  return new Response(object.body, { headers });
}
