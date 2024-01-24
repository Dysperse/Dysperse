import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getIdentifiers(req);
    const tabs = await prisma.spaceInvite.findMany({
      where: { userId },
      include: { space: { include: { _count: true } } },
    });
    return Response.json(tabs);
  } catch (e) {
    return handleApiError(e);
  }
}
