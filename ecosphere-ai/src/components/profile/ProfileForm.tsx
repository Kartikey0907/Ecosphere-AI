"use client";

import { useState } from "react";
import { updateProfile } from "@/app/(dashboard)/profile/actions";
import { 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  Check, 
  Award, 
  Target, 
  Flame 
} from "lucide-react";
import { getLevelFromXp, getLevelColor } from "@/lib/xp-engine";

interface ProfileFormProps {
  user: {
    name: string | null;
    email: string;
    xp: number;
    streak: number;
    createdAt: string;
  };
  stats: {
    goalsCount: number;
    challengesCount: number;
    achievementsCount: number;
  };
}

export default function ProfileForm({ user, stats }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const levelInfo = getLevelFromXp(user.xp);
  const levelColor = getLevelColor(levelInfo.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setSuccess(false);

    try {
      await updateProfile({
        name,
        ...(password ? { password } : {}),
      });
      setSuccess(true);
      setPassword("");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-900 pb-3">
            Account Credentials
          </h3>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-slate-950/60 border border-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Display Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Update Password (optional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-between items-center border-t border-slate-900/60 pt-4 mt-6">
            <div>
              {success && (
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[2.5px]" /> Profile updated successfully!
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/10 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Profile Overview Card (Sidebar) */}
      <div className="space-y-6">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700" />

          {/* Initials avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-2xl text-slate-950 shadow-lg">
            {name ? name.slice(0, 2).toUpperCase() : "US"}
          </div>

          <h3 className="font-bold text-sm text-slate-200 mt-4">{name || "User"}</h3>
          <span className="text-[9px] text-slate-500 font-semibold">Joined {new Date(user.createdAt).toLocaleDateString()}</span>

          {/* Level Details */}
          <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-400">Level {levelInfo.level}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: `${levelColor}15`, color: levelColor }}>
                {levelInfo.name}
              </span>
            </div>
            
            {/* XP progress */}
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850 mt-1">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                style={{ width: `${levelInfo.progress * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 font-medium">
              {user.xp} XP Cumulative
            </span>
          </div>

          {/* Mini Stats list */}
          <div className="grid grid-cols-3 gap-3 w-full border-t border-slate-900 pt-4 mt-6 text-center">
            <div>
              <Target className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="font-extrabold text-xs text-white block">{stats.goalsCount}</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Goals</span>
            </div>
            <div>
              <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="font-extrabold text-xs text-white block">{stats.achievementsCount}</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Badges</span>
            </div>
            <div>
              <Flame className="w-4 h-4 text-red-400 mx-auto mb-1 animate-pulse" />
              <span className="font-extrabold text-xs text-white block">{user.streak}d</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Streak</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
