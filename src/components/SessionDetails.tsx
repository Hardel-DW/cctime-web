import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bot, Calendar, Check, Clock, Copy, MessageSquare, User } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { loadDashboardData } from "@/lib/data-service";
import { getCachedDirectoryHandle } from "@/lib/directory-storage";
import { useFilterStore } from "@/lib/store";

interface MessageData {
    timestamp: string;
    role: "user" | "assistant";
    content: string;
    tokens?: {
        input?: number;
        output?: number;
        cache_creation?: number;
        cache_read?: number;
    };
    model?: string;
}

interface SessionDetailsProps {
    sessionId: string;
}

export function SessionDetails({ sessionId }: SessionDetailsProps) {
    const router = useRouter();
    const { dataRefreshKey } = useFilterStore();
    const hasDirectoryHandle = getCachedDirectoryHandle() !== null;
    const [copiedStates, setCopiedStates] = React.useState<{ [key: string]: boolean }>({});

    const { data, isLoading, error } = useQuery({
        queryKey: ["session-details", sessionId, dataRefreshKey],
        queryFn: loadDashboardData,
        staleTime: 5 * 60 * 1000,
        enabled: hasDirectoryHandle && !!sessionId
    });

    const sessionData = React.useMemo(() => {
        if (!data?.allEntries || !sessionId) return null;

        const sessionEntries = data.allEntries
            .filter((entry) => entry.sessionId === sessionId)
            .filter((entry) => entry.timestamp)
            .sort((a, b) => new Date(a.timestamp || "").getTime() - new Date(b.timestamp || "").getTime());

        if (sessionEntries.length === 0) return null;

        const messages: MessageData[] = [];
        const totalTokens = { input: 0, output: 0, cache_creation: 0, cache_read: 0 };
        let project = "Unknown Project";

        for (const entry of sessionEntries) {
            if (entry.cwd) {
                project = entry.cwd.split(/[/\\]/).pop() || "Unknown Project";
            }

            const role = entry.message?.role as "user" | "assistant" | undefined;
            if (!role) continue;

            let content = "";
            if (entry.message?.content) {
                if (Array.isArray(entry.message.content)) {
                    content = entry.message.content
                        .map((c) => c.text || (c.type === "tool_use" ? `[Tool: ${(c as any).name}]` : ""))
                        .join("\n")
                        .trim();
                } else if (typeof entry.message.content === "string") {
                    content = entry.message.content;
                }
            }

            const tokens = {
                input: entry.message?.usage?.input_tokens || 0,
                output: entry.message?.usage?.output_tokens || 0,
                cache_creation: entry.message?.usage?.cache_creation_input_tokens || 0,
                cache_read: entry.message?.usage?.cache_read_input_tokens || 0
            };

            totalTokens.input += tokens.input;
            totalTokens.output += tokens.output;
            totalTokens.cache_creation += tokens.cache_creation;
            totalTokens.cache_read += tokens.cache_read;

            messages.push({
                timestamp: entry.timestamp || "",
                role,
                content: content || "[Empty message]",
                tokens,
                model: entry.message?.model
            });
        }

        const startTime = new Date(sessionEntries[0].timestamp || "");
        const endTime = new Date(sessionEntries[sessionEntries.length - 1].timestamp || "");
        const duration = Math.max(1, Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)));

        return {
            sessionId,
            project,
            startTime,
            endTime,
            duration,
            messages,
            totalTokens,
            messageCount: messages.length
        };
    }, [data, sessionId]);

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedStates((prev) => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopiedStates((prev) => ({ ...prev, [id]: false }));
            }, 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    if (!hasDirectoryHandle) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">No Directory Selected</h2>
                    <p>Please select your Claude data directory to view session details.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
                </div>

                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-1/3 bg-muted rounded"></div>
                        <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={`loading-skeleton-${i.toString()}`} className="h-24 bg-muted rounded"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-center text-red-600">
                    <h2 className="text-2xl font-bold mb-2">Error loading session</h2>
                    <p>{error instanceof Error ? error.message : "Unknown error"}</p>
                </div>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>

                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
                        <p className="text-muted-foreground text-center">The session with ID "{sessionId}" could not be found.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const durationText =
        sessionData.duration < 60 ? `${sessionData.duration}m` : `${Math.floor(sessionData.duration / 60)}h ${sessionData.duration % 60}m`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Session Details</h1>
                    <p className="text-muted-foreground">
                        Conversation messages and activity for session {sessionData.sessionId.slice(0, 8)}...
                    </p>
                </div>
            </div>

            {/* Session Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Session Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Project</p>
                            <Badge variant="secondary">{sessionData.project}</Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span className="font-semibold">{durationText}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Messages</p>
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span className="font-semibold">{sessionData.messageCount}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Tokens</p>
                            <span className="font-semibold">
                                {(sessionData.totalTokens.input + sessionData.totalTokens.output).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Started: {sessionData.startTime.toLocaleString()}</span>
                        <span>Ended: {sessionData.endTime.toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Messages */}
            <Card>
                <CardHeader>
                    <CardTitle>Conversation Messages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sessionData.messages.map((message, index) => (
                        <div key={`${message.timestamp}-${index}`} className="space-y-3">
                            <div className={`flex gap-3 ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                                <div className={`max-w-3xl space-y-2 ${message.role === "assistant" ? "order-2" : ""}`}>
                                    <div className="flex items-center gap-2">
                                        {message.role === "assistant" ? (
                                            <div className="flex items-center gap-2">
                                                <Bot className="h-4 w-4" />
                                                <span className="text-sm font-semibold">Claude</span>
                                                {message.model && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {message.model}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span className="text-sm font-semibold">You</span>
                                            </div>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <Card className={message.role === "assistant" ? "bg-muted/50" : "bg-primary/5"}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <pre className="whitespace-pre-wrap text-sm break-words flex-1 font-sans">
                                                    {message.content}
                                                </pre>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 flex-shrink-0"
                                                    onClick={() => copyToClipboard(message.content, `message-${index}`)}>
                                                    {copiedStates[`message-${index}`] ? (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>

                                            {message.tokens && ((message.tokens.input ?? 0) > 0 || (message.tokens.output ?? 0) > 0) && (
                                                <div className="mt-3 pt-3 border-t border-border/50">
                                                    <div className="flex gap-4 text-xs text-muted-foreground">
                                                        {(message.tokens.input ?? 0) > 0 && (
                                                            <span>Input: {(message.tokens.input ?? 0).toLocaleString()}</span>
                                                        )}
                                                        {(message.tokens.output ?? 0) > 0 && (
                                                            <span>Output: {(message.tokens.output ?? 0).toLocaleString()}</span>
                                                        )}
                                                        {(message.tokens.cache_read ?? 0) > 0 && (
                                                            <span>Cache: {(message.tokens.cache_read ?? 0).toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {message.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 order-1">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                )}

                                {message.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>

                            {index < sessionData.messages.length - 1 && <Separator className="my-4" />}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
