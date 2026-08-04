import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      xp: true,
      streak: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch count statistics
  const goalsCount = await prisma.goal.count({
    where: { userId },
  });

  const challengesCount = await prisma.userChallenge.count({
    where: { userId, completed: true },
  });

  const achievementsCount = await prisma.userAchievement.count({
    where: { userId },
  });

  const serializedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">User Profile</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Manage your personal details, verify credentials, and review cumulative sustainability achievements.
        </p>
      </div>

      {/* Form */}
      <ProfileForm 
        user={serializedUser} 
        stats={{
          goalsCount,
          challengesCount,
          achievementsCount
        }} 
      />

    </div>
  );
}
