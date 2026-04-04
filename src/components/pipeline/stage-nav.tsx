"use client";

import { Loader2, CheckCircle2, Lock, ChevronRight, FileText, Layers, ShoppingCart } from "lucide-react";
import type { FlowStage } from "@/lib/project-types";

interface StageNavProps {
    activeStage:      FlowStage;
    onStageClick:     (stage: FlowStage) => void;
    hasSchema:        boolean;
    hasBom:           boolean;
    onGenerateSchema: () => void;
    onGenerateBom:    () => void;
    isLoadingSchema:  boolean;
    isLoadingBom:     boolean;
}

const STAGES: { id: FlowStage; icon: React.ElementType; label: string; sub: string }[] = [
    { id: 1, icon: FileText,     label: "PRD",            sub: "The Architect"  },
    { id: 2, icon: Layers,       label: "Architecture",   sub: "The Visualizer" },
    { id: 3, icon: ShoppingCart, label: "Bill of Materials", sub: "The Buyer"   },
];

export function StageNav({
    activeStage, onStageClick,
    hasSchema, hasBom,
    onGenerateSchema, onGenerateBom,
    isLoadingSchema, isLoadingBom,
}: StageNavProps) {

    const isUnlocked = (id: FlowStage) => {
        if (id === 1) return true;
        if (id === 2) return true;
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
        if (id === 2 && !hasSchema  && !isLoadingSchema) { onGenerateSchema(); return; }
        if (id === 3 && !hasBom     && !isLoadingBom)    { onGenerateBom();   return; }
        onStageClick(id);
    };

    return (
        <div
            className="flex shrink-0 items-center"
            style={{ background: "var(--zf-dark, #070B1A)", borderBottom: "1px solid rgba(59,130,246,0.12)" }}
        >
            {/* Stage tabs */}
            <div className="flex items-stretch flex-1">
                {STAGES.map((stage, idx) => {
                    const unlocked      = isUnlocked(stage.id);
                    const done          = isDone(stage.id);
                    const loading       = isLoading(stage.id);
                    const active        = activeStage === stage.id;
                    const needsGenerate = !done && !loading && unlocked && stage.id !== 1;
                    const Icon          = stage.icon;

                    return (
                        <div key={stage.id} className="flex items-center">
                            {idx > 0 && (
                                <ChevronRight
                                    className="mx-0.5 h-4 w-4 shrink-0"
                                    style={{ color: "rgba(255,255,255,0.15)" }}
                                />
                            )}
                            <button
                                onClick={() => handleClick(stage.id)}
                                disabled={!unlocked}
                                className="relative flex items-center gap-2.5 px-5 py-4 text-sm transition-all disabled:cursor-not-allowed"
                                style={{
                                    borderBottom: active ? "2px solid transparent" : "2px solid transparent",
                                    backgroundImage: active
                                        ? "linear-gradient(transparent, transparent), linear-gradient(135deg, #3B82F6, #06B6D4)"
                                        : "none",
                                    backgroundOrigin: active ? "border-box" : undefined,
                                    borderImageSource: active ? "linear-gradient(135deg, #3B82F6, #06B6D4)" : "none",
                                    color: active
                                        ? "#fff"
                                        : unlocked
                                            ? "rgba(255,255,255,0.5)"
                                            : "rgba(255,255,255,0.2)",
                                    borderBottomWidth: "2px",
                                    borderBottomStyle: "solid",
                                    borderBottomColor: active ? "#3B82F6" : "transparent",
                                    background: active ? "rgba(59,130,246,0.1)" : "transparent",
                                }}
                            >
                                {/* Status indicator */}
                                <span
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                                    style={{
                                        background: done
                                            ? "rgba(6,182,212,0.2)"
                                            : active || needsGenerate
                                                ? "rgba(59,130,246,0.2)"
                                                : "rgba(255,255,255,0.07)",
                                    }}
                                >
                                    {loading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#60A5FA" }} />
                                    ) : done ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#06B6D4" }} />
                                    ) : unlocked ? (
                                        <Icon className="h-3.5 w-3.5" style={{ color: "#3B82F6" }} />
                                    ) : (
                                        <Lock className="h-3 w-3" style={{ color: "rgba(255,255,255,0.25)" }} />
                                    )}
                                </span>

                                {/* Labels */}
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[13px] font-semibold">{stage.label}</span>
                                    <span className="mt-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                                        {loading ? "Generating…" : needsGenerate ? "Click to generate" : stage.sub}
                                    </span>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Stage badge */}
            <div className="mr-4 shrink-0">
                <span
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ background: "var(--zf-gradient)" }}
                >
                    Stage {activeStage} / 3
                </span>
            </div>
        </div>
    );
}
