"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";

interface PrdGeneratorProps {
    onGenerate: (prompt: string) => void;
    isGenerating: boolean;
}

export function PrdGenerator({ onGenerate, isGenerating }: PrdGeneratorProps) {
    const [prompt, setPrompt] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isGenerating) return;
        onGenerate(prompt);
    };

    return (
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <div className="flex-1">
                <Textarea
                    id="prompt"
                    placeholder="e.g. A habit tracking app focusing on gamification with social features..."
                    className="min-h-[250px] resize-none border-slate-200 bg-slate-50 p-4 text-base focus-visible:ring-slate-400 dark:border-slate-800 dark:bg-slate-900/50"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                />
                <div className="mt-3 text-xs text-slate-500">
                    This uses Gemini 1.5 Flash to rapidly generate your spec. (Cost: 2 credits)
                </div>
            </div>

            <div className="mt-6">
                <Button
                    type="submit"
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                    disabled={!prompt.trim() || isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Spec...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate PRD
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
