"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addFriend(email: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Find friend user
  const friendUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!friendUser) {
    throw new Error("No user found with that email address.");
  }

  if (friendUser.id === userId) {
    throw new Error("You cannot add yourself as a friend.");
  }

  // Check if relation already exists
  const existing = await prisma.friend.findFirst({
    where: {
      OR: [
        { userId, friendId: friendUser.id },
        { userId: friendUser.id, friendId: userId },
      ],
    },
  });

  if (existing) {
    throw new Error("A friend request is already pending or accepted.");
  }

  // Create friend request
  await prisma.friend.create({
    data: {
      userId,
      friendId: friendUser.id,
      status: "PENDING",
    },
  });

  // Create notification for recipient
  await prisma.notification.create({
    data: {
      userId: friendUser.id,
      title: "👥 Friend Request Received",
      message: `${session.user.name || "A user"} sent you a friend request.`,
      type: "SOCIAL",
    },
  });

  revalidatePath("/community");
}

export async function acceptFriend(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const request = await prisma.friend.findUnique({
    where: { id: requestId },
  });

  if (!request || request.friendId !== userId) {
    throw new Error("Invalid request");
  }

  await prisma.friend.update({
    where: { id: requestId },
    data: { status: "ACCEPTED" },
  });

  // Create reverse record to simplify queries
  await prisma.friend.create({
    data: {
      userId,
      friendId: request.userId,
      status: "ACCEPTED",
    },
  });

  // Add award XP
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: 50 } },
  });
  
  await prisma.user.update({
    where: { id: request.userId },
    data: { xp: { increment: 50 } },
  });

  revalidatePath("/community");
}

export async function removeFriend(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const relation = await prisma.friend.findUnique({ where: { id } });
  if (!relation) return;

  // Delete both directions
  await prisma.friend.deleteMany({
    where: {
      OR: [
        { userId: relation.userId, friendId: relation.friendId },
        { userId: relation.friendId, friendId: relation.userId },
      ],
    },
  });

  revalidatePath("/community");
}
