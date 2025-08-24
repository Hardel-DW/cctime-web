import { TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DailyConversation } from "@/lib/types";

export function DailyChart({ data }: { data: DailyConversation[] }) {
    const chartData = data
        .slice()
        .reverse()
        .map((day) => ({
            date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            messages: day.messages,
            sessions: day.sessions,
            conversationTime: day.conversationTime
        }));

    const chartConfig = {
        messages: {
            label: "Messages",
            color: "#3b82f6"
        },
        sessions: {
            label: "Sessions",
            color: "#10b981"
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Daily Activity
                            <Badge variant="secondary">{data.length} days</Badge>
                        </CardTitle>
                        <CardDescription>Message count and session activity over time</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.slice(-30)}>
                            <defs>
                                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    color: "var(--foreground)"
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="messages"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorMessages)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                    <span>Peak: {Math.max(...data.map((d) => d.messages)).toLocaleString()} messages</span>
                    <span>Avg: {Math.round(data.reduce((sum, d) => sum + d.messages, 0) / data.length).toLocaleString()} messages/day</span>
                </div>
            </CardContent>
        </Card>
    );
}
