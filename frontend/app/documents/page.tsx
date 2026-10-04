"use client";

import { useRef, useState, useEffect } from "react";
import { FileUp, Loader2, Sparkles, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import Documents from "./components/documents";

export default function DocumentPage() {
  const url: string = (process.env.NEXT_PUBLIC_Backend_Url as string) || "http://localhost:8000";
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async (): Promise<void> => {
    if (!pdf || loading) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", pdf);

      const token =localStorage.getItem("authToken") as string ;
      const result = await fetch(`${url}/doc/upload`, {
        method: "POST",
        headers: {
          "authorization": token,
        },
        body: formData,
      });

      const data = await result.json();
      if (data.success) {
        toast.success(data.mssg || "Document uploaded successfully!");
        setPdf(null);
        if (uploadRef.current) uploadRef.current.value = "";
      } else {
        toast.error(data.mssg || "Failed to upload document");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error("Network error during upload. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdf) {
      handleUpload();
    }
  }, [pdf]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[calc(100vh-4rem)]">
      {/* Top Header & Upload Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <FileText className="text-amber-400" size={24} />
            My Documents
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Upload PDF documents to generate AI quizzes and ask RAG-powered questions.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={uploadRef}
            accept=".pdf"
            className="hidden"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                setPdf(e.target.files[0]);
              }
            }}
          />
          <button
            disabled={loading}
            onClick={() => uploadRef.current?.click()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading PDF...</span>
              </>
            ) : (
              <>
                <FileUp size={18} />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Documents List Component */}
      <Documents loadingUpload={loading} triggerUploadClick={() => uploadRef.current?.click()} />
    </div>
  );
}