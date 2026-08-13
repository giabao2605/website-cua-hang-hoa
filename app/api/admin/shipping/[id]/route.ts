import { adminMutationError, authorizeAdminRequest } from "../../../../../lib/admin-api";
import { parseJsonRequest } from "../../../../../lib/api-security";
import { saveShippingRule } from "../../../../../lib/admin-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const { id } = await params;
    const payload = await parseJsonRequest(request, 8_000);
    const data = await saveShippingRule(id, payload);
    return Response.json({ data });
  } catch (error) {
    return adminMutationError(error);
  }
}
