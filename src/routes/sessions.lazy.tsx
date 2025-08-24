import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, useRouter } from "@tanstack/react-router";
import { Bot, Calendar, Clock, MessageSquare, Users } from "lucide-react";
import { DataStateWrapper } from "@/components/layouts/DataStateWrapper";
import { FilterIndicator } from "@/components/layouts/FilterIndicator";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SessionStats } from "@/lib/models/analytics/SessionStats";
import { DataService } from "@/lib/models/DataService";
import { useFilterStore } from "@/lib/store";

export const Route = createLazyFileRoute("/sessions")({
    component: SessionsComponent
});

export function SessionsComponent() {
    const router = useRouter();
    const { dataRefreshKey, selectedProject, startDate, endDate, directoryHandle } = useFilterStore();
    const { data, isLoading, error } = useQuery({
        queryKey: ["sessions-data", dataRefreshKey, selectedProject, startDate, endDate],
        queryFn: () => DataService.create(directoryHandle).loadDashboardData(selectedProject, startDate, endDate),
        staleTime: 5 * 60 * 1000,
        enabled: directoryHandle !== null
    });
    const sessionsData = data?.allEntries ? SessionStats.fromRawEntries(data.allEntries).daySessions : [];

    return (
        <PageLayout>
            <DataStateWrapper
                isLoading={isLoading}
                error={error}
                loadingMessage="Loading your session data..."
                noDirectoryIcon={<Bot className="h-12 w-12" />}
                noDirectoryMessage="Please select your Claude data directory to view sessions.">
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
                                                            onClick={() =>
                                                                router.navigate({
                                                                    to: "/messages",
                                                                    search: { sessionId: session.sessionId }
                                                                })
                                                            }>
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
        </PageLayout>
    );
}
