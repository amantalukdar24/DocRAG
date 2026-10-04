"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LogIn } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Check initial auth token
    const checkToken = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");
        setIsLoggedIn(!!token);
      }
    };

    checkToken();

    // Listen for storage events across tabs or local updates
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      setIsLoggedIn(false);
      toast.success("Logged out successfully");
      router.push("/signin");
    }
  };

  return (
    <header className="w-full bg-[#121216] border-b border-zinc-800/80 text-zinc-100 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        {/* Left Navigation Links */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm font-medium text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/documents" className="hover:text-white transition-colors">
            Documents
          </Link>
        </div>

        {/* Centralized Logo: DocRAG */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white hover:text-zinc-200 transition-colors cursor-pointer select-none">
              Doc<span className="text-amber-400 font-extrabold">RAG</span>
            </h1>
          </Link>
        </div>

        {/* Right Action Button */}
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors border border-zinc-700/60 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              href="/signin"
              className="px-4 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <LogIn size={14} />
              <span>Get Started</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
