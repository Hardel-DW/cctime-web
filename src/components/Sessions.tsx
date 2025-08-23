import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Bot, Calendar, Clock, MessageSquare, Users } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { loadDashboardData } from "@/lib/data-service";
import { getCachedDirectoryHandle } from "@/lib/directory-storage";
import { useFilterStore } from "@/lib/store";
import { DataStateWrapper } from "./DataStateWrapper";
import { FilterIndicator } from "./FilterIndicator";

interface SessionData {
    sessionId: string;
    start: Date;
    end: Date;
    messageCount: number;
    project?: string;
}

interface DaySession {
    date: string;
    sessions: SessionData[];
    totalMessages: number;
    totalTime: string;
}

export function Sessions() {
    const router = useRouter();
    const { dataRefreshKey, selectedProject, startDate, endDate } = useFilterStore();
    const hasDirectoryHandle = getCachedDirectoryHandle() !== null;

    const { data, isLoading, error } = useQuery({
        queryKey: ["sessions-data", dataRefreshKey, selectedProject, startDate, endDate],
        queryFn: loadDashboardData,
        staleTime: 5 * 60 * 1000,
        enabled: hasDirectoryHandle
    });

    const sessionsData = React.useMemo(() => {
        if (!data?.allEntries) return [];

        const sessionMap = new Map<string, Map<string, any[]>>();

        // Group entries by date and session
        for (const entry of data.allEntries) {
            if (!entry.timestamp || !entry.sessionId) continue;

            const date = new Date(entry.timestamp).toISOString().split("T")[0];

            if (!sessionMap.has(date)) {
                sessionMap.set(date, new Map());
            }

            const dateMap = sessionMap.get(date);
            if (!dateMap) continue;

            if (!dateMap.has(entry.sessionId)) {
                dateMap.set(entry.sessionId, []);
            }

            dateMap.get(entry.sessionId)?.push(entry);
        }

        const result: DaySession[] = [];

        for (const [date, sessions] of sessionMap) {
            const daySessions: SessionData[] = [];
            let totalMessages = 0;

            for (const [sessionId, entries] of sessions) {
                const sortedEntries = entries.sort((a, b) => new Date(a.timestamp || "").getTime() - new Date(b.timestamp || "").getTime());

                const start = new Date(sortedEntries[0].timestamp || "");
                const end = new Date(sortedEntries[sortedEntries.length - 1].timestamp || "");
                const messageCount = entries.length;
                totalMessages += messageCount;

                // Get project from entries
                const project = entries.find((e) => e.cwd)?.cwd;
                const projectName = project ? project.split(/[/\\]/).pop() || "Unknown Project" : "Unknown Project";

                daySessions.push({
                    sessionId,
                    start,
                    end,
                    messageCount,
                    project: projectName
                });
            }

            // Calculate total time for the day
            let totalMinutes = 0;
            for (const session of daySessions) {
                const duration = Math.max(1, Math.floor((session.end.getTime() - session.start.getTime()) / (1000 * 60)));
                totalMinutes += duration;
            }

            const totalTime = totalMinutes < 60 ? `${totalMinutes}m` : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

            result.push({
                date,
                sessions: daySessions.sort((a, b) => a.start.getTime() - b.start.getTime()),
                totalMessages,
                totalTime
            });
        }

        return result.sort((a, b) => b.date.localeCompare(a.date));
    }, [data]);

    const handleSessionClick = (sessionId: string) => {
        // Navigate to session details
        router.navigate({
            to: "/messages",
            search: { sessionId }
        });
    };

    return (
        <DataStateWrapper
            isLoading={isLoading}
            error={error}
            loadingMessage="Loading your session data..."
            noDirectoryIcon={<Bot className="h-12 w-12" />}
            noDirectoryMessage="Please select your Claude data directory to view sessions."
        >

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
                    <p className="text-muted-foreground">Daily sessions overview with detailed activity breakdown</p>
                </div>
                <FilterIndicator />
            </div>

            {sessionsData.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
                        <p className="text-muted-foreground text-center">
                            No sessions match your current filters. Try adjusting your date range or project selection.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {sessionsData.map((dayData) => {
                        const formattedDate = new Date(dayData.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        });

                        return (
                            <Card key={dayData.date}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                {formattedDate}
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {dayData.sessions.length} session{dayData.sessions.length !== 1 ? "s" : ""}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-4 w-4" />
                                                    {dayData.totalMessages} messages
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {dayData.totalTime}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {dayData.sessions.map((session) => {
                                            const duration = Math.max(
                                                1,
                                                Math.floor((session.end.getTime() - session.start.getTime()) / (1000 * 60))
                                            );
                                            const durationText =
                                                duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h ${duration % 60}m`;

                                            return (
                                                <Button
                                                    key={session.sessionId}
                                                    variant="outline"
                                                    className="h-auto p-4 justify-start flex-col items-start space-y-2 hover:bg-accent cursor-pointer"
                                                    onClick={() => handleSessionClick(session.sessionId)}>
                                                    <div className="flex w-full items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="font-mono text-xs truncate cursor-help">
                                                                        {session.sessionId.slice(0, 8)}...
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="font-mono text-xs">{session.sessionId}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {session.project}
                                                        </Badge>
                                                    </div>

                                                    <div className="w-full space-y-1">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>
                                                                {session.start.toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                })}
                                                            </span>
                                                            <span>→</span>
                                                            <span>
                                                                {session.end.toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                })}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="flex items-center gap-1">
                                                                <MessageSquare className="h-3 w-3" />
                                                                {session.messageCount} messages
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {durationText}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
        </DataStateWrapper>
    );
}
