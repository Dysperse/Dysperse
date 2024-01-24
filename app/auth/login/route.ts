import { getApiParams } from "@/lib/getApiParams";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // get body
    const params = await getApiParams(
      req,
      [
        { name: "email", required: true },
        { name: "password", required: true },
      ],
      { type: "BODY" }
    );

    const acc = await prisma.user.findFirstOrThrow({
      where: {
        email: params.email,
      },
    });

    // Validate password
    const valid = await argon2.verify(acc.password, params.password);
    if (!valid) throw new Error("Invalid password");

    const session = await prisma.session.create({
      data: {
        userId: acc.id,
      },
    });

    return Response.json({
      success: true,
      session: session.id,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
