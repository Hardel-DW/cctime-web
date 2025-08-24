import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layouts/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Bot, Calendar, Clock, MessageSquare, Timer } from "lucide-react";
import { useFilterStore } from "@/lib/store";
import { DataService } from "@/lib/models/DataService";
import { DataStateWrapper } from "@/components/layouts/DataStateWrapper";
import { DailyChart } from "@/components/charts/dashboard/DailyChart";
import { HourlyChart } from "@/components/charts/dashboard/HourlyChart";
import { ProjectChart } from "@/components/charts/dashboard/ProjectChart";
import { FilterIndicator } from "@/components/layouts/FilterIndicator";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatTime } from "@/lib/utils";
import { IntensityBadge } from "@/components/ui/intensity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
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


    if (!hasDirectoryHandle) return (
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
                noDirectoryMessage="Please select your Claude data directory to view analytics."
            >
                {!data ? null : (
                    <div className="flex flex-1 flex-col gap-6 px-6 py-6">
                        <div className="flex flex-col space-y-3">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                                <p className="text-muted-foreground">Overview of your Claude Code conversation analytics</p>
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

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                Recent Conversations
                                                <Badge variant="outline">{data.conversations.length} days</Badge>
                                            </CardTitle>
                                            <CardDescription>Latest conversation activity and session details</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href="/daily">View All</a>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Time Range</TableHead>
                                                <TableHead className="text-right">Messages</TableHead>
                                                <TableHead className="text-right">Sessions</TableHead>
                                                <TableHead className="text-right">Duration</TableHead>
                                                <TableHead className="text-right">Intensity</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.conversations.map((conversation) => (
                                                <TableRow key={conversation.date} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">{formatDate(conversation.date)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1 text-sm">
                                                            <span>{formatTime(conversation.firstMessage)}</span>
                                                            <span className="text-muted-foreground">→ {formatTime(conversation.lastMessage)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">{conversation.messages.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline">{conversation.sessions}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">{conversation.conversationTime}</TableCell>
                                                    <TableCell className="text-right"><IntensityBadge messages={conversation.messages} /></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {data.conversations.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No conversation data available</p>
                                            <Button variant="outline" className="mt-2" size="sm">
                                                Load Data
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </DataStateWrapper>
        </PageLayout>
    );
}
