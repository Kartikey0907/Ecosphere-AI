"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; password?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const updateData: any = { name: data.name };

  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard", "layout");
}
