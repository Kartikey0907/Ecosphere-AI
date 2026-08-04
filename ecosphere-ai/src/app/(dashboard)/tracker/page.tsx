import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getToday } from "@/lib/utils";
import TrackerForm from "@/components/tracker/TrackerForm";
import { CalendarDays, Info } from "lucide-react";

export default async function TrackerPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const todayStr = getToday();

  // Fetch today's log if it exists
  const todayLog = await prisma.dailyLog.findUnique({
    where: {
      userId_date: {
        userId,
        date: todayStr,
      },
    },
  });

  // Convert Date objects to strings for Client Component serialization
  const serializedLog = todayLog ? {
    id: todayLog.id,
    userId: todayLog.userId,
    date: todayLog.date,
    carKm: todayLog.carKm,
    busKm: todayLog.busKm,
    trainKm: todayLog.trainKm,
    bikeKm: todayLog.bikeKm,
    walkKm: todayLog.walkKm,
    flightKm: todayLog.flightKm,
    waterUsage: todayLog.waterUsage,
    electricityUsage: todayLog.electricityUsage,
    meatMeals: todayLog.meatMeals,
    vegMeals: todayLog.vegMeals,
    veganMeals: todayLog.veganMeals,
    plasticItems: todayLog.plasticItems,
    recycledItems: todayLog.recycledItems,
    compostedKg: todayLog.compostedKg,
    newClothingItems: todayLog.newClothingItems,
    secondHandItems: todayLog.secondHandItems,
    carbonFootprint: todayLog.carbonFootprint,
  } : null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Daily Activity Tracker</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Log your daily environmental actions. Gaia AI will automatically calculate your carbon footprint and award you XP for sustainable choices.
        </p>
      </div>

      {/* Info Warning */}
      <div className="flex items-start gap-3 p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-400 text-xs">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          You can update your entries for today at any time. Saving your log updates your sustainability score in real-time and counts toward active challenges.
        </p>
      </div>

      {/* Tracker Form Component */}
      <TrackerForm initialLog={serializedLog} />
    </div>
  );
}
