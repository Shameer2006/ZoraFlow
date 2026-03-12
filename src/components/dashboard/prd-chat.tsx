"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { BlockComment } from "@/components/dashboard/document-viewer";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface PrdChatProps {
    markdown: string;
    onUpdateMarkdown: (newMarkdown: string) => void;
    onGenerate: (prompt: string) => void;
    isGenerating: boolean;
    comments: BlockComment[];
}

/* ── Decorative sparkle SVGs ── */
function SparkleOrange({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 0C40 0 44 28 52 36C60 44 80 40 80 40C80 40 60 44 52 52C44 60 40 80 40 80C40 80 36 60 28 52C20 44 0 40 0 40C0 40 20 36 28 28C36 20 40 0 40 0Z" fill="#FF6B35" />
        </svg>
    );
}

function SparkleGreen({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 0C30 0 33 21 39 27C45 33 60 30 60 30C60 30 45 33 39 39C33 45 30 60 30 60C30 60 27 45 21 39C15 33 0 30 0 30C0 30 15 27 21 21C27 15 30 0 30 0Z" fill="#2EC4B6" />
        </svg>
    );
}

function SparkleYellow({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 0C25 0 27.5 17.5 32.5 22.5C37.5 27.5 50 25 50 25C50 25 37.5 27.5 32.5 32.5C27.5 37.5 25 50 25 50C25 50 22.5 37.5 17.5 32.5C12.5 27.5 0 25 0 25C0 25 12.5 22.5 17.5 17.5C22.5 12.5 25 0 25 0Z" fill="#FFB627" />
        </svg>
    );
}

