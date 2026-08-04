"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("error") || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (role: "user" | "admin") => {
    if (role === "user") {
      setEmail("demo@ecosphere.ai");
      setPassword("password123");
    } else {
      setEmail("admin@ecosphere.ai");
      setPassword("password123");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold text-white tracking-tight">Access EcoSphere</h2>
        <p className="text-xs text-slate-500 font-medium">Log in to review insights, log stats, and earn badges.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/10 disabled:opacity-50 transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
            </>
          ) : (
            <>
              <span>Log In</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" />
            </>
          )}
        </button>
      </form>

      {/* Redirect */}
      <div className="text-center text-[10px] text-slate-500 font-semibold border-t border-slate-900 pt-4">
        Don't have an account?{" "}
        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 transition-colors">
          Create account
        </Link>
      </div>

      {/* Demo Credentials Box */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-2.5">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Autofill Demo Credentials</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => autofillDemo("user")}
            className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-805 rounded-lg text-[10px] font-bold text-emerald-400 transition-colors"
          >
            Demo User
          </button>
          <button
            type="button"
            onClick={() => autofillDemo("admin")}
            className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-805 rounded-lg text-[10px] font-bold text-red-400 transition-colors"
          >
            Demo Admin
          </button>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
