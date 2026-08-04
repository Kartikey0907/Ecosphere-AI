"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleUserRole(targetUserId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage roles.");
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) return;

  // Don't toggle yourself
  if (user.id === session.user.id) {
    throw new Error("You cannot change your own admin role status.");
  }

  const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  revalidatePath("/admin");
}
