"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, BotMessageSquare, ArrowRight } from "lucide-react";

export default function AskAIFallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to documents list after a brief delay if no document slug is provided
    const timer = setTimeout(() => {
      router.push("/documents");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <BotMessageSquare size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Select a Document</h1>
          <p className="text-sm text-zinc-400">
            Please choose a uploaded document to start chatting with the RAG Assistant. Redirecting you to your documents...
          </p>
        </div>

        <Link
          href="/documents"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <FileText size={18} />
          <span>Go to Documents</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}