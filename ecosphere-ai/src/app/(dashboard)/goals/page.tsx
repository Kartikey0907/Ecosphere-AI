import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { deleteGoal } from "./actions";
import NewGoalForm from "@/components/shared/NewGoalForm";
import { 
  Target, 
  Calendar, 
  Trash2, 
  CheckCircle,
  HelpCircle,
  Flag
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch active and completed goals
  const activeGoals = await prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: { endDate: "asc" },
  });

  const completedGoals = await prisma.goal.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
  });

  const handleDelete = async (id: string) => {
    "use server";
    await deleteGoal(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Sustainability Goals</h2>
            <p className="text-slate-400 text-xs mt-0.5">Define carbon thresholds, conservation levels, and commute milestones.</p>
          </div>
        </div>
        <NewGoalForm />
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Goals (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            Active Targets ({activeGoals.length})
          </h3>

          {activeGoals.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-900 rounded-3xl text-slate-500 text-xs">
              No active goals at the moment. Hit "Create Custom Goal" to start tracking a sustainability target.
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => {
                const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 hover:border-slate-800 transition-all duration-300 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700" />
                    
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-100">{goal.title}</span>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            {goal.category}
                          </span>
                        </div>
                        {goal.description && (
                          <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed">{goal.description}</p>
                        )}
                      </div>
                      
                      {/* Delete */}
                      <form action={handleDelete.bind(null, goal.id)}>
                        <button 
                          type="submit" 
                          className="p-2 rounded-xl bg-slate-950 hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-slate-900 hover:border-red-500/20 transition-all duration-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>

                    {/* Progress details */}
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-semibold">
                          Current progress: <span className="text-white font-extrabold">{goal.currentValue}</span> / {goal.targetValue} {goal.unit}
                        </span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-400" /> Start: {goal.startDate}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-slate-400">
                        <Flag className="w-3 h-3 text-cyan-400" /> Deadline: {goal.endDate}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Archive */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            Completed Archive ({completedGoals.length})
          </h3>

          {completedGoals.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-900 rounded-3xl text-slate-600 text-xs">
              No completed goals yet. Achieve targets to archive them here!
            </div>
          ) : (
            <div className="space-y-3.5">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="p-4 bg-emerald-950/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3 relative group">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-slate-200 truncate">{goal.title}</h4>
                    <p className="text-[9.5px] text-slate-400 mt-0.5">
                      Completed on {goal.endDate}
                    </p>
                    <div className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded mt-2.5 inline-block">
                      +{goal.targetValue} {goal.unit} Target Hit
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
