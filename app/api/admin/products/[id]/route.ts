import { adminMutationError, authorizeAdminRequest } from "../../../../../lib/admin-api";
import { parseJsonRequest } from "../../../../../lib/api-security";
import { saveAdminProduct } from "../../../../../lib/admin-store";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const { id } = await params;
    const payload = await parseJsonRequest(request, 64_000);
    const data = await saveAdminProduct(id, payload);
    return Response.json({ data });
  } catch (error) {
    return adminMutationError(error);
  }
}
