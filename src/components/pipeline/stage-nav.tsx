"use client";

import { Loader2, CheckCircle2, Lock, ChevronRight } from "lucide-react";
import type { FlowStage } from "@/lib/project-types";

interface StageNavProps {
    activeStage: FlowStage;
    onStageClick: (stage: FlowStage) => void;
    hasSchema: boolean;
    hasBom: boolean;
    onGenerateSchema: () => void;
    onGenerateBom: () => void;
    isLoadingSchema: boolean;
    isLoadingBom: boolean;
}

const STAGES = [
    {
        id: 1 as FlowStage,
        icon: "📄",
        label: "Spec → PRD",
        sub: "The Architect",
    },
    {
        id: 2 as FlowStage,
        icon: "🔷",
        label: "Logic → Schema",
        sub: "The Visualizer",
    },
    {
        id: 3 as FlowStage,
        icon: "🛒",
        label: "Smart BOM",
        sub: "The Buyer",
    },
];

export function StageNav({
    activeStage,
    onStageClick,
    hasSchema,
    hasBom,
    onGenerateSchema,
    onGenerateBom,
    isLoadingSchema,
    isLoadingBom,
}: StageNavProps) {
    const isUnlocked = (id: FlowStage) => {
        if (id === 1) return true;
        if (id === 2) return true; // unlocked as soon as PRD exists
        if (id === 3) return hasSchema;
        return false;
    };

    const isDone = (id: FlowStage) => {
        if (id === 1) return true;
        if (id === 2) return hasSchema;
        if (id === 3) return hasBom;
        return false;
    };

    const isLoading = (id: FlowStage) => {
        if (id === 2) return isLoadingSchema;
        if (id === 3) return isLoadingBom;
        return false;
    };

    const handleClick = (id: FlowStage) => {
        if (!isUnlocked(id)) return;
        if (id === 2 && !hasSchema && !isLoadingSchema) {
            onGenerateSchema();
            return;
        }
        if (id === 3 && !hasBom && !isLoadingBom) {
            onGenerateBom();
            return;
        }
        onStageClick(id);
    };

    return (
        <div
            className="flex items-center gap-0 shrink-0"
            style={{
                background: "#1a1a2e",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            {/* Logo */}
            <div className="flex items-center px-6 py-3.5 shrink-0" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-base font-extrabold tracking-tight text-white">
                    Zora<span style={{ color: "#FF6B35" }}>Flow</span>
                </span>
            </div>

            {/* Stage tabs */}
            <div className="flex items-stretch flex-1">
                {STAGES.map((stage, idx) => {
                    const unlocked = isUnlocked(stage.id);
                    const done = isDone(stage.id);
                    const loading = isLoading(stage.id);
                    const active = activeStage === stage.id;
                    const needsGenerate = !done && !loading && unlocked && stage.id !== 1;

                    return (
                        <div key={stage.id} className="flex items-center">
                            {idx > 0 && (
                                <ChevronRight
                                    className="mx-1 h-4 w-4 shrink-0"
                                    style={{ color: "rgba(255,255,255,0.2)" }}
                                />
                            )}

                            <button
                                onClick={() => handleClick(stage.id)}
                                disabled={!unlocked}
                                className="relative flex items-center gap-2.5 px-5 py-3.5 text-sm transition-all disabled:cursor-not-allowed"
                                style={{
                                    borderBottom: active
                                        ? "2px solid #FF6B35"
                                        : "2px solid transparent",
                                    color: active ? "#fff" : unlocked ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
                                    background: active ? "rgba(255,107,53,0.08)" : "transparent",
                                }}
                            >
                                {/* Status icon */}
                                <span
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                                    style={{
                                        background: done
                                            ? "rgba(46,196,182,0.15)"
                                            : active || needsGenerate
                                                ? "rgba(255,107,53,0.2)"
                                                : "rgba(255,255,255,0.07)",
                                    }}
                                >
                                    {loading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#FFB627" }} />
                                    ) : done ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#2EC4B6" }} />
                                    ) : unlocked ? (
                                        <span style={{ color: "#FF6B35" }}>{stage.icon}</span>
                                    ) : (
                                        <Lock className="h-3 w-3" style={{ color: "rgba(255,255,255,0.25)" }} />
                                    )}
                                </span>

                                {/* Labels */}
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[13px] font-semibold">{stage.label}</span>
                                    <span className="mt-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                                        {loading ? "Generating…" : needsGenerate ? "Click to generate ⚡" : stage.sub}
                                    </span>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Stage counter badge */}
            <div className="mr-5 shrink-0">
                <span
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: "rgba(255,107,53,0.15)", color: "#FF6B35" }}
                >
                    Stage {activeStage} / 3
                </span>
            </div>
        </div>
    );
}
