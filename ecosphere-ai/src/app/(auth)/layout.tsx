import { Leaf } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-100 font-sans">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />
      
      {/* Main Container */}
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Brand/logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 group">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/30 group-hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-300">
            <Leaf className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            EcoSphere AI
          </span>
        </Link>

        {/* Form Container */}
        <div className="w-full bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {children}
        </div>
      </div>
    </div>
  );
}
