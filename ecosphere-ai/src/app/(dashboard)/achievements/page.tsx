import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Award, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const { cat: activeCat = "ALL" } = await searchParams;

  // Fetch all achievements
  const allAchievements = await prisma.achievement.findMany({
    orderBy: { xpReward: "asc" },
  });

  // Fetch user unlocked achievements
  const userUnlocked = await prisma.userAchievement.findMany({
    where: { userId },
  });

  const unlockedIds = new Set(userUnlocked.map((ua) => ua.achievementId));

  const filteredAchievements = allAchievements.filter((ach) => {
    if (activeCat === "ALL") return true;
    return ach.category === activeCat;
  });

  const categories = [
    { id: "ALL", label: "All Badges" },
    { id: "CARBON", label: "Carbon" },
    { id: "WATER", label: "Water" },
    { id: "ENERGY", label: "Energy" },
    { id: "STREAKS", label: "Streaks" },
    { id: "SOCIAL", label: "Social" },
    { id: "GENERAL", label: "General" },
  ];

  const unlockedCount = userUnlocked.length;
  const totalCount = allAchievements.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-cyan-950/20 border border-slate-800/80 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Achievement Badges</h2>
            <p className="text-slate-400 text-xs mt-1">Unlock badges by reaching carbon milestones, utility conservation targets, and consistency records.</p>
          </div>
        </div>

        {/* Aggregate Progress */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 bg-slate-950/40 border border-slate-900 rounded-2xl p-4 min-w-[200px]">
          <div className="flex items-center justify-between w-full text-xs">
            <span className="text-slate-400 font-medium">Badges Unlocked</span>
            <span className="text-emerald-400 font-extrabold">{unlockedCount} / {totalCount}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">{progressPercent}% Completed</span>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map((cat) => {
          const isActive = activeCat === cat.id;
          return (
            <Link
              key={cat.id}
              href={`/achievements?cat=${cat.id}`}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 border",
                isActive
                  ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10"
                  : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
              )}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAchievements.map((ach) => {
          const isUnlocked = unlockedIds.has(ach.id);
          
          return (
            <div 
              key={ach.id} 
              className={cn(
                "bg-slate-900/40 border rounded-3xl p-5 hover:border-slate-800 transition-all duration-300 flex flex-col items-center justify-between text-center relative overflow-hidden group h-[200px]",
                isUnlocked 
                  ? "border-emerald-500/30 bg-emerald-950/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                  : "border-slate-850 opacity-60 hover:opacity-80"
              )}
            >
              {isUnlocked && (
                <div className="absolute top-2 right-2 p-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Badge Icon */}
              <div className="relative mt-2">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 shadow-md",
                  isUnlocked 
                    ? "bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30" 
                    : "bg-slate-950 border border-slate-900 text-slate-600"
                )}>
                  {isUnlocked ? ach.icon : <Lock className="w-6 h-6 stroke-[2.5px]" />}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 my-3">
                <h4 className={cn("font-bold text-xs", isUnlocked ? "text-slate-100" : "text-slate-500")}>
                  {ach.name}
                </h4>
                <p className="text-[9.5px] text-slate-400 leading-normal px-2 max-w-[180px]">
                  {ach.description}
                </p>
              </div>

              {/* Rewards */}
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded",
                isUnlocked 
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
                  : "text-slate-500 bg-slate-950 border border-slate-900"
              )}>
                {isUnlocked ? "UNLOCKED" : `+${ach.xpReward} XP`}
              </span>

            </div>
          );
        })}
      </div>

    </div>
  );
}
