"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  HelpCircle,
  BarChart3,
  Check,
  AlertCircle
} from "lucide-react";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizDataProps {
  quizData: string | QuizQuestion[] | any;
  title?: string;
}

/**
 * Recursively parse JSON strings to handle single, double, or triple encoded JSON.
 */
function safeParseJson(data: any): any {
  let val = data;
  let maxDepth = 5;
  while (typeof val === "string" && maxDepth > 0) {
    let clean = val.trim();
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
    try {
      const parsed = JSON.parse(clean);
      if (parsed === val) break;
      val = parsed;
    } catch {
      break;
    }
    maxDepth--;
  }
  return val;
}

/**
 * Safely parse and normalize quizData from string, array, or object format.
 */
function parseQuizData(raw: string | QuizQuestion[] | any): QuizQuestion[] {
  if (!raw) return [];

  const parsed = safeParseJson(raw);
  let arrayTarget: any[] = [];

  if (Array.isArray(parsed)) {
    arrayTarget = parsed;
  } else if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.quiz)) arrayTarget = parsed.quiz;
    else if (Array.isArray(parsed.questions)) arrayTarget = parsed.questions;
    else if (Array.isArray(parsed.quizData)) arrayTarget = parsed.quizData;
    else if (Array.isArray(parsed.data)) arrayTarget = parsed.data;
    else if (Array.isArray(parsed.result)) arrayTarget = parsed.result;
  }

  return arrayTarget
    .map((item) => {
      if (!item) return null;

      let obj = item;
      if (typeof item === "string") {
        obj = safeParseJson(item);
      }
      if (!obj || typeof obj !== "object") return null;

      const question = String(obj.question || obj.q || obj.title || obj.prompt || "").trim();

      let rawOptions = obj.options || obj.choices || obj.answers || obj.option;
      if (typeof rawOptions === "string") {
        rawOptions = safeParseJson(rawOptions);
      }

      let options: string[] = [];
      if (Array.isArray(rawOptions)) {
        options = rawOptions.map((opt: any) => String(opt).trim());
      } else if (typeof rawOptions === "object" && rawOptions !== null) {
        options = Object.values(rawOptions).map((opt: any) => String(opt).trim());
      }

      const answer = String(
        obj.answer ?? obj.correctAnswer ?? obj.correct_answer ?? obj.correct ?? obj.ans ?? ""
      ).trim();

      if (!question || !Array.isArray(options) || options.length === 0) return null;

      return {
        question,
        options,
        answer
      };
    })
    .filter((q): q is QuizQuestion => q !== null);
}

/**
 * Robust check if a selected option matches the correct answer.
 */
function checkIsCorrect(
  question: QuizQuestion,
  selectedOptionText?: string
): boolean {
  if (!selectedOptionText || !question || !question.answer) return false;

  const targetAns = question.answer.trim();
  const selectedText = selectedOptionText.trim();

  // Direct text match
  if (
    selectedText === targetAns ||
    selectedText.toLowerCase() === targetAns.toLowerCase()
  ) {
    return true;
  }

  // Check letter mapping (A, B, C, D)
  const optionsList = Array.isArray(question?.options) ? question.options : [];
  const optionIdx = optionsList.findIndex(
    (opt) => opt.trim() === selectedText
  );
  if (optionIdx !== -1) {
    const letters = ["a", "b", "c", "d", "e", "f"];
    if (targetAns.length === 1 && letters.includes(targetAns.toLowerCase())) {
      return letters.indexOf(targetAns.toLowerCase()) === optionIdx;
    }
  }

  return false;
}

