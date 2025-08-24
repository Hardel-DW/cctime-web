import { Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { HourlyActivity } from "@/lib/types";

export function HourlyChart({ data }: { data: HourlyActivity[] }) {
    const chartData = data.map((hour) => ({
        hour: `${hour.hour.toString().padStart(2, "0")}:00`,
        messages: hour.messageCount,
        time: hour.totalTime,
        timeLabel: `${Math.floor(hour.totalTime / 60)}h ${hour.totalTime % 60}m`
    }));

    const chartConfig = {
        messages: {
            label: "Messages",
            color: "#10b981"
        },
        time: {
            label: "Time (min)",
            color: "#f59e0b"
        }
    };

    const peakHour = data.reduce((max, hour) => (hour.messageCount > max.messageCount ? hour : max));

    return (
        <Card className="@container/chart">
            <CardHeader>
                <div className="flex flex-col gap-3 @[540px]/chart:flex-row @[540px]/chart:items-center @[540px]/chart:justify-between">
                    <div>
                        <CardTitle className="flex flex-wrap items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="hidden @[400px]/chart:inline">Hourly Activity Pattern</span>
                            <span className="@[400px]/chart:hidden">Hourly</span>
                            <Badge variant="outline">24h</Badge>
                        </CardTitle>
                        <CardDescription className="hidden @[540px]/chart:block">Message distribution throughout the day</CardDescription>
                        <CardDescription className="@[540px]/chart:hidden">Daily distribution</CardDescription>
                    </div>
                    <Badge variant="secondary" className="hidden @[540px]/chart:flex">
                        Peak: {peakHour.hour}:00 ({peakHour.messageCount} msgs)
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full @[768px]/chart:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="hour"
                                tick={{ fontSize: 10, fill: "var(--foreground)" }}
                                tickLine={false}
                                axisLine={false}
                                interval={1}
                                tickMargin={8}
                            />
                            <YAxis tick={{ fontSize: 11, fill: "var(--foreground)" }} tickLine={false} axisLine={false} width={40} />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                labelFormatter={(label) => `Time: ${label}`}
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    color: "var(--foreground)"
                                }}
                            />
                            <Bar
                                dataKey="messages"
                                fill="#10b981"
                                radius={[2, 2, 0, 0]}
                                fillOpacity={0.8}
                                stroke="#0d9488"
                                strokeWidth={1}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <div className="mt-4 grid grid-cols-1 gap-3 text-sm @[400px]/chart:grid-cols-3 @[400px]/chart:gap-4">
                    <div className="text-center">
                        <div className="font-semibold text-muted-foreground">Most Active</div>
                        <div className="text-lg font-bold">{peakHour.hour}:00</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-muted-foreground">Total Messages</div>
                        <div className="text-lg font-bold">{data.reduce((sum, h) => sum + h.messageCount, 0).toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-muted-foreground">Active Hours</div>
                        <div className="text-lg font-bold">{data.filter((h) => h.messageCount > 0).length}/24</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
