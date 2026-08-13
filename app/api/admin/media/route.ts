import { adminMutationError, authorizeAdminRequest } from "../../../../lib/admin-api";
import { detectImageExtension } from "../../../../lib/admin-domain";
import { requireMediaBinding } from "../../../../lib/platform";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const declaredSize = Number(request.headers.get("content-length") ?? "0");
    if (declaredSize > MAX_IMAGE_BYTES + 100_000) throw new Error("Ảnh vượt quá giới hạn 5 MB.");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("Vui lòng chọn một tệp ảnh.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!bytes.byteLength || bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("Ảnh phải có dung lượng từ 1 byte đến 5 MB.");
    const extension = detectImageExtension(bytes);
    if (!extension) throw new Error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP hợp lệ.");
    const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    const now = new Date();
    const key = `products/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;
    await requireMediaBinding().put(key, bytes, {
      httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { uploadedBy: authorization.user.id },
    });
    return Response.json({ data: { url: `/media/${key}` } }, { status: 201 });
  } catch (error) {
    return adminMutationError(error);
  }
}
