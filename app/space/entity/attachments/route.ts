import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getIdentifiers(req);
    const params = await getApiParams(
      req,
      [
        { name: "id", required: true },
        { name: "type", required: true },
        { name: "data", required: true },
      ],
      { type: "BODY" }
    );

    const data = await prisma.entityAttachment.create({
      data: {
        data: params.data,
        type: params.type,
        entity: { connect: { id: params.id } },
      },
    });

    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
