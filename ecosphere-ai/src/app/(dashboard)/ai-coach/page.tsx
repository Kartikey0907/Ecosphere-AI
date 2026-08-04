import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { generateWeeklyReport } from "@/lib/ai-engine";
import AiCoachChat from "@/components/ai-coach/AiCoachChat";
import { MessageSquare, Sparkles } from "lucide-react";

export default async function AiCoachPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch recent logs (last 7 days) to build the weekly report
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true },
  });

  const recentLogs = await prisma.dailyLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 7,
  });

  // Convert schema logs into client type logs
  const clientLogs = recentLogs.map((log) => ({
    id: log.id,
    userId: log.userId,
    date: log.date,
    carKm: log.carKm,
    busKm: log.busKm,
    trainKm: log.trainKm,
    bikeKm: log.bikeKm,
    walkKm: log.walkKm,
    flightKm: log.flightKm,
    waterUsage: log.waterUsage,
    electricityUsage: log.electricityUsage,
    meatMeals: log.meatMeals,
    vegMeals: log.vegMeals,
    veganMeals: log.veganMeals,
    plasticItems: log.plasticItems,
    recycledItems: log.recycledItems,
    compostedKg: log.compostedKg,
    newClothingItems: log.newClothingItems,
    secondHandItems: log.secondHandItems,
    carbonFootprint: log.carbonFootprint,
    createdAt: log.createdAt.toISOString(),
  }));

  const weeklyReport = generateWeeklyReport(clientLogs, user?.streak ?? 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Gaia AI Sustainability Coach</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Get real-time feedback on your logging history, generate sustainability forecasting, and ask questions about your carbon footprint.
        </p>
      </div>

      {/* AI Coach Chat Client */}
      <AiCoachChat weeklyReport={weeklyReport} />

    </div>
  );
}
