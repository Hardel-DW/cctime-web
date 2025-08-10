import { BarChart3, Calendar, Clock, MessageSquare, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/lib/types";

interface StatsCardsProps {
    stats: DashboardData["totalStats"];
}

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: "Active Days",
            value: stats.activeDays,
            icon: Calendar,
            description: "Days with conversations",
            trend: "+12% from last month"
        },
        {
            title: "Total Messages",
            value: stats.totalMessages.toLocaleString(),
            icon: MessageSquare,
            description: "All messages sent",
            trend: "+8% from last month"
        },
        {
            title: "Total Sessions",
            value: stats.totalSessions,
            icon: Timer,
            description: "Conversation sessions",
            trend: "+15% from last month"
        },
        {
            title: "Avg Messages/Day",
            value: stats.avgMessagesPerDay,
            icon: BarChart3,
            description: "Daily average",
            trend: "+5% from last month"
        },
        {
            title: "Total Conv. Time",
            value: stats.totalConversationTime,
            icon: Clock,
            description: "Active conversation time",
            trend: "+18% from last month"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
