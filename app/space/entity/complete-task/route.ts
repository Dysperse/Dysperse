import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, spaceId } = await getIdentifiers(req);

    const params = await getApiParams(req, [{ name: "id", required: true }], {
      type: "BODY",
    });

    const [instance, audit] = await Promise.all([
      prisma.completionInstance.create({
        data: {
          task: { connect: { id: params.id } },
        },
      }),
      prisma.audit.create({
        data: {
          type: "COMPLETE_TASK",
          data: "Marked complete",
          who: { connect: { id: userId } },
          entity: { connect: { id: params.id } },
        },
      }),
    ]);

    return Response.json({ instance, audit });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, spaceId } = await getIdentifiers(req);

    const params = await getApiParams(
      req,
      [
        { name: "id", required: true },
        { name: "recurring", required: true },
      ],
      {
        type: "BODY",
      }
    );
    if (params.recurring) {
      throw new Error("Coming soon!");
    }

    const [instance, audit] = await Promise.all([
      prisma.completionInstance.deleteMany({
        where: {
          task: { id: params.id },
        },
      }),
      prisma.audit.create({
        data: {
          type: "COMPLETE_TASK",
          data: "Marked incomplete",
          who: { connect: { id: userId } },
          entity: { connect: { id: params.id } },
        },
      }),
    ]);

    return Response.json({ instance, audit });
  } catch (e) {
    return handleApiError(e);
  }
}
