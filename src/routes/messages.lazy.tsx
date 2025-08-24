import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bot, Calendar, Check, Clock, Copy, MessageSquare, User } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFilterStore } from "@/lib/store";
import { DataService } from "@/lib/models/DataService";
import { SessionDetailsManager } from "@/lib/models/analytics/SessionDetailsManager";
import { DataStateWrapper } from "@/components/layouts/DataStateWrapper";
import { PageLayout } from "@/components/layouts/PageLayout";

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

    return (
        <PageLayout>
            <DataStateWrapper
                isLoading={isLoading}
                error={error}
                loadingMessage="Loading session details..."
                noDirectoryIcon={<Bot className="h-12 w-12" />}
                noDirectoryMessage="Please select your Claude data directory to view session details."
            >
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
                                    <span className="font-semibold">
                                        {sessionData.totalTokens.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Started: {sessionData.start.toLocaleString()}</span>
                                <span>Ended: {sessionData.end.toLocaleString()}</span>
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
                                            <div className={`flex items-center gap-2 ${message.role === "user" ? "justify-end" : ""}`}>
                                                {message.role === "assistant" ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold">Claude</span>
                                                        {message.model && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {message.model}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
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
                                                            {isCopied(`message-${index}`) ? (
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
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 order-1 self-start mt-1">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                        )}

                                        {message.role === "user" && (
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 self-start mt-1">
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
            </DataStateWrapper>
        </PageLayout>
    );
}