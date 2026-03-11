import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Download, Loader2, Wand2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useId, createContext, useContext } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface HoverContextType {
    hoveredId: string | null;
    setHoveredId: (id: string | null) => void;
}

const HoverContext = createContext<HoverContextType>({
    hoveredId: null,
    setHoveredId: () => { },
});

interface DocumentViewerProps {
    markdown: string;
    isLoading: boolean;
    onUpdateMarkdown: (newMarkdown: string) => void;
}

export function DocumentViewer({ markdown, isLoading, onUpdateMarkdown }: DocumentViewerProps) {
    const [commandInput, setCommandInput] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const markdownComponents = useMemo(() => {
        const createHoverable = (Tag: any) => {
            return function HoverableElement({ node, children, ...props }: any) {
                const id = useId();
                const { hoveredId, setHoveredId } = useContext(HoverContext);
                const [isOpen, setIsOpen] = useState(false);
                const [localCommand, setLocalCommand] = useState("");
                const [isLocalApplying, setIsLocalApplying] = useState(false);

                const extractText = (nodes: any): string => {
                    if (!nodes) return '';
                    if (typeof nodes === 'string') return nodes;
                    if (Array.isArray(nodes)) return nodes.map(extractText).join('');
                    if (nodes?.props?.children) return extractText(nodes.props.children);
                    return '';
                };

                const textContent = extractText(children);

                const onSubmit = async (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!localCommand.trim() || isLocalApplying) return;
                    setIsLocalApplying(true);
                    try {
                        const response = await fetch("/api/chat", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                messages: [{ role: "user", content: localCommand }],
                                document: markdown,
                                targetSection: textContent,
                                commandOnly: true
                            }),
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error);
                        if (data.updatedDocument) {
                            onUpdateMarkdown(data.updatedDocument);
                        }
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setIsLocalApplying(false);
                        setIsOpen(false);
                        setLocalCommand("");
                        setHoveredId(null);
                    }
                };

                const isHovered = hoveredId === id;

                return (
                    <Tag
                        {...props}
                        className={`group relative rounded-xl border border-transparent transition-colors px-4 py-2 -mx-4 -my-1 ${isHovered || isOpen ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50' : ''} ${props.className || ''}`}
                        onMouseOver={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (hoveredId !== id) setHoveredId(id);
                        }}
                        onMouseLeave={() => {
                            if (!isOpen && hoveredId === id) setHoveredId(null);
                        }}
                    >
                        {children}
                        <div className={`absolute right-2 top-2 transition-opacity duration-200 ${isOpen || isHovered ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none -z-10'}`}>
                            <Popover open={isOpen} onOpenChange={(open) => {
                                setIsOpen(open);
                                if (!open) setHoveredId(null);
                            }}>
                                <PopoverTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 bg-blue-500 text-white shadow-sm hover:bg-blue-600 hover:scale-105 active:scale-95">
                                    <MessageSquarePlus className="h-4 w-4" />
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-3" side="top" align="start">
                                    <form onSubmit={onSubmit} className="flex gap-2">
                                        <Input
                                            placeholder="Tell AI to edit this block..."
                                            value={localCommand}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalCommand(e.target.value)}
                                            autoFocus
                                            className="h-8 text-sm"
                                            disabled={isLocalApplying}
                                        />
                                        <Button type="submit" size="sm" className="h-8 shrink-0 bg-blue-500 hover:bg-blue-600 text-white" disabled={isLocalApplying}>
                                            {isLocalApplying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                                        </Button>
                                    </form>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </Tag>
                );
            };
        };

        return {
            p: createHoverable('p'),
            h1: createHoverable('h1'),
            h2: createHoverable('h2'),
            h3: createHoverable('h3'),
            li: createHoverable('li'),
        };
    }, [markdown, onUpdateMarkdown]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(markdown);
    };

    const handleCommandSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commandInput.trim() || isApplying) return;

        setIsApplying(true);
        const commandText = commandInput.trim();
        setCommandInput("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: commandText }],
                    document: markdown,
                    commandOnly: true
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to apply command");
            }

            if (data.updatedDocument) {
                onUpdateMarkdown(data.updatedDocument);
            }
        } catch (error: any) {
            console.error(error);
            // Ignore error for now, ideally show a toast notification
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading && !isApplying) {
        return (
            <div className="flex h-full w-full flex-col space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-10 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="pt-8">
                    <Skeleton className="mb-4 h-8 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>
        );
    }

    if (!markdown) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/50">
                <p>Your generated PRD will appear here.</p>
            </div>
        );
    }

    return (
        <HoverContext.Provider value={{ hoveredId, setHoveredId }}>
            <div className="relative flex h-full w-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Generated Spec</h2>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-8 shadow-sm">
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Copy
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 shadow-sm">
                            <Download className="mr-2 h-3.5 w-3.5" />
                            PDF
                        </Button>
                    </div>
                </div>

                <div className="relative flex-1 overflow-auto rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {isApplying && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
                            <div className="flex items-center space-x-2 rounded-lg bg-white px-4 py-2 shadow-lg dark:bg-slate-800 dark:text-white">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-900 dark:text-slate-100" />
                                <span className="text-sm font-medium">Applying Changes...</span>
                            </div>
                        </div>
                    )}
                    <div className="prose prose-slate max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {markdown}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Floating Inline Command Bar */}
                <div className="absolute bottom-6 left-1/2 w-full max-w-lg -translate-x-1/2 px-4">
                    <form
                        onSubmit={handleCommandSubmit}
                        className="flex items-center space-x-2 rounded-full border border-slate-200 bg-white/80 p-1.5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <Wand2 className="h-4 w-4" />
                        </div>
                        <Input
                            placeholder="Type a command to edit this document (e.g. 'Make the tone more professional')"
                            className="h-9 flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 dark:placeholder:text-slate-500"
                            value={commandInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommandInput(e.target.value)}
                            disabled={isApplying}
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!commandInput.trim() || isApplying}
                            className="h-9 rounded-full px-4"
                        >
                            Apply
                        </Button>
                    </form>
                </div>
            </div>
        </HoverContext.Provider>
    );
}
