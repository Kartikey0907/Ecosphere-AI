"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CalendarDays, 
  BarChart3, 
  Target, 
  Trophy, 
  Award, 
  Users, 
  MessageSquare, 
  User, 
  ShieldAlert,
  LogOut,
  Leaf
} from "lucide-react";
import { getLevelFromXp, getLevelColor } from "@/lib/xp-engine";

interface SidebarProps {
  user: {
    name: string | null;
    avatar: string | null;
    level: number;
    xp: number;
    streak: number;
    role: string;
  } | null;
  signOutAction: () => Promise<void>;
}

export default function Sidebar({ user, signOutAction }: SidebarProps) {
  const pathname = usePathname();
  
  if (!user) return null;

  const { name, xp, streak, role } = user;
  const levelInfo = getLevelFromXp(xp);
  const levelColor = getLevelColor(levelInfo.name);

  const mainNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Daily Tracker", href: "/tracker", icon: CalendarDays },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Goals", href: "/goals", icon: Target },
    { label: "Challenges", href: "/challenges", icon: Trophy },
    { label: "Achievements", href: "/achievements", icon: Award },
    { label: "Community", href: "/community", icon: Users },
    { label: "AI Coach", href: "/ai-coach", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const isAdmin = role === "ADMIN";

  return (
    <aside className="w-64 bg-slate-950/70 border-r border-slate-800 backdrop-blur-xl flex flex-col h-screen sticky top-0 text-slate-200">
      {/* Brand logo */}
      <div className="p-6 border-b border-slate-900 flex items-center gap-3">
        <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Leaf className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            EcoSphere AI
          </h1>
          <span className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase">Sustainability Hub</span>
        </div>
      </div>

      {/* User Status Card */}
      <div className="p-4 mx-4 mt-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
            {name ? name.slice(0, 2).toUpperCase() : "US"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{name || "User"}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-slate-400">Level {levelInfo.level}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold" style={{ backgroundColor: `${levelColor}20`, color: levelColor }}>
                {levelInfo.name}
              </span>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>{levelInfo.currentXp} XP</span>
            <span>{levelInfo.xpForNextLevel} XP to Level {levelInfo.level + 1}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              style={{ width: `${levelInfo.progress * 100}%` }}
            />
          </div>
        </div>

        {/* Streak Counter */}
        {streak > 0 && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-semibold animate-pulse">
            🔥 {streak} Day Streak
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 shadow-[inset_4px_0_12px_rgba(16,185,129,0.05)]" 
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"
              )} />
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-900">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Options</p>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
                pathname === "/admin" 
                  ? "bg-red-500/10 text-red-400 border-l-2 border-red-500" 
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              )}
            >
              <ShieldAlert className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-900">
        <button
          onClick={() => signOutAction()}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
