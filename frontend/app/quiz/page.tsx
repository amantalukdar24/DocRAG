"use client";

import { useSearchParams } from "next/navigation";
import QuizClient from "./QuizClient";
import Link from "next/link";
import { FileText, HelpCircle, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function QuizContent() {
  const searchParams = useSearchParams();
  const docId =
    searchParams.get("docId") ||
    searchParams.get("documentId") ||
    searchParams.get("id") ||
    searchParams.get("slug");

  if (!docId) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <HelpCircle size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Select a Document</h1>
            <p className="text-sm text-zinc-400">
              Please choose an uploaded document to generate and take AI quizzes.
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

  return <QuizClient docId={docId} />;
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium text-sm animate-pulse">Loading Quiz...</p>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
