import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getIdentifiers(req);
    const params = await getApiParams(req, [
      { name: "requests", required: false },
    ]);

    // get body
    const data = await prisma.follows.findMany({
      where: {
        AND: [
          { OR: [{ followerId: userId }, { followingId: userId }] },
          { accepted: params.requests ? undefined : true },
        ],
      },
      select: {
        accepted: true,
        followerId: true,
        followingId: true,
        follower: {
          select: { id: true, email: true, username: true, profile: true },
        },
        following: {
          select: { id: true, email: true, username: true, profile: true },
        },
      },
    });
    // make
    data.map((user) => {
      if (user.follower.id === userId) {
        user.follower = undefined as any;
        user["user"] = user.following;
        user.following = undefined as any;
      } else if (user.following.id === userId) {
        user.following = undefined as any;
        user["user"] = user.follower;
        user.follower = undefined as any;
      }
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getIdentifiers(req);
    // get body
    const params = await getApiParams(
      req,
      [{ name: "email", required: true }],
      { type: "BODY" }
    );

    // get body
    const followingIdRequest = await prisma.user.findFirstOrThrow({
      where: {
        OR: [{ username: params.email }, { email: params.email }],
      },
    });
    const followingId = followingIdRequest.id;
    const data = await prisma.follows.create({
      data: {
        follower: {
          connect: {
            id: userId,
          },
        },
        following: {
          connect: {
            id: followingId,
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
    const { userId } = await getIdentifiers(req);
    // get body
    const params = await getApiParams(
      req,
      [{ name: "userId", required: true }],
      { type: "BODY" }
    );

    const data = await prisma.follows.deleteMany({
      where: {
        OR: [
          {
            AND: [{ followerId: userId }, { followingId: params.userId }],
          },
          {
            AND: [{ followerId: params.userId }, { followingId: userId }],
          },
        ],
      },
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await getIdentifiers(req);
    // get body
    const params = await getApiParams(
      req,
      [
        { name: "blocked", required: false },
        { name: "accepted", required: false },
        { name: "followerId", required: true },
        { name: "followingId", required: true },
      ],
      { type: "BODY" }
    );

    const data = await prisma.follows.update({
      where: {
        followerId_followingId: {
          followerId: params.followerId,
          followingId: params.followingId,
        },
      },
      data: {
        blocked:
          typeof params.blocked === "boolean"
            ? Boolean(params.blocked)
            : undefined,
        accepted:
          typeof params.accepted === "boolean"
            ? Boolean(params.accepted)
            : undefined,
      },
    });
    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
