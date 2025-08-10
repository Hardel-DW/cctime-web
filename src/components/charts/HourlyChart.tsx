import { Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { HourlyActivity } from "@/lib/types";

interface HourlyChartProps {
    data: HourlyActivity[];
}

export function HourlyChart({ data }: HourlyChartProps) {
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
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Hourly Activity Pattern
                            <Badge variant="outline">24h</Badge>
                        </CardTitle>
                        <CardDescription>Message distribution throughout the day</CardDescription>
                    </div>
                    <Badge variant="secondary">
                        Peak: {peakHour.hour}:00 ({peakHour.messageCount} msgs)
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="hour"
                                tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                                tickLine={false}
                                axisLine={false}
                                interval={1}
                            />
                            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} tickLine={false} axisLine={false} />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                labelFormatter={(label) => `Time: ${label}`}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                    color: "hsl(var(--foreground))"
                                }}
                            />
                            <Bar
                                dataKey="messages"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                fillOpacity={0.8}
                                stroke="#0d9488"
                                strokeWidth={1}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
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
