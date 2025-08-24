import { FolderOpen } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ProjectActivity } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

export function ProjectChart({ data }: { data: ProjectActivity[] }) {
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

    return (
        <Card className="@container/chart">
            <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="hidden @[400px]/chart:inline">Projects Overview</span>
                    <span className="@[400px]/chart:hidden">Projects</span>
                    <Badge variant="secondary">{data.length} projects</Badge>
                </CardTitle>
                <CardDescription className="hidden @[540px]/chart:block">Conversation time distribution by project</CardDescription>
                <CardDescription className="@[540px]/chart:hidden">Time by project</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={{}} className="aspect-square h-[200px] w-full @[400px]/chart:h-[250px] @[768px]/chart:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                className="@[400px]/chart:innerRadius-[40] @[400px]/chart:outerRadius-[90]">
                                {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} stroke="var(--background)" strokeWidth={1} />
                                ))}
                            </Pie>
                            <ChartTooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                                <p className="font-semibold text-foreground">{data.name}</p>
                                                <p className="text-sm text-muted-foreground">Time: {formatDuration(data.value)}</p>
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
                        <div
                            key={project.name}
                            className="flex flex-col gap-1 text-sm @[400px]/chart:flex-row @[400px]/chart:items-center @[400px]/chart:justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                                <span className="font-medium truncate">{project.name}</span>
                            </div>
                            <div className="flex gap-4 text-muted-foreground pl-5 @[400px]/chart:pl-0">
                                <span>{formatDuration(project.value)}</span>
                                <span>({Math.round((project.value / totalTime) * 100)}%)</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t text-center">
                    <div className="text-sm text-muted-foreground">Total Time</div>
                    <div className="text-xl font-bold @[400px]/chart:text-2xl">{formatDuration(totalTime)}</div>
                </div>
            </CardContent>
        </Card>
    );
}
