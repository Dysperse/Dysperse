import { getIdentifiers } from "@/lib/getIdentifiers";
import { getSessionData } from "@/lib/getSessionData";
import { handleApiError } from "@/lib/handleApiError";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // get body
    const { sessionId } = await getIdentifiers(req);
    const user = await getSessionData(sessionId);

    return Response.json(user);
  } catch (e) {
    return handleApiError(e);
  }
}
