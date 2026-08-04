"use server";

import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}

export async function markNotificationRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    revalidatePath("/dashboard", "layout");
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

export async function markAllNotificationsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    revalidatePath("/dashboard", "layout");
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
  }
}
