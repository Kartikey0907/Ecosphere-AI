import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { toggleUserRole } from "./actions";
import { 
  ShieldAlert, 
  Users, 
  Database, 
  Target, 
  UserCheck, 
  TrendingUp, 
  Calendar
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default async function AdminPage() {
  const session = await auth();
  
  // Gate check
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // 1. Fetch Platform aggregates
  const usersCount = await prisma.user.count();
  const logsCount = await prisma.dailyLog.count();
  const goalsCount = await prisma.goal.count();
  const challengesCount = await prisma.challenge.count();

  // 2. Fetch User lists
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      level: true,
      streak: true,
      createdAt: true,
    },
  });

  const handleRoleToggle = async (userId: string) => {
    "use server";
    try {
      await toggleUserRole(userId);
    } catch (err: any) {
      // In server components, errors can be logged or returned
      console.error(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="flex items-center gap-2.5">
        <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20 text-red-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Admin Console</h2>
          <p className="text-slate-400 text-xs mt-0.5">Control platform memberships, role hierarchy definitions, and view audit summaries.</p>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {/* Users */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Registered Users</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{formatNumber(usersCount)}</span>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Activity Logs</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{formatNumber(logsCount)}</span>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Custom Goals</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{formatNumber(goalsCount)}</span>
          </div>
        </div>

        {/* Challenges */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Active Missions</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{formatNumber(challengesCount)}</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">Platform Users Directory</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === session.user.id;
                return (
                  <tr key={u.id} className="border-b border-slate-900 hover:bg-slate-950/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{u.name || "User"}</td>
                    <td className="py-3.5 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        u.role === "ADMIN" 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                          : "bg-slate-950 text-slate-400 border border-slate-900"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">Level {u.level}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">🔥 {u.streak}d</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      {!isSelf ? (
                        <form action={handleRoleToggle.bind(null, u.id)}>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Toggle Role
                          </button>
                        </form>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-semibold italic">Current Session</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
