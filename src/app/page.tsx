"use client";

import { useState } from "react";
import { PrdGenerator } from "@/components/dashboard/prd-generator";
import { DocumentViewer } from "@/components/dashboard/document-viewer";
import { PrdChat } from "@/components/dashboard/prd-chat";

export default function Home() {
  const [markdown, setMarkdown] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setMarkdown("");

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
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 md:flex-row dark:bg-slate-950">
      {/* Left fixed panel: Input */}
      <div className="flex h-full w-full flex-col border-r bg-white p-6 md:w-[350px] lg:w-[400px] xl:w-[450px] shrink-0 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">ZoraFlow</h1>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
          Describe your project to instantly generate a comprehensive PRD and technical specs.
        </p>
        <PrdGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />
      </div>

      {/* Center panel: Document rendering */}
      <div className={`flex-1 overflow-hidden bg-slate-50 p-6 md:p-8 dark:bg-slate-950 transition-all ${markdown ? 'lg:border-r border-slate-200 dark:border-slate-800' : ''}`}>
        <DocumentViewer markdown={markdown} isLoading={isGenerating} onUpdateMarkdown={updateMarkdown} />
      </div>

      {/* Right panel: Chat UI (Only shown when document is generated) */}
      {markdown && (
        <div className="hidden lg:flex flex-col h-full w-[350px] xl:w-[400px] shrink-0">
          <PrdChat markdown={markdown} onUpdateMarkdown={updateMarkdown} />
        </div>
      )}
    </div>
  );
}
