import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getIdentifiers(req);
    const data = await prisma.collection.findMany({
      where: { userId },
      include: {
        _count: true,
        createdBy: {
          select: {
            email: true,
            username: true,
            profile: { select: { name: true, picture: true } },
          },
        },
      },
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, spaceId } = await getIdentifiers(req);

    const params = await getApiParams(
      req,
      [
        { name: "name", required: true },
        { name: "emoji", required: true },
        { name: "description", required: false },
        { name: "labels", required: true },
      ],
      { type: "BODY" }
    );

    const data = await prisma.collection.create({
      data: {
        name: params.name,
        description: params.description,
        emoji: params.emoji,
        gridOrder: params.labels.map((i) => i.id),
        space: {
          connect: { id: spaceId },
        },
        createdBy: {
          connect: { id: userId },
        },
      },
    });

    await prisma.$transaction(
      params.labels.map((label) => {
        return prisma.label.update({
          where: { id: label },
          data: { collections: { connect: { id: data.id } } },
        });
      })
    );

    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, spaceId } = await getIdentifiers(req);

    const params = await getApiParams(
      req,
      [
        { name: "id", required: true },
        { name: "name", required: false },
        { name: "emoji", required: false },
        { name: "description", required: false },
        { name: "labels", required: false },
        { name: "gridOrder", required: false },
      ],
      { type: "BODY" }
    );

    if (params.name || params.emoji || params.description || params.gridOrder) {
      await prisma.collection.update({
        where: { id: params.id as string },
        data: {
          name: params.name,
          description: params.description,
          emoji: params.emoji,
          gridOrder: params.gridOrder || undefined,
          space: {
            connect: { id: spaceId },
          },
          createdBy: {
            connect: { id: userId },
          },
        },
      });
    }

    if (params.labels) {
      const labels = await prisma.label.findMany({
        where: { userId },
      });
      // If the label is not in the new list, remove it, otherwise add it
      await prisma.$transaction(
        labels.map((label) => {
          return prisma.label.update({
            where: { id: label.id },
            data: {
              collections: {
                [params.labels.includes(label.id) ? "connect" : "disconnect"]: {
                  id: params.id as string,
                },
              },
            },
          });
        })
      );
    }
    return Response.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
