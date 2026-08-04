import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { acceptFriend, removeFriend } from "./actions";
import AddFriendForm from "@/components/community/AddFriendForm";
import { 
  Users, 
  Trophy, 
  Check, 
  X, 
  UserMinus,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function CommunityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 1. Fetch Leaderboard (Weekly)
  const leaderboardEntries = await prisma.leaderboardEntry.findMany({
    where: { period: "WEEKLY" },
    orderBy: { score: "desc" },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
          level: true,
          xp: true,
        },
      },
    },
  });

  // 2. Fetch Pending Friend Requests
  const pendingRequests = await prisma.friend.findMany({
    where: { friendId: userId, status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // 3. Fetch Friends List
  const friends = await prisma.friend.findMany({
    where: { userId, status: "ACCEPTED" },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true,
          xp: true,
          streak: true,
        },
      },
    },
  });

  const handleAccept = async (id: string) => {
    "use server";
    await acceptFriend(id);
  };

  const handleIgnore = async (id: string) => {
    "use server";
    await removeFriend(id); // removing is equivalent to deleting the relation
  };

  const handleRemove = async (id: string) => {
    "use server";
    await removeFriend(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Eco Community</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Connect with other environmental advocates. Track leaderboard placement, invite friends, and share sustainability stats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Leaderboard (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Weekly Eco-Leaderboard
              </h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Updates live</span>
            </div>

            <div className="space-y-3">
              {leaderboardEntries.map((entry, index) => {
                const isCurrentUser = entry.userId === userId;
                const isTopThree = index < 3;
                const podiumColors = ["text-amber-400", "text-slate-300", "text-amber-600"];

                return (
                  <div 
                    key={entry.id} 
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300",
                      isCurrentUser 
                        ? "bg-emerald-500/5 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.02)]" 
                        : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Indicator */}
                      <span className={cn(
                        "w-6 text-center text-xs font-extrabold",
                        isTopThree ? podiumColors[index] : "text-slate-500"
                      )}>
                        #{index + 1}
                      </span>

                      {/* Avatar */}
                      <div className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                        {entry.user.name?.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-slate-200">{entry.user.name}</span>
                          {isCurrentUser && (
                            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500">Level {entry.user.level} Eco Warrior</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-white block">{entry.score}</span>
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Points</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Social utilities */}
        <div className="space-y-6">
          
          {/* Add Friend */}
          <AddFriendForm />

          {/* Pending Friend Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-4">
              <h4 className="font-bold text-xs text-white">Pending Invitations</h4>
              <div className="space-y-2.5">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-900 rounded-xl">
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-slate-200 block truncate">{req.user.name}</span>
                      <span className="text-[9px] text-slate-500 truncate block">{req.user.email}</span>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <form action={handleAccept.bind(null, req.id)}>
                        <button 
                          type="submit" 
                          className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </form>
                      <form action={handleIgnore.bind(null, req.id)}>
                        <button 
                          type="submit" 
                          className="p-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-4">
            <h4 className="font-bold text-xs text-white">My Eco Friends ({friends.length})</h4>

            {friends.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-900 rounded-2xl text-slate-500 text-xs">
                No friends added yet. Connect with others by entering their email address above.
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900/80 rounded-xl group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 bg-slate-900 border border-slate-800 flex items-center justify-center rounded font-bold text-[10px] text-slate-400">
                        {item.friend.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-slate-200 block truncate">{item.friend.name}</span>
                        <span className="text-[8px] text-slate-500 block">Level {item.friend.level} • 🔥 {item.friend.streak}d streak</span>
                      </div>
                    </div>

                    <form action={handleRemove.bind(null, item.id)}>
                      <button 
                        type="submit" 
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 duration-300"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
