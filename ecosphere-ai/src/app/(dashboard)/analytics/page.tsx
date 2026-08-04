import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getDaysAgo } from "@/lib/utils";
import AnalyticsDashboard from "@/components/charts/AnalyticsDashboard";
import { BarChart3 } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const thirtyDaysAgoStr = getDaysAgo(30);

  // Fetch last 30 days of logs ordered by date asc
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: {
        gte: thirtyDaysAgoStr,
      },
    },
    orderBy: { date: "asc" },
  });

  // Serialize logs for Client Component
  const serializedLogs = logs.map((log) => ({
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
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Analytics Overview</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Deep-dive insights into your daily, weekly, and monthly carbon output, utilities consumption, and transit choices.
        </p>
      </div>

      {/* Analytics Dashboard Component */}
      <AnalyticsDashboard logs={serializedLogs} />
    </div>
  );
}
