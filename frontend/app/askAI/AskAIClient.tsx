"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BotMessageSquare,
  Send,
  Trash2,
  ArrowLeft,
  Sparkles,
  Loader2,
  User,
  Copy,
  Check,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

interface ChatI {
  _id?: string;
  question: string;
  answer: string;
  docId: string;
  createdAt?: string;
}

interface AskAIClientProps {
  docId: string;
}

export default function AskAIClient({ docId }: AskAIClientProps) {
  const [chats, setChats] = useState<ChatI[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
  const url: string = (process.env.NEXT_PUBLIC_Backend_Url as string) || "http://localhost:8000";

  // Fetch initial chat history
  const fetchChats = async (): Promise<void> => {
    if (!docId) return;
    setLoadingChats(true);
    try {
      const token =  localStorage.getItem("authToken") as string;
      const result = await fetch(`${url}/chat/getchats/${docId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });
      const data = await result.json();
      if (data.success) {
        setChats(data.chats || []);
      } else {
        toast.error(data.mssg || "Failed to fetch chat history");
        if (data.mssg?.toLowerCase().includes("not found")) {
          router.push("/documents");
        }
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      toast.error("Network error fetching chat history");
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [docId, url]);

  // Auto-scroll to bottom on chat update or typing state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, sending]);

  // Send a question to AskAI endpoint
  const handleSend = async (overrideQuestion?: string): Promise<void> => {
    const query = (overrideQuestion !== undefined ? overrideQuestion : question).trim();
    if (!query) {
      toast.error("Question must not be empty");
      return;
    }
    if (sending) return;

    setSending(true);
    if (!overrideQuestion) setQuestion("");

    try {
      const token =  localStorage.getItem("authToken") as string;
      const result = await fetch(`${url}/chat/getanswer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({ docId, question: query }),
      });
      const data = await result.json();

      if (data.success && data.storeAnswer) {
        setChats((prev) => [...prev, data.storeAnswer]);
      } else {
        toast.error(data.mssg || "Failed to get AI answer");
      }
    } catch (err) {
      console.error("Error asking question:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Clear all chats for current document
  const handleClearChats = async (): Promise<void> => {
    if (clearing || chats.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all chat history for this document?")) {
      return;
    }

    setClearing(true);
    try {
      const token =  localStorage.getItem("authToken") as string;
      const result = await fetch(`${url}/chat/deletechats`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({ docId }),
      });
      const data = await result.json();

      if (data.success) {
        setChats([]);
        toast.success(data.mssg || "Chats deleted successfully");
      } else {
        toast.error(data.mssg || "Failed to clear chats");
      }
    } catch (err) {
      console.error("Error clearing chats:", err);
      toast.error("Network error clearing chats");
    } finally {
      setClearing(false);
    }
  };

  // Copy AI answer text
  const handleCopy = (text: string, index: number): void => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Answer copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Handle Enter key for fast messaging
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Formatter helper for structured Markdown-like text
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-2 text-sm sm:text-base leading-relaxed text-zinc-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Headers
          if (trimmed.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-base font-bold text-amber-400 mt-3 mb-1">
                {trimmed.replace("### ", "")}
              </h3>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h2 key={idx} className="text-lg font-bold text-amber-300 mt-4 mb-2">
                {trimmed.replace("## ", "")}
              </h2>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h1 key={idx} className="text-xl font-extrabold text-amber-200 mt-4 mb-2">
                {trimmed.replace("# ", "")}
              </h1>
            );
          }

          // Bullet points
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start space-x-2.5 ml-2 my-1">
                <span className="text-amber-500 font-bold mt-1 select-none">•</span>
                <span className="flex-1">{parseBoldText(content)}</span>
              </div>
            );
          }

          // Numbered list items
          const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numberedMatch) {
            return (
              <div key={idx} className="flex items-start space-x-2.5 ml-2 my-1">
                <span className="text-amber-500 font-semibold min-w-5 select-none">{numberedMatch[1]}.</span>
                <span className="flex-1">{parseBoldText(numberedMatch[2])}</span>
              </div>
            );
          }

          return <p key={idx}>{parseBoldText(trimmed)}</p>;
        })}
      </div>
    );
  };

  // Helper to parse **bold** text tags inside string
  const parseBoldText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const samplePrompts = [
    "Summarize the key takeaways of this document.",
    "What are the main concepts and definitions explained?",
    "Generate 3 practice questions based on this document.",
    "Explain the core arguments and conclusions in detail.",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-4.5rem)] px-3 sm:px-6 py-4">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <Link
            href="/documents"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span>Documents</span>
          </Link>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-linear-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <BotMessageSquare size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Ask AI Assistant
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  RAG Powered
                </span>
              </h1>
              <p className="text-xs text-zinc-400 font-mono truncate max-w-45 sm:max-w-xs">
                Doc ID: {docId}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchChats}
            disabled={loadingChats}
            title="Refresh Chats"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={loadingChats ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleClearChats}
            disabled={clearing || chats.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {clearing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </header>

      {/* Main Chat Scrollable Feed */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {loadingChats ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 py-16">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-zinc-400 font-medium text-sm animate-pulse">
              Loading chat history...
            </p>
          </div>
        ) : chats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-10 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-amber-500/10 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/5">
              <Sparkles size={32} />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold text-white">Ask anything about your document</h2>
              <p className="text-sm text-zinc-400">
                Our RAG system searches through your document vectors to give precise, grounded answers in real-time.
              </p>
            </div>

            {/* Suggested Prompt Cards */}
            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {samplePrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(promptText)}
                  className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 text-left text-xs sm:text-sm text-zinc-300 hover:text-white transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 group flex items-start space-x-2.5 cursor-pointer"
                >
                  <HelpCircle size={16} className="text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>{promptText}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {chats.map((chat, idx) => (
              <div key={chat._id || idx} className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end items-start space-x-2.5">
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-indigo-600/90 text-white px-4 py-3 shadow-md shadow-indigo-600/10 border border-indigo-500/30">
                    <p className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap">
                      {chat.question}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
                    <User size={16} />
                  </div>
                </div>

                {/* AI Response Message */}
                <div className="flex justify-start items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-zinc-950 font-bold shrink-0 mt-1 shadow-md shadow-orange-500/20">
                    <BotMessageSquare size={18} />
                  </div>
                  <div className="max-w-[90%] sm:max-w-[80%] rounded-2xl rounded-tl-xs bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-3 relative group">
                    {renderFormattedText(chat.answer)}

                    {/* Toolbar / Action footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Sparkles size={12} className="text-amber-400" /> Grounded in PDF Context
                      </span>
                      <button
                        onClick={() => handleCopy(chat.answer, idx)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check size={13} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* AI Thinking Placeholder state */}
            {sending && (
              <div className="flex justify-start items-start space-x-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-zinc-950 font-bold shrink-0 mt-1 animate-pulse">
                  <BotMessageSquare size={18} />
                </div>
                <div className="rounded-2xl rounded-tl-xs bg-zinc-900/80 border border-zinc-800 px-5 py-4 flex items-center space-x-3 text-zinc-400 text-sm">
                  <Loader2 size={18} className="animate-spin text-amber-400" />
                  <span>Searching vector database & analyzing context...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Fixed Question Input Bar */}
      <div className="pt-3">
        <div className="relative bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2 sm:p-2.5 shadow-2xl focus-within:border-amber-500/50 transition-all">
          <textarea
            ref={inputRef}
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document... (Press Enter to send, Shift+Enter for new line)"
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base p-2 resize-none focus:outline-none scrollbar-none"
          />
          <div className="flex items-center justify-between px-2 pt-1 border-t border-zinc-800/60">
            <span className="text-[11px] text-zinc-500">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">Enter</kbd> to send
            </span>
            <button
              onClick={() => handleSend()}
              disabled={sending || !question.trim()}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
