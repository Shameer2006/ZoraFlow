"use client";

import { useState } from "react";
import { DocumentViewer, BlockComment } from "@/components/dashboard/document-viewer";
import { PrdChat } from "@/components/dashboard/prd-chat";
import { StageNav } from "@/components/pipeline/stage-nav";
import { StageSchema } from "@/components/pipeline/stage-schema";
import { StageBom } from "@/components/pipeline/stage-bom";
import type { FlowStage, SchemaOutput, BomOutput } from "@/lib/project-types";

export default function Home() {
  const [markdown, setMarkdown] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [comments, setComments] = useState<BlockComment[]>([]);

  const [activeStage, setActiveStage] = useState<FlowStage>(1);
  const [schemaData, setSchemaData] = useState<SchemaOutput | null>(null);
  const [bomData, setBomData] = useState<BomOutput | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isLoadingBom, setIsLoadingBom] = useState(false);

  /* ─── Stage 1: Generate PRD ─── */
  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setMarkdown("");
    setComments([]);
    // Reset downstream stages when re-generating
    setSchemaData(null);
    setBomData(null);
    setActiveStage(1);

    try {
      const response = await fetch("/api/generate/prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate PRD");
      setMarkdown(data.markdown);
    } catch (error: any) {
      console.error(error);
      setMarkdown(`**Error:** ${error.message}\n\nPlease ensure GEMINI_API_KEY is set in .env.local`);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ─── Stage 2: Generate Schema / Diagrams ─── */
  const handleGenerateSchema = async () => {
    setIsLoadingSchema(true);
    setActiveStage(2);
    setSchemaData(null);

    try {
      const response = await fetch("/api/generate/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd: markdown }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate schema");
      setSchemaData(data);
    } catch (error: any) {
      console.error("Schema error:", error);
    } finally {
      setIsLoadingSchema(false);
    }
  };

  /* ─── Stage 3: Generate BOM ─── */
  const handleGenerateBom = async () => {
    setIsLoadingBom(true);
    setActiveStage(3);
    setBomData(null);

    try {
      const response = await fetch("/api/generate/bom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd: markdown, projectType: schemaData?.projectType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate BOM");
      setBomData(data);
    } catch (error: any) {
      console.error("BOM error:", error);
    } finally {
      setIsLoadingBom(false);
    }
  };

  const updateMarkdown = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setComments([]);
  };

  const hasDocument = !!markdown;

  return (
    <div className="flex h-screen w-full flex-col" style={{ background: "#FFF8F0" }}>

      {/* ── Pipeline nav (only visible once PRD exists) ── */}
      {hasDocument && (
        <StageNav
          activeStage={activeStage}
          onStageClick={setActiveStage}
          hasSchema={!!schemaData}
          hasBom={!!bomData}
          onGenerateSchema={handleGenerateSchema}
          onGenerateBom={handleGenerateBom}
          isLoadingSchema={isLoadingSchema}
          isLoadingBom={isLoadingBom}
        />
      )}

      {/* ── Content area ── */}
      <div className="flex min-h-0 flex-1">

        {/* Phase 0: No document — hero/prompt screen */}
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

        {/* Stage 1 tab: split PRD chat + document viewer */}
        {hasDocument && activeStage === 1 && (
          <>
            <div
              className="flex h-full w-[380px] shrink-0 flex-col lg:w-[420px] xl:w-[450px]"
              style={{ borderRight: "1px solid #f0e6da" }}
            >
              <PrdChat
                markdown={markdown}
                onUpdateMarkdown={updateMarkdown}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                comments={comments}
              />
            </div>
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

        {/* Stage 2 tab: Mermaid diagram + table */}
        {hasDocument && activeStage === 2 && (
          <div className="flex-1 overflow-auto px-6 py-8 md:px-10">
            <StageSchema
              schemaData={schemaData}
              isLoading={isLoadingSchema}
              onRegenerate={handleGenerateSchema}
            />
          </div>
        )}

        {/* Stage 3 tab: Smart BOM with affiliate links */}
        {hasDocument && activeStage === 3 && (
          <div className="flex-1 overflow-auto px-6 py-8 md:px-10">
            <StageBom
              bomData={bomData}
              isLoading={isLoadingBom}
              onRegenerate={handleGenerateBom}
            />
          </div>
        )}
      </div>
    </div>
  );
}
