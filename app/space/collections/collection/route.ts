import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { NextRequest } from "next/server";

export const entitiesSelection: Prisma.Collection$entitiesArgs<DefaultArgs> = {
  include: {
    completionInstances: true,
    label: true,
    attachments: {
      select: {
        data: true,
        type: true,
      },
    },
  },
  where: {
    trash: false,
  },
};

export async function GET(req: NextRequest) {
  try {
    const { spaceId, userId } = await getIdentifiers(req);
    const params = await getApiParams(req, [
      { name: "id", required: true },
      { name: "all", required: false },
    ]);

    if (params.all) {
      const labeledEntities = await prisma.label.findMany({
        where: { spaceId },
        include: {
          entities: entitiesSelection,
        },
      });
      const unlabeledEntities = await prisma.entity.findMany({
        where: {
          AND: [{ spaceId }, { label: null }],
        },
        ...entitiesSelection,
      });
      return Response.json({
        gridOrder: labeledEntities.map((label) => label.id),
        labels: labeledEntities,
        entities: unlabeledEntities,
      });
    }

    const data = await prisma.collection.findFirstOrThrow({
      where: {
        AND: [{ userId }, { id: params.id }],
      },
      include: {
        _count: true,
        entities: {
          ...entitiesSelection,
          where: {
            AND: [{ trash: false }, { label: null }],
          },
        },
        labels: {
          include: {
            entities: entitiesSelection,
          },
        },
      },
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
