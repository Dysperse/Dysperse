import { prisma } from "@/lib/prisma";
import { Profile, Session, Space, SpaceInvite, User } from "@prisma/client";

interface DysperseSession {
  session: Session;
  user: User & { profile: Profile };
  space: SpaceInvite & { space: Space };
}

export async function getSessionData(
  sessionId: string
): Promise<DysperseSession> {
  // throw error if session not found
  const session = await prisma.session.findFirstOrThrow({
    where: {
      id: sessionId,
    },
    include: {
      user: {
        include: {
          profile: true,
          spaces: {
            include: {
              space: true,
            },
          },
        },
      },
    },
  });
  prisma.profile.updateMany({
    where: {
      user: {
        id: session.user.id
      }
    },
    data: {
      lastActive: new Date()
    }
  });
  if (!session) {
    throw new Error("Session not found");
  }
  const _session = {
    session: {
      ...session,
      user: undefined,
    },
    user: {
      ...session.user,
      spaces: undefined,
    },
    space: session.user.spaces.find((s) => s.selected),
  };
  return _session as any;
}
