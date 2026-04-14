import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Download, Loader2, Wand2, MessageSquarePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useId, createContext, useContext, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// --- Types ---
export interface BlockComment {
    id: string;
    blockText: string;
    commentText: string;
}

// --- Context ---
interface HoverContextType {
    hoveredId: string | null;
    setHoveredId: (id: string | null) => void;
    comments: BlockComment[];
    addComment: (blockId: string, blockText: string, commentText: string) => void;
    editComment: (commentId: string, newText: string) => void;
    deleteComment: (commentId: string) => void;
}

const HoverContext = createContext<HoverContextType>({
    hoveredId: null,
    setHoveredId: () => { },
    comments: [],
    addComment: () => { },
    editComment: () => { },
    deleteComment: () => { },
});

// --- Props ---
interface DocumentViewerProps {
    markdown: string;
    isLoading: boolean;
    onUpdateMarkdown: (newMarkdown: string) => void;
    comments: BlockComment[];
    onCommentsChange: (comments: BlockComment[]) => void;
}

export function DocumentViewer({ markdown, isLoading, onUpdateMarkdown, comments, onCommentsChange }: DocumentViewerProps) {
    const [commandInput, setCommandInput] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // --- Comment CRUD ---
    const addComment = (blockId: string, blockText: string, commentText: string) => {
        onCommentsChange([...comments, { id: blockId, blockText, commentText }]);
    };

    const editComment = (commentId: string, newText: string) => {
        onCommentsChange(comments.map(c => c.id === commentId ? { ...c, commentText: newText } : c));
    };

    const deleteComment = (commentId: string) => {
        onCommentsChange(comments.filter(c => c.id !== commentId));
    };

    // --- Markdown components with hoverable blocks ---
    const markdownComponents = useMemo(() => {
        const createHoverable = (Tag: any) => {
            return function HoverableElement({ node, children, ...props }: any) {
                const id = useId();
                const ctx = useContext(HoverContext);
                const [isOpen, setIsOpen] = useState(false);
                const [localCommand, setLocalCommand] = useState("");
                const [isEditing, setIsEditing] = useState(false);
                const [editText, setEditText] = useState("");
                const blockRef = useRef<any>(null);

                const extractText = (nodes: any): string => {
                    if (!nodes) return '';
                    if (typeof nodes === 'string') return nodes;
                    if (Array.isArray(nodes)) return nodes.map(extractText).join('');
                    if (nodes?.props?.children) return extractText(nodes.props.children);
                    return '';
                };

                const textContent = extractText(children);

                // Find existing comment for this block
                const existingComment = ctx.comments.find(c => c.id === id);

                const handleAddComment = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!localCommand.trim()) return;
                    ctx.addComment(id, textContent, localCommand.trim());
                    setLocalCommand("");
                    setIsOpen(false);
                    ctx.setHoveredId(null);
                };

                const handleSaveEdit = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!editText.trim()) return;
                    ctx.editComment(id, editText.trim());
                    setIsEditing(false);
                    setEditText("");
                };

                const isHovered = ctx.hoveredId === id;
                const hasComment = !!existingComment;

                const Wrapper = Tag === 'li' ? 'li' : 'div';

                return (
                    <Wrapper ref={blockRef} className="relative">
                        <div
                            className={`relative rounded-lg transition-all duration-150 px-3 py-1.5 -mx-3 ${isHovered || isOpen ? 'bg-blue-50/60 border-l-2 border-l-blue-400 dark:bg-blue-950/30 dark:border-l-blue-500' : hasComment ? 'bg-amber-50/40 border-l-2 border-l-amber-400 dark:bg-amber-950/20 dark:border-l-amber-500' : 'border-l-2 border-l-transparent'} ${props.className || ''}`}
                            onMouseOver={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                if (ctx.hoveredId !== id) ctx.setHoveredId(id);
                            }}
                            onMouseLeave={() => {
                                if (!isOpen && ctx.hoveredId === id) ctx.setHoveredId(null);
                            }}
                        >
                            {Tag === 'li' ? (
                                <div className="pr-10">{children}</div>
                            ) : (
                                <Tag {...props} className="pr-10 m-0">
                                    {children}
                                </Tag>
                            )}

                            {/* Always-visible comment indicator badge */}
                            {hasComment && !isHovered && !isOpen && (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 z-[5]">
                                    <div className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-white shadow-sm animate-in fade-in duration-200">
                                        <MessageSquarePlus className="h-3 w-3" />
                                        <span className="text-[10px] font-semibold">1</span>
                                    </div>
                                </div>
                            )}

                            {/* Hover icon - always show on hover, even if comment exists */}
                            <div className={`absolute right-1 top-1/2 -translate-y-1/2 transition-opacity duration-150 ${isOpen || isHovered ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
                                <Popover open={isOpen} onOpenChange={(open) => {
                                    setIsOpen(open);
                                    if (!open) {
                                        ctx.setHoveredId(null);
                                        setLocalCommand("");
                                    }
                                }}>
                                    <PopoverTrigger className="inline-flex items-center justify-center rounded-md h-7 w-7 bg-blue-500 text-white shadow-sm hover:bg-blue-600 transition-colors">
                                        <MessageSquarePlus className="h-3.5 w-3.5" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-72 p-0 rounded-lg shadow-xl border-slate-200 dark:border-slate-700" side="bottom" align="end">
                                        <form onSubmit={handleAddComment} className="flex flex-col">
                                            <div className="p-3">
                                                <Input
                                                    placeholder="Leave a comment..."
                                                    value={localCommand}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalCommand(e.target.value)}
                                                    autoFocus
                                                    className="h-9 text-sm border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 px-3 pb-3">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs text-slate-500 hover:text-slate-700"
                                                    onClick={() => { setIsOpen(false); setLocalCommand(""); }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    className="h-7 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                                                    disabled={!localCommand.trim()}
                                                >
                                                    Add Comment
                                                </Button>
                                            </div>
                                        </form>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Inline comment chip - appears BELOW the block */}
                        {existingComment && !isEditing && (
                            <div className="ml-1 mt-1 mb-2 flex items-start gap-2 group/comment">
                                <div className="flex-1 flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-white text-xs shadow-md max-w-md">
                                    <MessageSquarePlus className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                                    <span className="leading-relaxed flex-1">{existingComment.commentText}</span>
                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setIsEditing(true); setEditText(existingComment.commentText); }}
                                            className="rounded p-0.5 text-slate-400 hover:text-white transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => ctx.deleteComment(id)}
                                            className="rounded p-0.5 text-slate-400 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Editing comment inline */}
                        {existingComment && isEditing && (
                            <div className="ml-1 mt-1 mb-2 max-w-md">
                                <form onSubmit={handleSaveEdit} className="rounded-lg bg-slate-800 p-2.5 shadow-md">
                                    <Input
                                        value={editText}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
                                        autoFocus
                                        className="h-7 text-xs bg-slate-900 border-slate-600 text-white mb-2"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                        <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px] text-slate-400 hover:text-white px-2" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" size="sm" className="h-6 text-[11px] bg-blue-500 hover:bg-blue-600 text-white px-2" disabled={!editText.trim()}>
                                            Save
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </Wrapper>
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
    }, [markdown, onUpdateMarkdown, comments, onCommentsChange]);

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
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading && !isApplying) {
        return (
            <div className="flex h-full w-full flex-col space-y-4 rounded-xl border border-slate-200 bg-transparent p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-transparent/50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/50">
                <p>Your generated PRD will appear here.</p>
            </div>
        );
    }

    return (
        <HoverContext.Provider value={{ hoveredId, setHoveredId, comments, addComment, editComment, deleteComment }}>
            <div className="relative flex h-full w-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Generated Spec</h2>
                        {comments.length > 0 && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                {comments.length} comment{comments.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
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

                <div className="relative flex-1 overflow-auto rounded-xl border border-slate-200 bg-transparent p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {isApplying && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent/50 backdrop-blur-sm dark:bg-slate-900/50">
                            <div className="flex items-center space-x-2 rounded-lg bg-transparent px-4 py-2 shadow-lg dark:bg-slate-800 dark:text-white">
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


            </div>
        </HoverContext.Provider>
    );
}
