import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Leaf, 
  Flame, 
  Droplet, 
  Zap, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Sparkles,
  Target,
  Trophy,
  CalendarPlus
} from "lucide-react";
import { getToday, getDaysAgo, percentChange, formatNumber } from "@/lib/utils";
import { DAILY_AVERAGES } from "@/lib/carbon-calculator";
import { getLevelFromXp, getLevelColor } from "@/lib/xp-engine";
import { getScoreLabel } from "@/lib/score-calculator";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const todayStr = getToday();
  const sevenDaysAgoStr = getDaysAgo(7);

  // 1. Fetch User Data
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Today's Daily Log
  const todayLog = await prisma.dailyLog.findUnique({
    where: {
      userId_date: {
        userId,
        date: todayStr,
      },
    },
  });

  // 3. Fetch Recent Logs (last 7 days)
  const recentLogs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: {
        gte: sevenDaysAgoStr,
      },
    },
    orderBy: { date: "asc" },
  });

  // 4. Fetch Latest Sustainability Score
  const latestScore = await prisma.sustainabilityScore.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  // 5. Fetch Active Goals
  const activeGoals = await prisma.goal.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    take: 3,
    orderBy: { endDate: "asc" },
  });

  // 6. Fetch Active Challenges
  const userChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      completed: false,
    },
    include: {
      challenge: true,
    },
    take: 3,
  });

  // 7. Fetch Latest AI Insight
  const latestInsight = await prisma.aiInsight.findFirst({
    where: { userId, dismissed: false },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const levelInfo = getLevelFromXp(user.xp);
  const levelColor = getLevelColor(levelInfo.name);

  // Carbon stats
  const carbonToday = todayLog?.carbonFootprint ?? 0;
  const carbonWeeklyAvg = recentLogs.length > 0
    ? recentLogs.reduce((sum, log) => sum + log.carbonFootprint, 0) / recentLogs.length
    : 0;
  const carbonChange = percentChange(carbonWeeklyAvg, DAILY_AVERAGES.carbonFootprint);

  // Water stats
  const waterToday = todayLog?.waterUsage ?? 0;
  const waterWeeklyAvg = recentLogs.length > 0
    ? recentLogs.reduce((sum, log) => sum + log.waterUsage, 0) / recentLogs.length
    : 0;

  // Electricity stats
  const electricityToday = todayLog?.electricityUsage ?? 0;
  const electricityWeeklyAvg = recentLogs.length > 0
    ? recentLogs.reduce((sum, log) => sum + log.electricityUsage, 0) / recentLogs.length
    : 0;

  // Waste stats
  const plasticToday = todayLog?.plasticItems ?? 0;
  const recycledToday = todayLog?.recycledItems ?? 0;

  // Score details
  const score = latestScore?.overallScore ?? 50;
  const scoreInfo = getScoreLabel(score);

  // Eco Avatar SVG rendering logic based on score
  const renderEcoAvatar = (scoreValue: number) => {
    let treeColor = "#059669"; // Emerald
    let leavesCount = 5;
    let groundColor = "#064e3b";
    let message = "Your ecosystem is thriving!";
    
    if (scoreValue >= 80) {
      treeColor = "#10b981"; // Vibrant Emerald
      leavesCount = 7;
      groundColor = "#064e3b";
      message = "Excellent! Your forest is lush and healthy.";
    } else if (scoreValue >= 60) {
      treeColor = "#34d399"; // Green
      leavesCount = 5;
      groundColor = "#022c22";
      message = "Good job! Keep going to make your tree grow.";
    } else if (scoreValue >= 40) {
      treeColor = "#f59e0b"; // Amber
      leavesCount = 3;
      groundColor = "#451a03";
      message = "Fair. Your ecosystem needs some attention.";
    } else {
      treeColor = "#ef4444"; // Red
      leavesCount = 1;
      groundColor = "#1c1917";
      message = "Warning! Your ecosystem is under stress.";
    }

    return (
      <div className="flex flex-col items-center p-6 bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-slate-300 self-start mb-4 flex items-center gap-1.5">
          <Leaf className="w-4 h-4 text-emerald-400" /> Interactive Eco-Avatar
        </h3>
        
        <div className="relative w-48 h-48 flex items-center justify-center bg-slate-950/60 rounded-full border border-slate-800/50 overflow-hidden shadow-inner group">
          {/* Animated background glow */}
          <div 
            className="absolute inset-0 opacity-10 blur-xl transition-all duration-1000 group-hover:opacity-25"
            style={{ backgroundColor: treeColor }}
          />
          
          <svg className="w-40 h-40 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100">
            {/* Sky */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(30, 41, 59, 0.2)" strokeWidth="1" />
            
            {/* Hills/Ground */}
            <path d="M 10 80 Q 50 65 90 80 L 90 95 L 10 95 Z" fill={groundColor} className="transition-colors duration-1000" />
            
            {/* Trunk */}
            <path d="M 47 80 L 47 50 Q 47 45 42 40 L 45 38 Q 50 44 50 50 L 53 50 Q 53 42 58 37 L 61 39 Q 55 46 53 80 Z" fill="#78350f" />
            
            {/* Leaves (circles) */}
            <circle cx="50" cy="35" r="10" fill={treeColor} className="transition-colors duration-1000 opacity-90 animate-pulse" />
            <circle cx="40" cy="45" r="8" fill={treeColor} className="transition-colors duration-1000 opacity-80" />
            <circle cx="60" cy="45" r="8" fill={treeColor} className="transition-colors duration-1000 opacity-80" />
            {leavesCount >= 5 && (
              <>
                <circle cx="50" cy="23" r="7" fill={treeColor} className="transition-colors duration-1000 opacity-90" />
                <circle cx="33" cy="38" r="6" fill={treeColor} className="transition-colors duration-1000 opacity-70" />
                <circle cx="67" cy="38" r="6" fill={treeColor} className="transition-colors duration-1000 opacity-70" />
              </>
            )}
            {leavesCount >= 7 && (
              <>
                <circle cx="43" cy="28" r="5" fill="#34d399" className="transition-colors duration-1000 opacity-95" />
                <circle cx="57" cy="28" r="5" fill="#34d399" className="transition-colors duration-1000 opacity-95" />
                {/* Small birds */}
                <path d="M 25 25 Q 28 22 31 25 Q 34 22 37 25" stroke="#94a3b8" strokeWidth="1" fill="none" />
                <path d="M 68 20 Q 71 17 74 20 Q 77 17 80 20" stroke="#94a3b8" strokeWidth="1" fill="none" />
              </>
            )}
            
            {/* River if score is good */}
            {scoreValue >= 60 && (
              <path d="M 25 76 Q 50 72 75 80" stroke="#06b6d4" strokeWidth="4" fill="none" className="animate-pulse" />
            )}
          </svg>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-300 text-center">{message}</p>
        <span className="text-[10px] text-slate-500 mt-1 font-semibold">Avatar status: {scoreInfo.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-cyan-950/20 p-8 shadow-[0_0_50px_rgba(16,185,129,0.05)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{user.name?.split(" ")[0]}</span>!
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Your average footprint is <span className="text-emerald-400 font-semibold">{formatNumber(carbonWeeklyAvg, 1)} kg CO₂e</span> this week. That's {" "}
              <span className="font-semibold text-emerald-400">{Math.abs(carbonChange)}% {carbonChange <= 0 ? "lower" : "higher"}</span> than the global baseline.
            </p>
          </div>
          {!todayLog ? (
            <Link
              href="/tracker"
              className="flex items-center gap-2 self-start md:self-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 transform active:scale-95 shrink-0"
            >
              <CalendarPlus className="w-5 h-5 stroke-[2.5px]" />
              Log Today's Activities
            </Link>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5" /> Today Logged
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Stats & Metrics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sustainability Score & Top Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sustainability Score Card */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md p-6 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
              
              <h3 className="text-sm font-semibold text-slate-400 mb-6 self-start">Sustainability Score</h3>
              
              {/* Radial Progress Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="40" stroke="rgba(30, 41, 59, 0.5)" strokeWidth="8" fill="transparent" />
                  {/* Progress Circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="url(#emeraldGradient)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Score Centered Text */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Score</span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col items-center">
                <span className="text-sm font-semibold" style={{ color: scoreInfo.color }}>{scoreInfo.label}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Based on all logged factors</span>
              </div>
            </div>

            {/* Daily Carbon Card */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />
              
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-400">Carbon Footprint</h3>
                <div className="bg-cyan-500/10 p-2 rounded-xl text-cyan-400 border border-cyan-500/20">
                  <Leaf className="w-4 h-4" />
                </div>
              </div>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white tracking-tight">
                    {formatNumber(carbonToday, 1)}
                  </span>
                  <span className="text-sm font-medium text-slate-400">kg CO₂e</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Today's calculated carbon output</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {carbonChange <= 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    <TrendingDown className="w-3.5 h-3.5" /> {Math.abs(carbonChange)}%
                  </span>
                ) : (
                  <span className="text-red-400 font-semibold flex items-center gap-0.5 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                    <TrendingUp className="w-3.5 h-3.5" /> {carbonChange}%
                  </span>
                )}
                <span className="text-slate-500">vs global daily baseline</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Water Usage */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-md p-5 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">Water Consumption</span>
                <Droplet className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{waterToday}</span>
                <span className="text-xs text-slate-500">Liters</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Weekly avg: {Math.round(waterWeeklyAvg)}L/day</p>
            </div>

            {/* Electricity Usage */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-md p-5 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">Electricity Usage</span>
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{electricityToday}</span>
                <span className="text-xs text-slate-500">kWh</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Weekly avg: {electricityWeeklyAvg.toFixed(1)} kWh</p>
            </div>

            {/* Recycling Usage */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-md p-5 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">Waste & Recycling</span>
                <Trash2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white">{recycledToday}/{recycledToday + plasticToday}</span>
                <span className="text-xs text-slate-500">Items recycled</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Recycling rate: {recycledToday + plasticToday > 0 ? Math.round((recycledToday / (recycledToday + plasticToday)) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* AI Coach Insights Panel */}
          {latestInsight && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/25 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-400/15 transition-all duration-700" />
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                      Gaia AI Insight
                    </h4>
                    {latestInsight.impact && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-semibold ${
                        latestInsight.impact === "HIGH" 
                          ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                          : latestInsight.impact === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}>
                        {latestInsight.impact} IMPACT
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-xs text-white">{latestInsight.title}</h5>
                  <p className="text-slate-300 text-xs leading-relaxed">{latestInsight.content}</p>
                  <Link 
                    href="/ai-coach" 
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mt-2"
                  >
                    Ask Gaia AI Coach <ArrowRight className="w-3 h-3 stroke-[2.5px]" />
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Eco-Avatar, Goals, Challenges */}
        <div className="space-y-8">
          
          {/* Interactive Eco-Avatar */}
          {renderEcoAvatar(score)}

          {/* Active Goals Card */}
          <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" /> Active Goals
              </h3>
              <Link href="/goals" className="text-xs text-slate-500 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-0.5">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeGoals.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                No active goals. Start setting custom targets to track!
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeGoals.map((goal) => {
                  const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                  return (
                    <div key={goal.id} className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-2xl hover:border-slate-800 transition-all duration-300">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-xs text-slate-200">{goal.title}</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-1.5 border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium">
                        <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                        <span>Ends {goal.endDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Challenges Card */}
          <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> Active Challenges
              </h3>
              <Link href="/challenges" className="text-xs text-slate-500 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-0.5">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {userChallenges.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                No active challenges. Join a community or daily challenge to earn XP!
              </div>
            ) : (
              <div className="space-y-3.5">
                {userChallenges.map((uc) => {
                  const challenge = uc.challenge;
                  const progress = Math.min(100, Math.round((uc.progress / challenge.targetValue) * 100));
                  return (
                    <div key={uc.id} className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-2xl hover:border-slate-800 transition-all duration-300">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl shrink-0 mt-0.5">{challenge.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-slate-200 truncate">{challenge.title}</span>
                            <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                              +{challenge.xpReward} XP
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed mb-2 truncate">{challenge.description}</p>
                          <div className="w-full h-1.2 bg-slate-900 rounded-full overflow-hidden mb-1">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-500">
                            <span>{uc.progress} / {challenge.targetValue} {challenge.unit}</span>
                            <span className="font-semibold uppercase tracking-wider text-[8px] text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                              {challenge.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