export default function QuizData({ quizData, title = "Interactive Quiz" }: QuizDataProps) {
  const questions: QuizQuestion[] = useMemo(
    () => parseQuizData(quizData),
    [quizData]
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<"all" | "correct" | "incorrect">("all");

  const totalQuestions = questions.length;
  const currentQuestion = totalQuestions > 0 ? questions[currentIndex] : null;

  if (!questions || totalQuestions === 0 || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center space-y-4 shadow-xl">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
        <h3 className="text-xl font-bold text-zinc-100">No Quiz Data Available</h3>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          We couldn't load questions for this quiz. Please check back later or generate a new quiz.
        </p>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Score Calculation
  const scoreStats = useMemo(() => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      if (checkIsCorrect(q, selected)) {
        correct++;
      }
    });
    const percentage = Math.round((correct / totalQuestions) * 100);
    return {
      correct,
      incorrect: totalQuestions - correct,
      total: totalQuestions,
      percentage
    };
  }, [questions, userAnswers, totalQuestions]);

  // Handlers
  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: option
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handlePlayAgain = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setFilterMode("all");
  };

  // Option badges (A, B, C, D)
  const getOptionBadge = (idx: number) => {
    return String.fromCharCode(65 + idx);
  };

  // Render Results Screen
  if (isSubmitted) {
    const getGradeInfo = (pct: number) => {
      if (pct >= 90)
        return {
          label: "Outstanding Achievement!",
          color: "from-emerald-400 to-teal-500",
          textColor: "text-emerald-400",
          bgColor: "bg-emerald-500/10 border-emerald-500/30",
          icon: Sparkles
        };
      if (pct >= 70)
        return {
          label: "Great Job!",
          color: "from-indigo-400 to-purple-500",
          textColor: "text-indigo-400",
          bgColor: "bg-indigo-500/10 border-indigo-500/30",
          icon: Award
        };
      if (pct >= 50)
        return {
          label: "Good Effort!",
          color: "from-amber-400 to-orange-500",
          textColor: "text-amber-400",
          bgColor: "bg-amber-500/10 border-amber-500/30",
          icon: BarChart3
        };
      return {
        label: "Keep Practicing!",
        color: "from-rose-400 to-red-500",
        textColor: "text-rose-400",
        bgColor: "bg-rose-500/10 border-rose-500/30",
        icon: HelpCircle
      };
    };

    const grade = getGradeInfo(scoreStats.percentage);
    const GradeIcon = grade.icon;

    const filteredQuestions = questions.filter((q, idx) => {
      const isCorrect = checkIsCorrect(q, userAnswers[idx]);
      if (filterMode === "correct") return isCorrect;
      if (filterMode === "incorrect") return !isCorrect;
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 px-2 sm:px-4 animate-in fade-in duration-500">
        {/* Results Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900/90 border border-zinc-800 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="text-center sm:text-left space-y-3">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${grade.bgColor} ${grade.textColor}`}>
                <GradeIcon className="w-4 h-4" />
                <span>{grade.label}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Quiz Completed
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base max-w-md">
                Here is a summary of your performance on this document quiz.
              </p>
            </div>

            {/* Circular Percentage Card */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-inner min-w-40">
              <span className={`text-5xl font-black bg-linear-to-r ${grade.color} bg-clip-text text-transparent`}>
                {scoreStats.percentage}%
              </span>
              <span className="text-xs text-zinc-400 mt-1 font-medium tracking-wide uppercase">
                Overall Score
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-zinc-800/80">
            <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-white block">
                {scoreStats.total}
              </span>
              <span className="text-xs text-zinc-400">Total Questions</span>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-emerald-400 block">
                {scoreStats.correct}
              </span>
              <span className="text-xs text-emerald-500/80">Correct</span>
            </div>
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-rose-400 block">
                {scoreStats.incorrect}
              </span>
              <span className="text-xs text-rose-500/80">Incorrect</span>
            </div>
          </div>

          {/* Action Button: Play Again */}
          <div className="mt-8 flex justify-center sm:justify-start">
            <button
              onClick={handlePlayAgain}
              className="px-6 py-3.5 rounded-xl bg-linear-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center gap-2.5 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>

        {/* Breakdown & Review Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Question Breakdown
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review your answers and check the correct explanations below.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterMode === "all"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({scoreStats.total})
              </button>
              <button
                onClick={() => setFilterMode("correct")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterMode === "correct"
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-emerald-400"
                }`}
              >
                Correct ({scoreStats.correct})
              </button>
              <button
                onClick={() => setFilterMode("incorrect")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterMode === "incorrect"
                    ? "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                    : "text-zinc-400 hover:text-rose-400"
                }`}
              >
                Incorrect ({scoreStats.incorrect})
              </button>
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const originalIndex = questions.indexOf(q);
              const userAns = userAnswers[originalIndex];
              const isCorrect = checkIsCorrect(q, userAns);
              const qOptions = Array.isArray(q?.options) ? q.options : [];

              return (
                <div
                  key={originalIndex}
                  className={`p-6 rounded-2xl border transition-all ${
                    isCorrect
                      ? "bg-zinc-900/60 border-emerald-500/20"
                      : "bg-zinc-900/60 border-rose-500/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Question {originalIndex + 1}
                      </span>
                      <h4 className="text-base sm:text-lg font-semibold text-zinc-100 leading-snug">
                        {q.question}
                      </h4>
                    </div>
                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options List Review */}
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {qOptions.map((opt, optIdx) => {
                      const isUserChoice = userAns === opt;
                      const isCorrectOption =
                        opt.trim() === q.answer.trim() ||
                        checkIsCorrect(q, opt);

                      let style =
                        "bg-zinc-950/40 border-zinc-800/60 text-zinc-400";
                      if (isCorrectOption) {
                        style =
                          "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-medium";
                      } else if (isUserChoice && !isCorrectOption) {
                        style =
                          "bg-rose-950/40 border-rose-500/40 text-rose-300 font-medium line-through";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm transition-all ${style}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                isCorrectOption
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : isUserChoice
                                  ? "bg-rose-500/20 text-rose-400"
                                  : "bg-zinc-800 text-zinc-500"
                              }`}
                            >
                              {getOptionBadge(optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isCorrectOption && (
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Correct Answer
                            </span>
                          )}
                          {isUserChoice && !isCorrectOption && (
                            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Play Again Button */}
          <div className="pt-6 flex justify-center">
            <button
              onClick={handlePlayAgain}
              className="px-8 py-4 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all duration-200 flex items-center gap-3 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentOptions = Array.isArray(currentQuestion?.options)
    ? currentQuestion.options
    : [];

  // Multi-step Quiz View
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-2 sm:px-4">
      {/* Top Header & Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <Sparkles className="w-4 h-4" />
            {title}
          </span>
          <span>
            Question <strong className="text-white">{currentIndex + 1}</strong> of{" "}
            {totalQuestions}
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800 p-0.5 shadow-inner">
          <div
            className="bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Question Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {questions.map((_, idx) => {
            const isAnswered = userAnswers[idx] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-7 px-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shrink-0 ${
                  isCurrent
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20 scale-105"
                    : isAnswered
                    ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60"
                    : "bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Container */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Subtle background element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Question Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <span>Question {currentIndex + 1}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options List */}
        <div className="grid grid-cols-1 gap-3.5 pt-2">
          {currentOptions.map((option, optIdx) => {
            const isSelected = userAnswers[currentIndex] === option;
            const badge = getOptionBadge(optIdx);

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer group ${
                  isSelected
                    ? "bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50"
                    : "bg-zinc-950/50 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-zinc-850 border border-zinc-700/60 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-600"
                    }`}
                  >
                    {badge}
                  </span>
                  <span className="text-sm sm:text-base font-medium leading-snug wrap-break-word">
                    {option}
                  </span>
                </div>

                <div className="shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-600 text-white"
                        : "border-zinc-700 bg-transparent group-hover:border-zinc-500"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-800/80">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              currentIndex === 0
                ? "opacity-30 border-transparent text-zinc-600 cursor-not-allowed"
                : "bg-zinc-800/60 border-zinc-700/70 text-zinc-300 hover:text-white hover:bg-zinc-700/60 cursor-pointer"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Center Indicator */}
          <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
            {answeredCount} of {totalQuestions} answered
          </span>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                answeredCount === 0
                  ? "opacity-40 bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish & Submit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
