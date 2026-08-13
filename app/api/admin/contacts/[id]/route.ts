import { adminMutationError, authorizeAdminRequest } from "../../../../../lib/admin-api";
import { parseJsonRequest } from "../../../../../lib/api-security";
import { updateContactRequestStatus } from "../../../../../lib/engagement-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const { id } = await params;
    const payload = await parseJsonRequest(request, 2_000);
    const data = await updateContactRequestStatus(id, payload);
    return Response.json({ data });
  } catch (error) {
    return adminMutationError(error);
  }
}
