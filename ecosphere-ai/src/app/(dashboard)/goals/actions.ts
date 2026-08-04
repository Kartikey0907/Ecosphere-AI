"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createGoal(data: {
  title: string;
  description: string;
  category: string;
  targetValue: number;
  unit: string;
  endDate: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const todayStr = new Date().toISOString().split("T")[0];

  await prisma.goal.create({
    data: {
      userId,
      title: data.title,
      description: data.description || "",
      category: data.category,
      targetValue: data.targetValue,
      unit: data.unit,
      startDate: todayStr,
      endDate: data.endDate,
      status: "ACTIVE",
    },
  });

  // Award XP for setting a goal
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: 50 },
    },
  });

  // Add notification
  await prisma.notification.create({
    data: {
      userId,
      title: "🎯 Goal Created!",
      message: `You've set a target to: ${data.title}. Earn XP upon completion!`,
      type: "GOAL",
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.goal.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}
