import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { loadDashboardData } from "@/lib/data-service";
import { getCachedDirectoryHandle } from "@/lib/directory-storage";
import { useFilterStore } from "@/lib/store";
import type { DailyConversation } from "@/lib/types";
import { DataStateWrapper } from "./DataStateWrapper";
import { FilterIndicator } from "./FilterIndicator";

export function ConversationActivity() {
    const { selectedProject, startDate, endDate } = useFilterStore();
    const hasDirectoryHandle = !!getCachedDirectoryHandle();

    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard-data", selectedProject, startDate, endDate],
        queryFn: () => loadDashboardData(),
        enabled: hasDirectoryHandle
    });

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const getIntensityBadge = (messages: number) => {
        if (messages > 1000) return <Badge variant="destructive">High</Badge>;
        if (messages > 500) return <Badge variant="default">Medium</Badge>;
        return <Badge variant="secondary">Low</Badge>;
    };

    // Use ALL daily conversations data (not limited to 10)
    const conversationData = data?.conversations || [];

    // Calculate totals
    const totals = conversationData.reduce(
        (acc, conversation) => {
            acc.totalMessages += conversation.messages;
            acc.totalSessions += conversation.sessions;

            // Parse duration (format can be: "1h 30m", "45m", "2h 0m", etc.)
            const duration = conversation.conversationTime;
            console.log("Duration format:", duration); // Debug log

            // Try different patterns
            const hourMinPattern = duration.match(/(\d+)h\s*(\d+)m/); // "1h 30m"
            const hourOnlyPattern = duration.match(/(\d+)h$/); // "1h"
            const minOnlyPattern = duration.match(/(\d+)m$/); // "30m"
            const hourMinSpacePattern = duration.match(/(\d+)\s*hours?\s*(\d+)\s*min/); // "1 hour 30 min"
            const minSpacePattern = duration.match(/(\d+)\s*min/); // "30 min"

            let totalMinutes = 0;

            if (hourMinPattern) {
                totalMinutes = parseInt(hourMinPattern[1]) * 60 + parseInt(hourMinPattern[2]);
            } else if (hourOnlyPattern) {
                totalMinutes = parseInt(hourOnlyPattern[1]) * 60;
            } else if (minOnlyPattern) {
                totalMinutes = parseInt(minOnlyPattern[1]);
            } else if (hourMinSpacePattern) {
                totalMinutes = parseInt(hourMinSpacePattern[1]) * 60 + parseInt(hourMinSpacePattern[2]);
            } else if (minSpacePattern) {
                totalMinutes = parseInt(minSpacePattern[1]);
            }

            acc.totalDurationMinutes += totalMinutes;

            return acc;
        },
        {
            totalMessages: 0,
            totalSessions: 0,
            totalDurationMinutes: 0
        }
    );

    const formatDuration = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes}min`;
    };

    return (
        <DataStateWrapper
            isLoading={isLoading}
            error={error}
            loadingMessage="Loading conversation activity..."
            noDirectoryIcon={<MessageSquare className="h-12 w-12" />}
            noDirectoryMessage="Please select your Claude data directory to view conversation activity."
        >
            <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Daily Activity</h1>
                    <p className="text-muted-foreground">Complete conversation activity history</p>
                </div>
                <Badge variant="outline" className="text-sm">
                    {conversationData.length} days
                </Badge>
            </div>

            <FilterIndicator />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                All Conversation Activity
                            </CardTitle>
                            <CardDescription>Complete daily conversation history and session details</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {conversationData.length > 0 ? (
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
                                {conversationData.map((conversation: DailyConversation) => (
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
                                        <TableCell className="text-right">{getIntensityBadge(conversation.messages)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No Activity Found</p>
                            <p>No conversation data available for the selected filters.</p>
                        </div>
                    )}

                    {conversationData.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold">{totals.totalMessages.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">Total Messages</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold">{totals.totalSessions.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold">{formatDuration(totals.totalDurationMinutes)}</p>
                                    <p className="text-sm text-muted-foreground">Total Duration</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            </div>
        </DataStateWrapper>
    );
}
