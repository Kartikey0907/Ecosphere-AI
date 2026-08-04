"use client";

import { useState } from "react";
import { addFriend } from "@/app/(dashboard)/community/actions";
import { Loader2, Plus, UserPlus } from "lucide-react";

export default function AddFriendForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage(null);

    try {
      await addFriend(email);
      setMessage({ text: "Friend request sent successfully!", type: "success" });
      setEmail("");
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to send request.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
        <UserPlus className="w-4 h-4 text-emerald-400" />
        <h4 className="font-bold text-xs text-white">Add Eco Friend</h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Invite friends to compare scores, achievements, and participate in community leaderboards.
        </p>

        <div className="flex gap-2">
          <input
            type="email"
            required
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-805 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 disabled:opacity-50 transition-all duration-300 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Request"}
          </button>
        </div>

        {message && (
          <p className={`text-[10px] font-semibold mt-1 ${message.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
