"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { SchemaOutput } from "@/lib/project-types";

interface StageSchemaProps {
    schemaData: SchemaOutput | null;
    isLoading: boolean;
    onRegenerate?: () => void;
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

        import("mermaid").then(async (m) => {
            const mermaid = m.default;
            mermaid.initialize({
                startOnLoad: false,
                theme: "base",
                themeVariables: {
                    primaryColor: "#FF6B35",
                    primaryTextColor: "#1a1a2e",
                    primaryBorderColor: "#FF6B35",
                    lineColor: "#FFB627",
                    secondaryColor: "#FFF8F0",
                    background: "#FFFFFF",
                    nodeBorder: "#1a1a2e",
                    clusterBkg: "#FFF8F0",
                    titleColor: "#1a1a2e",
                    edgeLabelBackground: "#FFF8F0",
                    fontSize: "14px",
                },
            });

            try {
                const { svg } = await mermaid.render(id, code);
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                    // Make SVG fill its container
                    const svgEl = containerRef.current.querySelector("svg");
                    if (svgEl) {
                        svgEl.style.width = "100%";
                        svgEl.style.height = "auto";
                        svgEl.style.maxWidth = "100%";
                    }
                    setRendered(true);
                }
            } catch (e: any) {
                setError(e.message || "Failed to render diagram");
            }
        });
    }, [code]);

    if (error) {
        return (
            <div
                className="rounded-xl p-4 text-sm"
                style={{ background: "#FFF0EE", border: "1px solid #f5c6c2", color: "#C0392B" }}
            >
                <p className="font-semibold mb-1">⚠️ Diagram render error</p>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">{error}</pre>
                <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap opacity-60">{code}</pre>
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
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #f0e6da" }}>
            <table className="w-full text-sm">
                <thead>
                    <tr style={{ background: "#1a1a2e" }}>
                        {headers.map((h) => (
                            <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "#FFB627" }}
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
                                background: idx % 2 === 0 ? "#FFFFFF" : "#FFF8F0",
                                borderBottom: "1px solid #f0e6da",
                            }}
                        >
                            {keys.map((k) => (
                                <td key={k} className="px-4 py-3" style={{ color: "#1a1a2e" }}>
                                    {k === "method" ? (
                                        <span
                                            className="rounded-full px-2 py-0.5 text-xs font-bold"
                                            style={{
                                                background:
                                                    row[k] === "GET" ? "#EAFAF1" :
                                                        row[k] === "POST" ? "#EBF5FB" :
                                                            row[k] === "PUT" || row[k] === "PATCH" ? "#FFF9E6" :
                                                                row[k] === "DELETE" ? "#FDEDEC" : "#F2F3F4",
                                                color:
                                                    row[k] === "GET" ? "#1E8449" :
                                                        row[k] === "POST" ? "#1A5276" :
                                                            row[k] === "PUT" || row[k] === "PATCH" ? "#7D6608" :
                                                                row[k] === "DELETE" ? "#922B21" : "#555",
                                            }}
                                        >
                                            {row[k] || "—"}
                                        </span>
                                    ) : (
                                        <span className="font-mono text-xs">{row[k] || "—"}</span>
                                    )}
                                </td>
                            ))}
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
                    <Loader2 className="h-7 w-7 animate-spin" style={{ color: "#FF6B35" }} />
                </div>
                <div className="text-center">
                    <p className="text-base font-semibold" style={{ color: "#1a1a2e" }}>Generating your schema…</p>
                    <p className="mt-1 text-sm" style={{ color: "#999" }}>
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
                    style={{ background: "#FFF8F0", border: "2px dashed #FFB627" }}
                >
                    🔷
                </div>
                <p className="text-sm font-medium" style={{ color: "#999" }}>
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
                                color: isIot ? "#7B5800" : "#0E6655",
                            }}
                        >
                            {isIot ? "🛠️ IoT / Hardware Project" : "💻 SaaS / Software Project"}
                        </span>
                    </div>
                    <h2 className="text-2xl font-extrabold" style={{ color: "#1a1a2e" }}>
                        {isIot ? "Wiring Schematic & Flowchart" : "System Architecture & API Map"}
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: "#888" }}>
                        {isIot
                            ? "Auto-generated from your PRD — verify pin assignments against your hardware datasheet"
                            : "Auto-generated from your PRD — adjust endpoints and architecture to your needs"}
                    </p>
                </div>
                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
                        style={{ background: "#f0e6da", color: "#1a1a2e" }}
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerate
                    </button>
                )}
            </div>

            {/* Mermaid Diagram */}
            <div
                className="rounded-2xl p-6"
                style={{ background: "#FFF", border: "2px solid #1a1a2e" }}
            >
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: "#FF6B35" }}>
                    {isIot ? "⚡ System Flowchart" : "🏗️ Architecture Diagram"}
                </h3>
                <MermaidRenderer code={schemaData.mermaidCode} />
            </div>

            {/* Supporting Table */}
            {schemaData.tableData && schemaData.tableData.length > 0 && (
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: "#FF6B35" }}>
                        {isIot ? "📌 Wiring Table" : "🗺️ API Endpoint Map"}
                    </h3>
                    <DataTable tableData={schemaData.tableData} projectType={schemaData.projectType} />
                </div>
            )}

            {/* Raw mermaid code (collapsed) */}
            <details className="rounded-xl" style={{ border: "1px solid #f0e6da" }}>
                <summary
                    className="cursor-pointer px-4 py-3 text-xs font-semibold select-none rounded-xl"
                    style={{ color: "#888", background: "#FFF8F0" }}
                >
                    View raw Mermaid source
                </summary>
                <pre
                    className="overflow-x-auto p-4 text-xs"
                    style={{ background: "#1a1a2e", color: "#FFB627", fontFamily: "monospace", borderRadius: "0 0 12px 12px" }}
                >
                    {schemaData.mermaidCode}
                </pre>
            </details>
        </div>
    );
}
