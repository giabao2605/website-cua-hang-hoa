import { adminMutationError, authorizeAdminRequest } from "../../../../../../lib/admin-api";
import { parseJsonRequest } from "../../../../../../lib/api-security";
import { saveAdminOrderArchived } from "../../../../../../lib/admin-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const { id } = await params;
    const data = await saveAdminOrderArchived(id, await parseJsonRequest(request, 2_000), authorization.user.id);
    return Response.json({ data });
  } catch (error) {
    return adminMutationError(error);
  }
}
