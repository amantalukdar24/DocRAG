"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import QuizData from "../components/QuizData";

interface QuizClientProps {
  docId: string;
}

export default function QuizClient({ docId }: QuizClientProps) {
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const url: string = (process.env.NEXT_PUBLIC_Backend_Url as string) || "http://localhost:8000";

  const fetchQuiz = async (): Promise<void> => {
    if (!docId) return;
    setLoading(true);
    setErrorMsg("");
    setQuizData(null);

    try {
      const token =  localStorage.getItem("authToken") as string;
      const result = await fetch(`${url}/quiz/generatequiz/${docId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });
      const data = await result.json();
      if (!data.success) {
        const msg = data.mssg || "Failed to load quiz";
        setErrorMsg(msg);
        toast.error(msg);
      } else {
        setQuizData(data.quizData);
      }
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setErrorMsg("Network error fetching quiz data. Please try again.");
      toast.error("Error fetching quiz data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [docId, url]);

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[calc(100vh-4rem)] bg-[#0c0d10] text-zinc-100 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <Link
          href="/documents"
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium"
        >
          <ArrowLeft size={16} />
          <span>Documents</span>
        </Link>

        <button
          onClick={fetchQuiz}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Regenerate Quiz</span>
        </button>
      </div>

      {loading ? (
        <div className="max-w-md mx-auto flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium text-sm animate-pulse">
            Generating AI Quiz Questions...
          </p>
        </div>
      ) : quizData ? (
        <QuizData quizData={quizData} title="Document Knowledge Quiz" />
      ) : (
        <div className="max-w-lg mx-auto text-center py-16 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-5 shadow-xl">
          <h3 className="text-xl font-bold text-white">Quiz Unavailable</h3>
          <p className="text-zinc-400 text-sm">
            {errorMsg || "Unable to load quiz data. Please ensure the document exists and try again."}
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <Link
              href="/documents"
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-all"
            >
              Back to Documents
            </Link>
            <button
              onClick={fetchQuiz}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              Retry Generation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
