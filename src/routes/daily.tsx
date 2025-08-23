import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layouts/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/lib/store";
import { DataService } from "@/lib/models/DataService";
import { ConversationAnalytics } from "@/lib/models/analytics/ConversationAnalytics";
import { DailyConversation } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils/formatters";
import { IntensityBadge } from "@/components/ui/intensity-badge";
import { DataStateWrapper } from "@/components/layouts/DataStateWrapper";
import { FilterIndicator } from "@/components/layouts/FilterIndicator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/daily")({
    component: DailyComponent
});

export function DailyComponent() {
    const { selectedProject, startDate, endDate, directoryHandle } = useFilterStore();
    const hasDirectoryHandle = !!directoryHandle;
    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard-data", selectedProject, startDate, endDate],
        queryFn: () => DataService.create(directoryHandle).loadDashboardData(selectedProject, startDate, endDate),
        enabled: hasDirectoryHandle
    });
    const conversationData = data?.conversations || [];
    const analytics = new ConversationAnalytics(conversationData);
    const totals = analytics.totals;

    return (
        <PageLayout>
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
                                                <TableCell className="text-right"><IntensityBadge messages={conversation.messages} /></TableCell>
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
                                            <p className="text-2xl font-bold">{totals.formattedDuration}</p>
                                            <p className="text-sm text-muted-foreground">Total Duration</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DataStateWrapper>
        </PageLayout>
    );
}
