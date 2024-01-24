import { getApiParams } from "@/lib/getApiParams";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { spaceId } = await getApiParams(req, [
      { name: "spaceId", required: true },
    ]);

    const space = await prisma.space.findFirstOrThrow({
      where: {
        id: spaceId,
      },
      select: {
        name: true,
        color: true,
        pattern: true,
        _count: true,
        integrations: true,
        members: {
          select: {
            id: true,
            access: true,
            user: {
              select: {
                profile: {
                  select: {
                    name: true,
                    picture: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return Response.json(space);
  } catch (e) {
    return handleApiError(e);
  }
}
