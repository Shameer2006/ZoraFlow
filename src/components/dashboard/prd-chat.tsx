"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface PrdChatProps {
    markdown: string;
    onUpdateMarkdown: (newMarkdown: string) => void;
}

export function PrdChat({ markdown, onUpdateMarkdown }: PrdChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! How can I help you improve this PRD?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
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

    return (
        <div className="flex h-full flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">PRD Assistant</h3>
                <p className="text-xs text-slate-500">Ask questions or request edits</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${msg.role === "user"
                            ? "ml-auto bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                            : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                            }`}
                    >
                        {msg.content}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        placeholder="e.g. Add offline support..."
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="bg-slate-50 dark:bg-slate-900/50"
                    />
                    <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
