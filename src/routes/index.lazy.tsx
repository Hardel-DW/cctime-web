import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { BarChart3, Bot, Calendar, Clock, MessageSquare, Timer } from "lucide-react";
import { DailyChart } from "@/components/charts/dashboard/DailyChart";
import { HourlyChart } from "@/components/charts/dashboard/HourlyChart";
import { ProjectChart } from "@/components/charts/dashboard/ProjectChart";
import { DataStateWrapper } from "@/components/layouts/DataStateWrapper";
import { FilterIndicator } from "@/components/layouts/FilterIndicator";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntensityBadge } from "@/components/ui/intensity-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { DataService } from "@/lib/models/DataService";
import { useFilterStore } from "@/lib/store";
import { formatDate, formatTime } from "@/lib/utils";

export const Route = createLazyFileRoute("/")({
    component: IndexComponent
});

export function IndexComponent() {
    const { dataRefreshKey, selectedProject, startDate, endDate, directoryHandle } = useFilterStore();
    const hasDirectoryHandle = directoryHandle !== null;

    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard-data", dataRefreshKey, selectedProject, startDate, endDate],
        queryFn: () => DataService.create(directoryHandle).loadDashboardData(selectedProject, startDate, endDate),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: hasDirectoryHandle // Only run query if directory is selected
    });

    if (!hasDirectoryHandle)
        return (
            <PageLayout>
                <WelcomeScreen />
            </PageLayout>
        );

    return (
        <PageLayout>
            <DataStateWrapper
                isLoading={isLoading}
                error={error}
                loadingMessage="Loading your conversation data..."
                noDirectoryIcon={<Bot className="h-12 w-12" />}
                noDirectoryMessage="Please select your Claude data directory to view analytics.">
                {!data ? null : (
                    <div className="flex flex-1 flex-col gap-6 px-6 py-6">
                        <div className="flex flex-col space-y-3">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                                <p className="text-muted-foreground">Overview of your Claude Code analytics</p>
                            </div>
                            <FilterIndicator />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Days</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data.totalStats.activeDays}</div>
                                    <p className="text-xs text-muted-foreground">Days with conversations</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data.totalStats.totalMessages.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">All messages sent</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                                    <Timer className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data.totalStats.totalSessions}</div>
                                    <p className="text-xs text-muted-foreground">Conversation sessions</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Messages/Day</CardTitle>
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data.totalStats.avgMessagesPerDay}</div>
                                    <p className="text-xs text-muted-foreground">Daily average</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Conv. Time</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data.totalStats.totalConversationTime}</div>
                                    <p className="text-xs text-muted-foreground">Active conversation time</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6">
                            <DailyChart data={data.conversations} />

                            <div className="grid gap-6 md:grid-cols-2">
                                <HourlyChart data={data.hourlyActivity} />
                                <ProjectChart data={data.projectActivity} />
                            </div>

                            <Card className="@container/table">
                                <CardHeader>
                                    <div className="flex flex-col gap-3 @[540px]/table:flex-row @[540px]/table:items-center @[540px]/table:justify-between">
                                        <div>
                                            <CardTitle className="flex flex-wrap items-center gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                <span className="hidden @[400px]/table:inline">Recent Conversations</span>
                                                <span className="@[400px]/table:hidden">Conversations</span>
                                                <Badge variant="outline">{data.conversations.length} days</Badge>
                                            </CardTitle>
                                            <CardDescription className="hidden @[540px]/table:block">
                                                Latest conversation activity and session details
                                            </CardDescription>
                                            <CardDescription className="@[540px]/table:hidden">Recent activity</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" asChild className="hidden cursor-pointer @[540px]/table:flex">
                                            <a href="/daily">View All</a>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-2 sm:px-6">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="min-w-[120px]">Date</TableHead>
                                                    <TableHead className="hidden @[640px]/table:table-cell min-w-[140px]">
                                                        Time Range
                                                    </TableHead>
                                                    <TableHead className="text-right min-w-[80px]">Messages</TableHead>
                                                    <TableHead className="text-right hidden @[480px]/table:table-cell min-w-[80px]">
                                                        Sessions
                                                    </TableHead>
                                                    <TableHead className="text-right hidden @[768px]/table:table-cell min-w-[100px]">
                                                        Duration
                                                    </TableHead>
                                                    <TableHead className="text-right min-w-[80px]">Intensity</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.conversations.map((conversation) => (
                                                    <TableRow key={conversation.date} className="hover:bg-muted/50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{formatDate(conversation.date)}</span>
                                                                <span className="@[640px]/table:hidden text-xs text-muted-foreground">
                                                                    {formatTime(conversation.firstMessage)} →{" "}
                                                                    {formatTime(conversation.lastMessage)}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden @[640px]/table:table-cell">
                                                            <div className="flex gap-1 text-sm">
                                                                <span>{formatTime(conversation.firstMessage)}</span>
                                                                <span className="text-muted-foreground">
                                                                    → {formatTime(conversation.lastMessage)}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-mono text-sm">
                                                                    {conversation.messages.toLocaleString()}
                                                                </span>
                                                                <span className="@[480px]/table:hidden text-xs text-muted-foreground">
                                                                    {conversation.sessions} sessions
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right hidden @[480px]/table:table-cell">
                                                            <Badge variant="outline">{conversation.sessions}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium hidden @[768px]/table:table-cell">
                                                            {conversation.conversationTime}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <IntensityBadge messages={conversation.messages} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {data.conversations.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No conversation data available</p>
                                            <Button variant="outline" className="mt-2" size="sm">
                                                Load Data
                                            </Button>
                                        </div>
                                    )}

                                    <div className="@[540px]/table:hidden mt-4">
                                        <Button variant="outline" size="sm" asChild className="w-full cursor-pointer">
                                            <a href="/daily">View All Conversations</a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </DataStateWrapper>
        </PageLayout>
    );
}
