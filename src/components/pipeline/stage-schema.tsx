"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { SchemaOutput } from "@/lib/project-types";

interface StageSchemaProps {
    schemaData: SchemaOutput | null;
    isLoading: boolean;
    onRegenerate?: () => void;
}

/**
 * Fix common Mermaid v11 syntax issues produced by AI generators.
 * Runs BEFORE mermaid.render() as a safety net.
 */
function sanitizeMermaid(raw: string): string {
    let code = raw.trim();

    // ── 1. Normalise literal \n escape sequences → real line breaks ──────────
    code = code.replace(/\\n/g, "\n");

    // ── 2. Strip any leftover markdown code fences ───────────────────────────
    code = code.replace(/^```(?:mermaid)?\s*/i, "").replace(/\s*```$/, "").trim();

    // ── 3. Replace cylinder shape [(…)] with plain rectangle ["…"] ───────────
    //    e.g.  DB[("PostgreSQL")]  →  DB["PostgreSQL"]
    code = code.replace(/\[\("([^"]*)"\)\]/g, '["$1"]');
    code = code.replace(/\[\(([^)]+)\)\]/g, '["$1"]');

    // ── 4. Remove escaped quotes INSIDE labels (common AI mistake) ───────────
    //    e.g.  API[\"Next.js\"] → API["Next.js"]
    code = code.replace(/\[\\"/g, '["').replace(/\\"\]/g, '"]');

    // ── 5. Strip edge labels that contain special chars breaking v11 parser ──
    //    e.g.  --> |"GPIO 4"| → -->
    //    (keep plain text edge labels like -->|text|, strip only quoted ones)
    code = code.replace(/-->\|"[^"]*"\|/g, "-->").replace(/-->\|'[^']*'\|/g, "-->");

    // ── 6. Remove any stray escaped backslashes before quotes ───────────────
    code = code.replace(/\\"/g, '"');

    return code;
}

function MermaidRenderer({ code }: { code: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        if (!code || !containerRef.current) return;
        setError(null);
        setRendered(false);

        const id = "mermaid-" + Math.random().toString(36).slice(2, 9);
        const sanitized = sanitizeMermaid(code);

        import("mermaid").then(async (m) => {
            const mermaid = m.default;
            mermaid.initialize({
                startOnLoad: false,
                securityLevel: "loose",
                theme: "base",
                themeVariables: {
                    primaryColor: "#0A0A15",
                    primaryTextColor: "#ffffff",
                    primaryBorderColor: "#3B82F6",
                    lineColor: "#06B6D4",
                    secondaryColor: "#050510",
                    background: "transparent",
                    nodeBorder: "#3B82F6",
                    clusterBkg: "#0B0F3C",
                    titleColor: "#ffffff",
                    edgeLabelBackground: "#0A0A2A",
                    fontSize: "14px",
                },
            });

            try {
                const { svg } = await mermaid.render(id, sanitized);
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                    const svgEl = containerRef.current.querySelector("svg");
                    if (svgEl) {
                        svgEl.style.width = "100%";
                        svgEl.style.height = "auto";
                        svgEl.style.maxWidth = "100%";
                    }
                    setRendered(true);
                }
            } catch (e: any) {
                setError(e.message || "Diagram syntax error");
            }
        });
    }, [code]);

    if (error) {
        // Graceful fallback — show the diagram as readable code instead of an ugly error
        return (
            <div className="space-y-3">
                <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium"
                    style={{ background: "rgba(59,130,246,0.1)", border: "1px solid #3B82F6", color: "#BFDBFE" }}
                >
                    <span>⚠️</span>
                    <span>Diagram could not render — showing raw source below. Try clicking <strong>Regenerate</strong>.</span>
                </div>
                <pre
                    className="overflow-x-auto rounded-xl p-4 text-xs leading-relaxed"
                    style={{ background: "var(--zf-dark-2)", color: "#06B6D4", fontFamily: "monospace" }}
                >
                    {sanitizeMermaid(code)}
                </pre>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full"
            style={{ minHeight: rendered ? undefined : "120px" }}
        />
    );
}


const IOT_TABLE_HEADERS = ["Component", "Pin", "Connection", "Voltage"];
const SAAS_TABLE_HEADERS = ["Endpoint", "Method", "Description"];

function DataTable({ tableData, projectType }: { tableData: SchemaOutput["tableData"]; projectType: "iot" | "saas" }) {
    const headers = projectType === "iot" ? IOT_TABLE_HEADERS : SAAS_TABLE_HEADERS;
    const keys = projectType === "iot"
        ? ["component", "pin", "connection", "voltage"]
        : ["endpoint", "method", "description"];

    if (!tableData || tableData.length === 0) return null;

    return (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--zf-border)" }}>
            <table className="w-full text-sm">
                <thead>
                    <tr style={{ background: "var(--zf-dark-2)" }}>
                        {headers.map((h) => (
                            <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "#06B6D4" }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, idx) => (
                        <tr
                            key={idx}
                            style={{
                                background: idx % 2 === 0 ? "var(--zf-dark)" : "var(--zf-dark-2)",
                                borderBottom: "1px solid var(--zf-border)",
                            }}
                        >
                            {keys.map((k) => {
                                // AI might hallucinate casing, e.g. "Pin" instead of "pin"
                                const val = row[k] ?? row[k.charAt(0).toUpperCase() + k.slice(1)] ?? row[k.toUpperCase()] ?? row[k + 's'] ?? row[k.charAt(0).toUpperCase() + k.slice(1) + 's'];
                                return (
                                <td key={k} className="px-4 py-3" style={{ color: "#ffffff" }}>
                                    {k === "method" ? (
                                        <span
                                            className="rounded-full px-2 py-0.5 text-xs font-bold"
                                            style={{
                                                background:
                                                    val === "GET" ? "#EAFAF1" :
                                                        val === "POST" ? "#EBF5FB" :
                                                            val === "PUT" || val === "PATCH" ? "#FFF9E6" :
                                                                val === "DELETE" ? "#FDEDEC" : "var(--zf-dark)",
                                                color:
                                                    val === "GET" ? "#1E8449" :
                                                        val === "POST" ? "#1A5276" :
                                                            val === "PUT" || val === "PATCH" ? "#7D6608" :
                                                                val === "DELETE" ? "#922B21" : "#555",
                                            }}
                                        >
                                            {val || "—"}
                                        </span>
                                    ) : (
                                        <span className="font-mono text-xs">{val || "—"}</span>
                                    )}
                                </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function StageSchema({ schemaData, isLoading, onRegenerate }: StageSchemaProps) {
    if (isLoading) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(255,107,53,0.1)", border: "2px solid #FF6B35" }}
                >
                    <Loader2 className="h-7 w-7 animate-spin" style={{ color: "#3B82F6" }} />
                </div>
                <div className="text-center">
                    <p className="text-base font-semibold" style={{ color: "#ffffff" }}>Generating your schema…</p>
                    <p className="mt-1 text-sm" style={{ color: "#64748B" }}>
                        ZoraFlow AI is reading your PRD and drawing the architecture
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

    if (!schemaData) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: "var(--zf-navy)", border: "2px dashed #06B6D4" }}
                >
                    🔷
                </div>
                <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                    Click "Logic → Schema" in the nav to generate diagrams
                </p>
            </div>
        );
    }

    const isIot = schemaData.projectType === "iot";

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="rounded-full px-3 py-1 text-xs font-bold"
                            style={{
                                background: isIot ? "rgba(255,182,39,0.15)" : "rgba(46,196,182,0.15)",
                                color: isIot ? "#06B6D4" : "#60A5FA",
                            }}
                        >
                            {isIot ? "🛠️ IoT / Hardware Project" : "💻 SaaS / Software Project"}
                        </span>
                    </div>
                    <h2 className="text-2xl font-extrabold" style={{ color: "#ffffff" }}>
                        {isIot ? "Wiring Schematic & Flowchart" : "System Architecture & API Map"}
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: "#94A3B8" }}>
                        {isIot
                            ? "Auto-generated from your PRD — verify pin assignments against your hardware datasheet"
                            : "Auto-generated from your PRD — adjust endpoints and architecture to your needs"}
                    </p>
                </div>
                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
                        style={{ background: "var(--zf-dark-2)", color: "#ffffff" }}
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerate
                    </button>
                )}
            </div>

            {/* Mermaid Diagram */}
            <div
                className="rounded-2xl p-6"
                style={{ background: "var(--zf-dark)", border: "1px solid var(--zf-border)" }}
            >
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: "#3B82F6" }}>
                    {isIot ? "⚡ System Flowchart" : "🏗️ Architecture Diagram"}
                </h3>
                <MermaidRenderer code={schemaData.mermaidCode} />
            </div>

            {/* Supporting Table */}
            {schemaData.tableData && schemaData.tableData.length > 0 && (
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: "#3B82F6" }}>
                        {isIot ? "📌 Wiring Table" : "🗺️ API Endpoint Map"}
                    </h3>
                    <DataTable tableData={schemaData.tableData} projectType={schemaData.projectType} />
                </div>
            )}

            {/* Raw mermaid code (collapsed) */}
            <details className="rounded-xl" style={{ border: "1px solid var(--zf-border)" }}>
                <summary
                    className="cursor-pointer px-4 py-3 text-xs font-semibold select-none rounded-xl"
                    style={{ color: "#94A3B8", background: "#FFF8F0" }}
                >
                    View raw Mermaid source
                </summary>
                <pre
                    className="overflow-x-auto p-4 text-xs"
                    style={{ background: "var(--zf-dark-2)", color: "#06B6D4", fontFamily: "monospace", borderRadius: "0 0 12px 12px" }}
                >
                    {schemaData.mermaidCode}
                </pre>
            </details>
        </div>
    );
}
