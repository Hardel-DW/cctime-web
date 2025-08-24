import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bot, Calendar, Check, Clock, Copy, MessageSquare, User } from "lucide-react";
import { DataStateWrapper } from "@/components/layouts/DataStateWrapper";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { SessionDetailsManager } from "@/lib/models/analytics/SessionDetailsManager";
import { DataService } from "@/lib/models/DataService";
import { useFilterStore } from "@/lib/store";

export const Route = createLazyFileRoute("/messages")({
    component: SessionDetailsComponent
});

export function SessionDetailsComponent() {
    const router = useRouter();
    const { sessionId } = Route.useSearch() as { sessionId: string };
    const { dataRefreshKey, directoryHandle } = useFilterStore();
    const hasDirectoryHandle = directoryHandle !== null;
    const { copyToClipboard, isCopied } = useCopyToClipboard();
    const { data, isLoading, error } = useQuery({
        queryKey: ["session-details", sessionId, dataRefreshKey],
        queryFn: () => DataService.create(directoryHandle).loadDashboardData(),
        staleTime: 5 * 60 * 1000,
        enabled: hasDirectoryHandle && !!sessionId
    });

    const sessionData = data?.allEntries ? new SessionDetailsManager(data.allEntries).getSessionDetails(sessionId) : null;

    return (
        <PageLayout>
            <DataStateWrapper
                isLoading={isLoading}
                error={error}
                loadingMessage="Loading session details..."
                noDirectoryIcon={<Bot className="h-12 w-12" />}
                noDirectoryMessage="Please select your Claude data directory to view session details.">
                {!sessionData && !isLoading ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold tracking-tight">Session Details</h1>
                                <p className="text-muted-foreground">Session not found</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => router.history.back()}>
                                <ArrowLeft className="h-4 w-4" />
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
                ) : sessionData ? (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="@container/header flex flex-col gap-4 @[640px]/header:flex-row @[640px]/header:items-center @[640px]/header:justify-between">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight @[640px]/header:text-3xl">Session Details</h1>
                                <p className="text-muted-foreground text-sm @[640px]/header:text-base">
                                    <span className="hidden @[400px]/header:inline">Conversation messages and activity for session </span>
                                    <span className="@[400px]/header:hidden">Session </span>
                                    {sessionData.sessionId.slice(0, 8)}...
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.history.back()}
                                className="cursor-pointer self-start @[640px]/header:self-center">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Session Overview */}
                        <Card className="@container/overview">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    <span className="hidden @[400px]/overview:inline">Session Overview</span>
                                    <span className="@[400px]/overview:hidden">Overview</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 @[480px]/overview:grid-cols-2 @[768px]/overview:grid-cols-4">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Project</p>
                                        <Badge variant="secondary" className="break-all">
                                            {sessionData.project}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Duration</p>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span className="font-semibold">{sessionData.duration}</span>
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
                                        <span className="font-semibold">{sessionData.totalTokens.total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="flex flex-col gap-2 text-sm text-muted-foreground @[480px]/overview:flex-row @[480px]/overview:items-center @[480px]/overview:justify-between">
                                    <span>Started: {sessionData.start.toLocaleString()}</span>
                                    <span>Ended: {sessionData.end.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Messages */}
                        <Card className="@container/messages">
                            <CardHeader>
                                <CardTitle>
                                    <span className="hidden @[400px]/messages:inline">Conversation Messages</span>
                                    <span className="@[400px]/messages:hidden">Messages</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-2 @[640px]/messages:px-6">
                                {sessionData.messages.map((message, index) => (
                                    <div key={`${message.timestamp}-${index}`} className="space-y-3">
                                        <div
                                            className={`flex gap-2 @[640px]/messages:gap-3 ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                                            <div
                                                className={`min-w-0 max-w-full space-y-2 @[480px]/messages:max-w-[85%] @[768px]/messages:max-w-[75%] @[1024px]/messages:max-w-3xl ${message.role === "assistant" ? "order-2" : ""}`}>
                                                <div
                                                    className={`flex flex-wrap items-center gap-2 ${message.role === "user" ? "justify-end" : ""}`}>
                                                    {message.role === "assistant" ? (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-sm font-semibold">Claude</span>
                                                            {message.model && (
                                                                <Badge variant="outline" className="text-xs break-all">
                                                                    <span className="hidden @[480px]/messages:inline">{message.model}</span>
                                                                    <span className="@[480px]/messages:hidden">
                                                                        {message.model.split("-")[0]}
                                                                    </span>
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold">You</span>
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {new Date(message.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>

                                                <Card className={message.role === "assistant" ? "bg-muted/50" : "bg-primary/5"}>
                                                    <CardContent className="p-3 @[640px]/messages:p-4">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1 overflow-hidden">
                                                                <pre className="whitespace-pre-wrap text-sm break-words overflow-wrap-anywhere font-sans">
                                                                    {message.content}
                                                                </pre>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 flex-shrink-0 ml-2"
                                                                onClick={() => copyToClipboard(message.content, `message-${index}`)}>
                                                                {isCopied(`message-${index}`) ? (
                                                                    <Check className="h-3 w-3 text-green-500" />
                                                                ) : (
                                                                    <Copy className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                        </div>

                                                        {message.tokens &&
                                                            ((message.tokens.input ?? 0) > 0 || (message.tokens.output ?? 0) > 0) && (
                                                                <div className="mt-3 pt-3 border-t border-border/50">
                                                                    <div className="flex flex-wrap gap-3 @[640px]/messages:gap-4 text-xs text-muted-foreground">
                                                                        {(message.tokens.input ?? 0) > 0 && (
                                                                            <span className="whitespace-nowrap">
                                                                                <span className="hidden @[480px]/messages:inline">
                                                                                    Input:{" "}
                                                                                </span>
                                                                                <span className="@[480px]/messages:hidden">In: </span>
                                                                                {(message.tokens.input ?? 0).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                        {(message.tokens.output ?? 0) > 0 && (
                                                                            <span className="whitespace-nowrap">
                                                                                <span className="hidden @[480px]/messages:inline">
                                                                                    Output:{" "}
                                                                                </span>
                                                                                <span className="@[480px]/messages:hidden">Out: </span>
                                                                                {(message.tokens.output ?? 0).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                        {(message.tokens.cache_read ?? 0) > 0 && (
                                                                            <span className="whitespace-nowrap">
                                                                                Cache: {(message.tokens.cache_read ?? 0).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {message.role === "assistant" && (
                                                <div className="w-6 h-6 @[640px]/messages:w-8 @[640px]/messages:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 order-1 self-start mt-1">
                                                    <Bot className="h-3 w-3 @[640px]/messages:h-4 @[640px]/messages:w-4" />
                                                </div>
                                            )}

                                            {message.role === "user" && (
                                                <div className="w-6 h-6 @[640px]/messages:w-8 @[640px]/messages:h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 self-start mt-1">
                                                    <User className="h-3 w-3 @[640px]/messages:h-4 @[640px]/messages:w-4" />
                                                </div>
                                            )}
                                        </div>

                                        {index < sessionData.messages.length - 1 && <Separator className="my-4" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                ) : null}
            </DataStateWrapper>
        </PageLayout>
    );
}