export function PrdChat({ markdown, onUpdateMarkdown, onGenerate, isGenerating, comments }: PrdChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasDocument = !!markdown;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [hasSeeded, setHasSeeded] = useState(false);
    useEffect(() => {
        if (markdown && !hasSeeded && messages.length === 0) {
            setMessages([
                { role: "assistant", content: "Your PRD has been generated! Feel free to ask me to refine it, add sections, or answer questions about it." }
            ]);
            setHasSeeded(true);
        }
    }, [markdown, hasSeeded, messages.length]);

    const buildCommentsContext = () => {
        if (comments.length === 0) return "";
        const commentsList = comments.map((c, i) =>
            `Comment ${i + 1}: On section "${c.blockText.substring(0, 80)}..." → "${c.commentText}"`
        ).join("\n");
        return `\n\nThe user has attached ${comments.length} inline comment(s) to the PRD:\n${commentsList}\n\nPlease consider these comments when making changes.`;
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isGenerating) return;
        onGenerate(prompt.trim());
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");

        const newMessages: Message[] = [
            ...messages,
            { role: "user", content: userMsg }
        ];

        setMessages(newMessages);
        setIsLoading(true);

        try {
            const commentsContext = buildCommentsContext();

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map((m, i) =>
                        i === newMessages.length - 1 && m.role === "user"
                            ? { ...m, content: m.content + commentsContext }
                            : m
                    ),
                    document: markdown,
                    commandOnly: false
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get response");
            }

            setMessages([
                ...newMessages,
                { role: "assistant", content: data.reply }
            ]);

            if (data.updatedDocument) {
                onUpdateMarkdown(data.updatedDocument);
            }
        } catch (error: any) {
            console.error(error);
            setMessages([
                ...newMessages,
                { role: "assistant", content: `**Error:** ${error.message}` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Phase 1: No document yet — warm, premium hero prompt ───
    if (!hasDocument) {
        return (
            <div className="relative flex h-full w-full flex-col" style={{ background: '#FFF8F0' }}>
                {/* Top Navigation */}
                <nav className="flex items-center justify-between px-8 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
                            Zora<span style={{ color: '#FF6B35' }}>Flow</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium" style={{ color: '#666' }}>Docs</span>
                        <span className="text-sm font-medium" style={{ color: '#666' }}>Pricing</span>
                        <button className="rounded-full px-4 py-1.5 text-sm font-semibold text-white" style={{ background: '#1a1a2e' }}>
                            Sign In
                        </button>
                    </div>
                </nav>

                {/* Hero section with decorative sparkles */}
                <div className="relative flex flex-1 flex-col items-center justify-center px-6">
                    {/* Decorative sparkles */}
                    <SparkleOrange className="absolute left-[12%] top-[15%] h-12 w-12 animate-pulse" />
                    <SparkleGreen className="absolute right-[15%] top-[20%] h-10 w-10 animate-pulse [animation-delay:500ms]" />
                    <SparkleYellow className="absolute left-[8%] bottom-[30%] h-8 w-8 animate-pulse [animation-delay:1000ms]" />
                    <SparkleOrange className="absolute right-[10%] bottom-[25%] h-6 w-6 animate-pulse [animation-delay:750ms]" />
                    <SparkleGreen className="absolute left-[25%] top-[8%] h-6 w-6 animate-pulse [animation-delay:300ms]" />

                    {/* Main heading */}
                    <h1
                        className="mb-4 text-center font-extrabold leading-[1.1] tracking-tight"
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#1a1a2e' }}
                    >
                        Generate your PRD
                        <br />
                        <span style={{ color: '#FF6B35' }}>in seconds</span>
                    </h1>
                    <p className="mb-10 max-w-lg text-center text-base leading-relaxed" style={{ color: '#666' }}>
                        Turn any project idea into a comprehensive Product Requirements Document.
                        <br />
                        <span style={{ color: '#FF6B35' }}>Powered by AI to architect your next product.</span>
                    </p>

                    {/* Input card */}
                    <form onSubmit={handleGenerate} className="w-full max-w-2xl">
                        <div
                            className="rounded-2xl p-5 shadow-lg"
                            style={{
                                background: '#FFF',
                                border: '2px solid #1a1a2e',
                            }}
                        >
                            <textarea
                                placeholder="e.g. A habit tracking app focusing on gamification with social features..."
                                className="w-full resize-none border-0 bg-transparent text-base outline-none placeholder:text-slate-400"
                                style={{ minHeight: '100px', color: '#1a1a2e', fontFamily: 'inherit' }}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isGenerating}
                            />
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs font-medium" style={{ color: '#999' }}>
                                    ⚡ Uses Gemini 2.5 Flash · 2 credits
                                </span>
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || isGenerating}
                                    className="rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{ background: '#FF6B35' }}
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </span>
                                    ) : (
                                        "Generate →"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Quick suggestions */}
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <p className="text-xs font-medium" style={{ color: '#999' }}>
                            Try these example ideas:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                "SaaS Dashboard",
                                "Mobile E-commerce",
                                "AI Chatbot Platform",
                                "Social Media App",
                                "EdTech Platform"
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => setPrompt(suggestion)}
                                    className="rounded-full px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
                                    style={{
                                        background: '#1a1a2e',
                                        color: '#FFF',
                                        border: '1.5px solid #1a1a2e',
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-center gap-6 px-8 py-4" style={{ borderTop: '1px solid #f0e6da' }}>
                    <span className="text-xs" style={{ color: '#999' }}>Built with ❤️ using Next.js & Gemini</span>
                </div>
            </div>
        );
    }

    // ─── Phase 2: Document exists — chat panel on the left ───
    return (
        <div className="flex h-full flex-col" style={{ background: '#FFF8F0' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #f0e6da' }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#FF6B35' }}>
                    <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold" style={{ color: '#1a1a2e' }}>
                        Zora<span style={{ color: '#FF6B35' }}>Flow</span> Assistant
                    </h3>
                    <p className="text-[11px]" style={{ color: '#999' }}>Ask questions or request edits</p>
                </div>
            </div>

            {/* Comment badge */}
            {comments.length > 0 && (
                <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs" style={{ background: '#FFF3E0', border: '1px solid #FFD9B3' }}>
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" style={{ color: '#FF6B35' }} />
                    <span style={{ color: '#995200' }}>
                        <strong>{comments.length}</strong> inline comment{comments.length !== 1 ? 's' : ''} — mention them to apply
                    </span>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                            style={msg.role === "user"
                                ? { background: '#1a1a2e', color: '#FFF' }
                                : { background: '#FFF', color: '#1a1a2e', border: '1px solid #f0e6da' }
                            }
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl px-4 py-3" style={{ background: '#FFF', border: '1px solid #f0e6da' }}>
                            <div className="flex gap-1.5">
                                <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: '#FF6B35' }}></span>
                                <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: '#FFB627' }}></span>
                                <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: '#2EC4B6' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4" style={{ borderTop: '1px solid #f0e6da' }}>
                <form onSubmit={handleSend} className="flex gap-2">
                    <div
                        className="flex flex-1 items-center rounded-xl px-3"
                        style={{ background: '#FFF', border: '2px solid #1a1a2e' }}
                    >
                        <Input
                            placeholder={comments.length > 0 ? "e.g. Apply all comments..." : "e.g. Add offline support..."}
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                            style={{ color: '#1a1a2e' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: '#FF6B35' }}
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
