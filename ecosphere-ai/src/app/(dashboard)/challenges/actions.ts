"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function joinChallenge(challengeId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Check if already joined
  const existing = await prisma.userChallenge.findUnique({
    where: {
      userId_challengeId: { userId, challengeId },
    },
  });

  if (existing) return;

  await prisma.userChallenge.create({
    data: {
      userId,
      challengeId,
      progress: 0,
      completed: false,
    },
  });

  // Add notification
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (challenge) {
    await prisma.notification.create({
      data: {
        userId,
        title: `🏆 Joined Challenge: ${challenge.title}`,
        message: `Goal: Reach ${challenge.targetValue} ${challenge.unit} to unlock ${challenge.xpReward} XP!`,
        type: "CHALLENGE",
      },
    });
  }

  revalidatePath("/challenges");
  revalidatePath("/dashboard");
}
