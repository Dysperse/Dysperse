import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // get body
    const params = await getApiParams(req, [{ name: "email", required: true }]);
    const data = await prisma.user.findFirstOrThrow({
      where: {
        email: params.email,
      },
      select: {
        timeZone: true,
        username: true,
        email: true,
        followers: true,
        following: true,
        profile: true,
      },
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    // get body
    const { userId } = await getIdentifiers(req);
    const params = await getApiParams(
      req,
      [
        { name: "color", required: false },
        { name: "darkMode", required: false },
        { name: "pattern", required: false },
      ],
      { type: "BODY" }
    );
    const data = await prisma.profile.updateMany({
      where: {
        user: { id: userId },
      },
      data: {
        theme: params.color || undefined,
        darkMode: params.darkMode ?? undefined,
        pattern: params.pattern ?? undefined,
      },
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
