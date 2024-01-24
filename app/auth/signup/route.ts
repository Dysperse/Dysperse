import { getApiParams } from "@/lib/getApiParams";
import { getSessionData } from "@/lib/getSessionData";
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
        { name: "name", required: true },
        { name: "email", required: true },
        { name: "password", required: true },
      ],
      { type: "BODY" }
    );

    const password = await argon2.hash(params.password);

    const acc = await prisma.user.create({
      data: {
        email: params.email,
        password,
        profile: {
          create: {
            name: params.name,
          },
        },
        spaces: {
          create: {
            space: {
              create: {
                name: `${params.name}'s space`,
              },
            },
          },
        },
        sessions: {
          create: {},
        },
      },
      select: {
        sessions: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    const user = await getSessionData(acc.sessions[0].id);
    return Response.json(user);
  } catch (e) {
    return handleApiError(e);
  }
}
