import { auth } from "@/auth";
import Link from "next/link";
import { 
  Leaf, 
  Sparkles, 
  Target, 
  Trophy, 
  BarChart3, 
  ArrowRight,
  TrendingDown,
  Globe,
  Zap,
  Users
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen relative overflow-hidden font-sans">
      
      {/* Background blobs */}
      <div className="absolute top-[-30%] left-[-15%] w-[80%] h-[80%] rounded-full bg-emerald-950/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-15%] w-[80%] h-[80%] rounded-full bg-cyan-950/15 blur-[150px] pointer-events-none" />
      
      {/* Ambient Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto h-20 px-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            EcoSphere AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300 transform active:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors">
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300 transform active:scale-95"
              >
                Start Journey
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-8 pt-20 pb-16 text-center space-y-8 relative z-10 flex flex-col items-center">
        
        {/* Glow Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold tracking-wider uppercase animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Sustainability Coach
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl text-white">
          Measure, Understand, and{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            Reduce Your Footprint
          </span>
        </h1>

        {/* Sub-heading */}
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          EcoSphere AI tracks your daily transportation, diet, and utility usage, calculating your carbon impact in real-time. Gain gamified XP, unlock badges, and follow Gaia AI recommendations.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link
            href={isLoggedIn ? "/dashboard" : "/register"}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all duration-300 transform active:scale-95 group"
          >
            <span>{isLoggedIn ? "Go to Dashboard" : "Start Free Journey"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5px] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          
          <Link
            href={isLoggedIn ? "/ai-coach" : "/login"}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-805 rounded-2xl text-slate-300 hover:text-white text-sm font-bold transition-all duration-300"
          >
            Ask Gaia AI Coach
          </Link>
        </div>

      </section>

      {/* Floating Demo Cards Showcase */}
      <section className="max-w-6xl mx-auto px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: AI Coach */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 hover:border-slate-800 transition-all duration-300 hover:translate-y-[-4px] group">
            <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-400 w-fit">
              <Sparkles className="w-5 h-5 group-hover:animate-spin-slow" />
            </div>
            <h3 className="font-bold text-sm text-slate-200">Gaia AI Sustainability Coach</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Personalized ecological tips and monthly emissions forecasts generated dynamically based on your custom habits.
            </p>
          </div>

          {/* Card 2: Interactive Gamification */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 hover:border-slate-800 transition-all duration-300 hover:translate-y-[-4px] group">
            <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-400 w-fit">
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-sm text-slate-200">Consistency Gamification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintain daily tracking streaks, complete weekly community challenges, and earn exclusive eco warrior badges.
            </p>
          </div>

          {/* Card 3: Interactive Analytics */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 hover:border-slate-800 transition-all duration-300 hover:translate-y-[-4px] group">
            <div className="bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20 text-cyan-400 w-fit">
              <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-sm text-slate-200">Real-Time Data Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visualizing water conservation, electricity metrics, recycling weights, and transit patterns with beautiful interactive charts.
            </p>
          </div>

        </div>
      </section>

      {/* Footprint Indicator strip */}
      <section className="max-w-5xl mx-auto px-8 py-10 border-t border-slate-900/60 flex flex-wrap items-center justify-around gap-6 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-600" />
          <span>Calculated Carbon footprint values matching IPCC averages</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-slate-600" />
          <span>Integrated energy multipliers matching local utilities grid</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-600" />
          <span>Secure authentication utilizing next-generation JWT tokens</span>
        </div>
      </section>

    </div>
  );
}
