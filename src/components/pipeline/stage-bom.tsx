"use client";

import { Loader2, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";
import type { BomOutput, HardwareBomItem, SaasBomItem } from "@/lib/project-types";

interface StageBomProps {
    bomData: BomOutput | null;
    isLoading: boolean;
    onRegenerate?: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    database: { bg: "rgba(46,196,182,0.12)", text: "#0E6655" },
    hosting: { bg: "rgba(255,182,39,0.12)", text: "#7B5800" },
    auth: { bg: "rgba(255,107,53,0.12)", text: "#922B21" },
    payment: { bg: "rgba(52,152,219,0.12)", text: "#1A5276" },
    email: { bg: "rgba(155,89,182,0.12)", text: "#6C3483" },
    storage: { bg: "rgba(39,174,96,0.12)", text: "#1E8449" },
    analytics: { bg: "rgba(231,76,60,0.12)", text: "#922B21" },
    monitoring: { bg: "rgba(127,140,141,0.12)", text: "#424949" },
};

function getCategoryStyle(category: string) {
    return CATEGORY_COLORS[category?.toLowerCase()] ?? { bg: "rgba(26,26,46,0.08)", text: "#1a1a2e" };
}

function HardwareBomCard({ item, idx }: { item: HardwareBomItem & { buyUrl?: string }; idx: number }) {
    return (
        <div
            className="group flex flex-col gap-3 rounded-2xl p-5 transition-all hover:shadow-md"
            style={{ background: "#FFF", border: "2px solid #f0e6da" }}
        >
            {/* Row number + name */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ background: "#1a1a2e" }}
                    >
                        {idx + 1}
                    </span>
                    <div>
                        <p className="font-bold text-base" style={{ color: "#1a1a2e" }}>{item.name}</p>
                        <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "#666" }}>{item.role}</p>
                    </div>
                </div>

                {/* Buy button */}
                {item.buyUrl && (
                    <a
                        href={item.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                        style={{ background: "#FF6B35" }}
                    >
                        Buy on Amazon
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </div>

            {/* Warning */}
            {item.warning && (
                <div
                    className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-medium"
                    style={{ background: "#FFF8E1", border: "1px solid #FFD54F", color: "#7B5800" }}
                >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {item.warning}
                </div>
            )}
        </div>
    );
}

function SaasBomCard({ item }: { item: SaasBomItem & { affiliateUrl?: string } }) {
    const style = getCategoryStyle(item.category);

    return (
        <div
            className="group flex flex-col gap-3 rounded-2xl p-5 transition-all hover:shadow-md"
            style={{ background: "#FFF", border: "2px solid #f0e6da" }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    {/* Category badge */}
                    <span
                        className="mt-0.5 shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                        style={{ background: style.bg, color: style.text }}
                    >
                        {item.category || "tool"}
                    </span>
                    <div>
                        <p className="font-bold text-base" style={{ color: "#1a1a2e" }}>{item.name}</p>
                        <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "#666" }}>{item.role}</p>
                    </div>
                </div>

                {/* CTA button */}
                {item.affiliateUrl && (
                    <a
                        href={item.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all hover:opacity-90 active:scale-[0.97]"
                        style={{ background: "#1a1a2e", color: "#FFF" }}
                    >
                        Get Started
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </div>

            {/* Free tier */}
            {item.freeTier && (
                <div
                    className="rounded-xl px-3 py-2 text-xs font-medium"
                    style={{ background: "rgba(46,196,182,0.08)", border: "1px solid rgba(46,196,182,0.2)", color: "#0E6655" }}
                >
                    ✅ Free tier: {item.freeTier}
                </div>
            )}
        </div>
    );
}

export function StageBom({ bomData, isLoading, onRegenerate }: StageBomProps) {
    if (isLoading) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(255,107,53,0.1)", border: "2px solid #FF6B35" }}
                >
                    <Loader2 className="h-7 w-7 animate-spin" style={{ color: "#FF6B35" }} />
                </div>
                <div className="text-center">
                    <p className="text-base font-semibold" style={{ color: "#1a1a2e" }}>
                        Building your Smart BOM…
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "#999" }}>
                        ZoraFlow AI is sourcing the best tools and components for your project
                    </p>
                </div>
                <div className="mt-2 flex gap-1.5">
                    {["#FF6B35", "#FFB627", "#2EC4B6"].map((c, i) => (
                        <span
                            key={i}
                            className="h-2 w-2 rounded-full animate-bounce"
                            style={{ background: c, animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!bomData) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: "#FFF8F0", border: "2px dashed #FFB627" }}
                >
                    🛒
                </div>
                <p className="text-sm font-medium" style={{ color: "#999" }}>
                    Generate your Schema first, then click "Smart BOM" to build your shopping list
                </p>
            </div>
        );
    }

    const isHardware = bomData.bomType === "hardware";

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span
                            className="rounded-full px-3 py-1 text-xs font-bold"
                            style={{
                                background: isHardware ? "rgba(255,182,39,0.15)" : "rgba(46,196,182,0.15)",
                                color: isHardware ? "#7B5800" : "#0E6655",
                            }}
                        >
                            {isHardware ? "🛠️ Hardware BOM" : "💻 SaaS Stack"}
                        </span>
                        <span
                            className="rounded-full px-2.5 py-1 text-xs font-bold"
                            style={{ background: "rgba(255,107,53,0.12)", color: "#FF6B35" }}
                        >
                            {bomData.items.length} items
                        </span>
                    </div>
                    <h2 className="text-2xl font-extrabold" style={{ color: "#1a1a2e" }}>
                        {isHardware ? "Bill of Materials" : "Recommended Tech Stack"}
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: "#888" }}>
                        {isHardware
                            ? "Affiliate links open Amazon search — earn us a commission when you buy 🙏"
                            : "All services have free tiers to get you started — upgrade when you scale"}
                    </p>
                </div>

                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
                        style={{ background: "#f0e6da", color: "#1a1a2e" }}
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerate
                    </button>
                )}
            </div>

            {/* Disclaimer */}
            <div
                className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                style={{ background: "#FFF8F0", border: "1px solid #FFD9B3", color: "#7a4500" }}
            >
                <strong>Disclosure:</strong>{" "}
                {isHardware
                    ? "Links go to Amazon search results. ZoraFlow may earn a small affiliate commission if you purchase — at no extra cost to you."
                    : "Some links may be affiliate links. ZoraFlow may earn referral bonuses from service signups — at no extra cost to you."}
            </div>

            {/* Cards */}
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {isHardware
                    ? (bomData.items as Array<HardwareBomItem & { buyUrl?: string }>).map((item, idx) => (
                        <HardwareBomCard key={idx} item={item} idx={idx} />
                    ))
                    : (bomData.items as Array<SaasBomItem & { affiliateUrl?: string }>).map((item, idx) => (
                        <SaasBomCard key={idx} item={item} />
                    ))}
            </div>
        </div>
    );
}
