import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DailyConversation } from "@/lib/types";

interface ConversationTableProps {
    data: DailyConversation[];
}

export function ConversationTable({ data }: ConversationTableProps) {
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

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Recent Conversations
                            <Badge variant="outline">{data.length} days</Badge>
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
                        {data.map((conversation) => (
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

                {data.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No conversation data available</p>
                        <Button variant="outline" className="mt-2" size="sm">
                            Load Data
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
