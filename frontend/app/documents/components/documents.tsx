"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  BotMessageSquare,
  Brain,
  Trash2,
  Loader2,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface DocumentI {
  _id: string;
  publicId: string;
  path: string;
  createdAt: string;
}

interface DocumentsProps {
  loadingUpload: boolean;
  triggerUploadClick?: () => void;
}

export default function Documents({ loadingUpload, triggerUploadClick }: DocumentsProps) {
  const url: string = (process.env.NEXT_PUBLIC_Backend_Url as string) || "http://localhost:8000";
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentI[]>([]);
  const [skip, setSkip] = useState<number>(0);
  const [totalDocs, setTotalDocs] = useState<number>(0);

  // Fetch documents list
  const getDocuments = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";
      const result = await fetch(`${url}/doc/getdocuments?skip=${skip}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });
      const data = await result.json();
      if (data.success) {
        setDocuments(
          data.getDocuments.map(({ _id, publicId, path, createdAt }: DocumentI) => ({
            _id,
            publicId,
            path,
            createdAt,
          }))
        );
      } else {
        toast.error(data.mssg || "Failed to fetch documents");
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error("Network error loading documents");
    } finally {
      setLoading(false);
    }
  }, [skip, url]);

  // Fetch total document count
  const getTotalDocs = useCallback(async (): Promise<void> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";
      const result = await fetch(`${url}/doc/gettotaldocs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });
      const data = await result.json();
      if (data.success) {
        setTotalDocs(data.total);
      }
    } catch (err) {
      console.error("Error getting total docs count:", err);
    }
  }, [url]);

  useEffect(() => {
    getDocuments();
  }, [skip, loadingUpload, getDocuments]);

  useEffect(() => {
    getTotalDocs();
  }, [loadingUpload, getDocuments, getTotalDocs]);

  // Handle deletion of PDF document
  const handleDelete = async (publicId: string, _id: string): Promise<void> => {
    if (deletingId) return;
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    setDeletingId(_id);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";
      const result = await fetch(`${url}/doc/deletepdf`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          authorization: token,
        },
        body: new URLSearchParams({ publicId, _id }),
      });
      const data = await result.json();
      if (data.success) {
        toast.success(data.mssg || "Document deleted successfully");
        getDocuments();
        getTotalDocs();
      } else {
        toast.error(data.mssg || "Failed to delete document");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Network error deleting document");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSkip = (direction: number): void => {
    const newSkip = skip + direction;
    if (newSkip < 0 || newSkip >= totalDocs) return;
    setSkip(newSkip);
  };

  const formatFileName = (publicId: string) => {
    const name = publicId.replace(/^DocRag\/PDFs\//, "");
    return name || "Document.pdf";
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Loading State */}
      {loading ? (
        <div className="w-full py-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium text-sm animate-pulse">
            Fetching your uploaded documents...
          </p>
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="w-full max-w-lg mx-auto my-8 p-8 bg-zinc-900/60 border border-zinc-800 rounded-3xl text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FolderOpen size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">No Documents Uploaded Yet</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Upload your first PDF document to start generating automated quizzes and asking AI questions grounded in your content.
            </p>
          </div>

          {triggerUploadClick && (
            <button
              onClick={triggerUploadClick}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Upload size={16} />
              <span>Upload Your First PDF</span>
            </button>
          )}
        </div>
      ) : (
        /* Documents Grid / List */
        <div className="w-full space-y-3">
          {documents.map((doc) => {
            const isDeleting = deletingId === doc._id;
            return (
              <div
                key={doc._id}
                className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/90 rounded-2xl transition-all shadow-lg hover:border-zinc-700 gap-4"
              >
                {/* Left File Information */}
                <div className="flex items-center space-x-3 overflow-hidden w-full sm:w-auto">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {formatFileName(doc.publicId)}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      ID: {doc._id}
                    </p>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  <Link
                    href={`/quiz?docId=${doc._id}`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500/20 hover:border-amber-500/40 border border-zinc-700/60 text-zinc-200 hover:text-amber-300 text-xs font-medium transition-all"
                  >
                    <Brain size={15} className="text-amber-400" />
                    <span>Quiz</span>
                  </Link>

                  <Link
                    href={`/askAI?docId=${doc._id}`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-orange-500/20 hover:border-orange-500/40 border border-zinc-700/60 text-zinc-200 hover:text-orange-300 text-xs font-medium transition-all"
                  >
                    <BotMessageSquare size={15} className="text-orange-400" />
                    <span>Ask AI</span>
                  </Link>

                  <button
                    disabled={isDeleting}
                    onClick={() => handleDelete(doc.publicId, doc._id)}
                    className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-800/30 text-red-400 transition-colors cursor-pointer disabled:opacity-40"
                    title="Delete Document"
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin text-red-400" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalDocs > 10 && (
        <div className="w-full flex items-center justify-between pt-4 border-t border-zinc-800 text-xs font-medium text-zinc-400">
          <span>
            Showing {skip + 1} - {Math.min(skip + 10, totalDocs)} of {totalDocs} documents
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={skip === 0}
              onClick={() => handleSkip(-10)}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <button
              disabled={skip + 10 >= totalDocs}
              onClick={() => handleSkip(10)}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}