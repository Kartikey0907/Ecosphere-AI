import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { joinChallenge } from "./actions";
import { 
  Trophy, 
  Flame, 
  Compass, 
  Calendar, 
  Clock, 
  Sparkles,
  CheckCircle,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  
  // Resolve searchParams type awaitable
  const { type: activeTab = "DAILY" } = await searchParams;

  // Fetch all active challenges
  const challenges = await prisma.challenge.findMany({
    where: { active: true, type: activeTab },
    orderBy: { xpReward: "asc" },
  });

  // Fetch user's joined challenges
  const userChallenges = await prisma.userChallenge.findMany({
    where: { userId },
    include: { challenge: true },
  });

  const joinedMap = new Map(
    userChallenges.map((uc) => [uc.challengeId, uc])
  );

  const handleJoin = async (id: string) => {
    "use server";
    await joinChallenge(id);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "EASY": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "MEDIUM": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "HARD": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "EPIC": return "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const tabs = [
    { id: "DAILY", label: "Daily Missions", icon: Flame },
    { id: "WEEKLY", label: "Weekly Tasks", icon: Calendar },
    { id: "MONTHLY", label: "Monthly Crusades", icon: Clock },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sustainability Challenges</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Participate in community challenges. Completing daily, weekly, or monthly sustainability goals rewards you with massive XP!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/50 p-1 border border-slate-800 rounded-2xl self-start w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <Link
              key={t.id}
              href={`/challenges?type=${t.id}`}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300",
                isActive 
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-900/10 border border-dashed border-slate-900 rounded-3xl text-slate-500 text-xs">
            No challenges available for this category right now. Check back tomorrow!
          </div>
        ) : (
          challenges.map((challenge) => {
            const joinedEntry = joinedMap.get(challenge.id);
            const progress = joinedEntry ? Math.min(100, Math.round((joinedEntry.progress / challenge.targetValue) * 100)) : 0;
            const isCompleted = joinedEntry?.completed ?? false;

            return (
              <div 
                key={challenge.id} 
                className={cn(
                  "bg-slate-900/40 border rounded-3xl p-5 hover:border-slate-800 transition-all duration-300 flex flex-col justify-between h-[230px] relative overflow-hidden group",
                  isCompleted ? "border-emerald-500/30 bg-emerald-950/5" : "border-slate-800/80"
                )}
              >
                {/* Background lighting */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-700" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{challenge.icon}</span>
                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider", getDifficultyColor(challenge.difficulty))}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">{challenge.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-[240px]">{challenge.description}</p>
                </div>

                <div className="mt-4 space-y-3.5">
                  {/* Join or Progress rendering */}
                  {!joinedEntry ? (
                    <div className="flex items-center justify-between border-t border-slate-900/60 pt-4">
                      <span className="text-amber-400 font-bold text-xs">+{challenge.xpReward} XP</span>
                      <form action={handleJoin.bind(null, challenge.id)}>
                        <button 
                          type="submit" 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-850 text-[10px] font-bold transition-all duration-300"
                        >
                          <Plus className="w-3.5 h-3.5" /> Join Challenge
                        </button>
                      </form>
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center justify-between border-t border-slate-900/60 pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <CheckCircle className="w-4 h-4" /> Challenge Completed!
                      </div>
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                        +{challenge.xpReward} XP Claimed
                      </span>
                    </div>
                  ) : (
                    <div className="border-t border-slate-900/60 pt-4 space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">
                          Progress: {joinedEntry.progress} / {challenge.targetValue} {challenge.unit}
                        </span>
                        <span className="text-amber-400 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

// Ensure Link is imported correctly
import Link from "next/link";
