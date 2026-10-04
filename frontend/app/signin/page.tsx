"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, LogIn, Mail, Lock } from "lucide-react";

export default function Signin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const router = useRouter();
  const url: string = (process.env.NEXT_PUBLIC_Backend_Url as string) || "http://localhost:8000";

  // Check if user is already logged in on mount / page refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        toast.success("Already logged in! Redirecting...");
        router.replace("/documents");
      } else {
        setCheckingAuth(false);
      }
    }
  }, [router]);

  useEffect(()=>{
      if(localStorage.getItem("authToken")) router.push("/documents");
  },[])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const result = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email, password }),
      });
      const data = await result.json();

      if (!data.success) {
        toast.error(data.mssg || "Sign in failed");
      } else {
        toast.success(data.mssg || "Signed in successfully!");
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        router.push("/documents");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error during sign in");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#0c0d10] text-zinc-100 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 size={32} className="animate-spin text-amber-500" />
          <p className="text-zinc-400 text-sm font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#0c0d10] text-zinc-100 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md bg-[#121216] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome Back to <span className="text-amber-400">DocRAG</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Access your uploaded PDFs, RAG search & AI practice quizzes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className=" text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={14} className="text-amber-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-all"
            />
          </div>

          <div>
            <label className=" text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock size={14} className="text-amber-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 flex justify-center items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-all text-sm shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-amber-400 font-semibold hover:underline ml-1"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
