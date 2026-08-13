import { adminMutationError, authorizeAdminRequest } from "../../../../lib/admin-api";
import { parseJsonRequest } from "../../../../lib/api-security";
import { createShippingRule } from "../../../../lib/admin-store";

export async function POST(request: Request) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const payload = await parseJsonRequest(request, 8_000);
    const data = await createShippingRule(payload);
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return adminMutationError(error);
  }
}
