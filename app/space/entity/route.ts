import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, spaceId } = await getIdentifiers(req);

    const params = await getApiParams(
      req,
      [
        { name: "name", required: true },
        { name: "type", required: true },
        { name: "note", required: false },
        { name: "due", required: false },
        { name: "dateOnly", required: false },
        { name: "pinned", required: false },
        { name: "labelId", required: false },
        { name: "notifications", required: false },
        { name: "agendaOrder", required: false },
        { name: "collectionId", required: false },
      ],
      { type: "BODY" }
    );
    const space = await prisma.entity.create({
      data: {
        name: params.name,
        type: params.type,
        note: params.note,
        agendaOrder: params.agendaOrder || "0|hzzzzz:",
        due: params.due ? new Date(params.due) : undefined,
        dateOnly: Boolean(params.dateOnly ?? true),
        pinned: Boolean(params.pinned ?? false),
        notifications: params.notifications,
        collection: params.collectionId
          ? { connect: { id: params.collectionId } }
          : undefined,
        label: params.labelId
          ? {
              connect: {
                id: params.labelId,
              },
            }
          : undefined,
        space: {
          connect: {
            id: spaceId,
          },
        },
        history: {
          create: {
            type: "CREATE",
            data: "Created a " + params.type.toLowerCase(),
            who: { connect: { id: userId } },
          },
        },
      },
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
    });
    return Response.json(space);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { spaceId } = await getIdentifiers(req);
    const params = await getApiParams(req, [{ name: "id", required: true }]);
    const data = await prisma.entity.findFirstOrThrow({
      where: {
        AND: [{ id: params.id }, { spaceId }],
      },
      include: {
        attachments: true,
        completionInstances: {
          take: 1,
        },
        history: {
          include: {
            who: {
              select: {
                username: true,
                email: true,
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
        label: true,
        space: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { spaceId } = await getIdentifiers(req);
    const params = await getApiParams(req, [{ name: "id", required: true }]);
    const data = await prisma.entity.updateMany({
      where: {
        AND: [{ id: params.id }, { spaceId }],
      },
      data: {
        trash: true,
      },
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { spaceId } = await getIdentifiers(req);
    const params = await getApiParams(req, [
      { name: "id", required: true },
      { name: "name", required: false },
      { name: "pinned", required: false },
      { name: "due", required: false },
      { name: "note", required: false },
      { name: "labelId", required: false },
      { name: "trash", required: false },
      { name: "agendaOrder", required: false },
    ]);
    const data = await prisma.entity.updateMany({
      where: {
        AND: [{ spaceId }, { id: params.id }],
      },
      data: {
        name: params.name ?? undefined,
        labelId: params.labelId ?? undefined,
        pinned:
          typeof params.pinned === "string"
            ? params.pinned === "true"
            : undefined,
        due: params.due ? new Date(params.due) : undefined,
        note: typeof params.note === "string" ? params.note : undefined,
        agendaOrder:
          typeof params.agendaOrder === "string"
            ? params.agendaOrder
            : undefined,
        trash:
          typeof params.trash === "string"
            ? params.trash === "true"
            : undefined,
      },
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
