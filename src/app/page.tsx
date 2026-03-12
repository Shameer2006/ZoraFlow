"use client";

import { useState } from "react";
import { DocumentViewer, BlockComment } from "@/components/dashboard/document-viewer";
import { PrdChat } from "@/components/dashboard/prd-chat";

export default function Home() {
  const [markdown, setMarkdown] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [comments, setComments] = useState<BlockComment[]>([]);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setMarkdown("");
    setComments([]);

    try {
      const response = await fetch("/api/generate/prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate PRD");
      }

      setMarkdown(data.markdown);
    } catch (error: any) {
      console.error(error);
      setMarkdown(`**Error:** ${error.message} \n\n Please ensure you have configured your GEMINI_API_KEY in the .env.local file.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateMarkdown = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setComments([]);
  };

  const hasDocument = !!markdown;

  return (
    <div className="flex h-screen w-full" style={{ background: '#FFF8F0' }}>
      {/* ─── Phase 1: No document — PrdChat takes full screen (centered prompt) ─── */}
      {!hasDocument && (
        <div className="flex-1">
          <PrdChat
            markdown={markdown}
            onUpdateMarkdown={updateMarkdown}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            comments={comments}
          />
        </div>
      )}

      {/* ─── Phase 2: Document generated — split layout ─── */}
      {hasDocument && (
        <>
          {/* Left: Chat panel */}
          <div className="flex h-full w-[380px] shrink-0 flex-col lg:w-[420px] xl:w-[450px]" style={{ borderRight: '1px solid #f0e6da' }}>
            <PrdChat
              markdown={markdown}
              onUpdateMarkdown={updateMarkdown}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              comments={comments}
            />
          </div>

          {/* Right: Document canvas */}
          <div className="flex-1 overflow-hidden bg-slate-50 p-6 md:p-8 dark:bg-slate-950">
            <DocumentViewer
              markdown={markdown}
              isLoading={isGenerating}
              onUpdateMarkdown={updateMarkdown}
              comments={comments}
              onCommentsChange={setComments}
            />
          </div>
        </>
      )}
    </div>
  );
}
