import { adminMutationError, authorizeAdminRequest } from "../../../../lib/admin-api";
import { parseJsonRequest } from "../../../../lib/api-security";
import { saveSiteSettings } from "../../../../lib/site-settings-store";

export async function PATCH(request: Request) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const payload = await parseJsonRequest(request, 12_000);
    const data = await saveSiteSettings(payload);
    return Response.json({ data });
  } catch (error) {
    return adminMutationError(error);
  }
}
