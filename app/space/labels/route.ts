import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { spaceId } = await getIdentifiers(req);
    const labels = await prisma.label.findMany({
      where: { spaceId },
      include: { _count: true },
    });
    return Response.json(labels);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await getIdentifiers(req);
    const params = await getApiParams(
      req,
      [
        { name: "id", required: true },
        { name: "name", required: false },
        { name: "color", required: false },
        { name: "emoji", required: false },
      ],
      { type: "BODY" }
    );
    const labels = await prisma.label.update({
      where: { id: params.id },
      data: {
        name: params.name ?? undefined,
        color: params.color ?? undefined,
        emoji: params.emoji ?? undefined,
      },
    });
    return Response.json(labels);
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
        { name: "color", required: true },
        { name: "emoji", required: true },
      ],
      { type: "BODY" }
    );

    const data = await prisma.label.create({
      data: {
        name: params.name,
        color: params.color,
        emoji: params.emoji,
        spaceId,
        userId,
      },
    });

    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
