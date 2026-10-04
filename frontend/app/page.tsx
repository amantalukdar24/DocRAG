import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 bg-[#0c0d10] text-zinc-100 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
          <span>📚 Designed for Students & Learners</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Supercharge Your Study Sessions with <span className="text-zinc-400">DocRAG</span>
        </h1>

        <p className="text-zinc-300 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-normal">
          Effortlessly extract text from your PDF. Use AI to generate instant summaries, test yourself with automated quizzes, and ask questions to clarify complex concepts in seconds.
        </p>

        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-light">
          Whether preparing for exams, reviewing study guides, or analyzing lengthy documents, DocRAG transforms dense PDFs into clear, interactive knowledge tailored for faster learning.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left max-w-2xl mx-auto">
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            <h3 className="font-bold text-white mb-1">📝 Smart Summaries</h3>
            <p className="text-xs text-zinc-400">Distill lengthy PDF chapters into key takeaways and bulleted study notes.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            <h3 className="font-bold text-white mb-1">❓ Interactive Quizzes</h3>
            <p className="text-xs text-zinc-400">Generate custom practice questions and flashcards directly from your text.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            <h3 className="font-bold text-white mb-1">🤖 Ask AI Anything</h3>
            <p className="text-xs text-zinc-400">Get instant, accurate answers cited straight from your uploaded documents.</p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/signin"
            className="inline-block px-6 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-bold text-sm sm:text-base transition-colors shadow-lg"
          >
            Start Learning
          </Link>
        </div>

      </div>
    </div>
  );
}
