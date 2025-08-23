import { FolderOpen } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ProjectActivity } from "@/lib/types";

interface ProjectChartProps {
    data: ProjectActivity[];
}

export function ProjectChart({ data }: ProjectChartProps) {
    const colors = [
        "#3b82f6", // blue
        "#10b981", // emerald
        "#f59e0b", // amber
        "#ef4444", // red
        "#8b5cf6", // violet
        "#06b6d4", // cyan
        "#84cc16", // lime
        "#f97316", // orange
        "#ec4899", // pink
        "#14b8a6" // teal
    ];

    const chartData = data.map((project, index) => ({
        name: project.projectName,
        value: project.conversationTime,
        messages: project.messageCount,
        sessions: project.sessionCount,
        color: colors[index % colors.length]
    }));

    const totalTime = data.reduce((sum, p) => sum + p.conversationTime, 0);
    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Projects Overview
                    <Badge variant="secondary">{data.length} projects</Badge>
                </CardTitle>
                <CardDescription>Conversation time distribution by project</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value">
                                {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} stroke="var(--background)" strokeWidth={2} />
                                ))}
                            </Pie>
                            <ChartTooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                                <p className="font-semibold text-foreground">{data.name}</p>
                                                <p className="text-sm text-muted-foreground">Time: {formatTime(data.value)}</p>
                                                <p className="text-sm text-muted-foreground">Messages: {data.messages.toLocaleString()}</p>
                                                <p className="text-sm text-muted-foreground">Sessions: {data.sessions}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <div className="mt-4 space-y-2">
                    {chartData.slice(0, 5).map((project) => (
                        <div key={project.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                                <span className="font-medium">{project.name}</span>
                            </div>
                            <div className="flex gap-4 text-muted-foreground">
                                <span>{formatTime(project.value)}</span>
                                <span>({Math.round((project.value / totalTime) * 100)}%)</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t text-center">
                    <div className="text-sm text-muted-foreground">Total Time</div>
                    <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
                </div>
            </CardContent>
        </Card>
    );
}
