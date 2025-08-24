import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { UsageData } from "@/lib/types";

export function TokenDistributionChart({ tokenEntries }: { tokenEntries: UsageData[] }) {
    const { pieData, totalTokens } = useMemo(() => {
        const stats = tokenEntries.reduce(
            (acc, entry) => {
                const usage = entry.message?.usage;
                const baseInputTokens = usage?.input_tokens || 0;
                const cacheCreationTokens = usage?.cache_creation_input_tokens || 0;
                const cacheReadTokens = usage?.cache_read_input_tokens || 0;
                const outputTokens = usage?.output_tokens || 0;
                const inputTokens = baseInputTokens + cacheCreationTokens + cacheReadTokens;

                acc.totalInputTokens += inputTokens;
                acc.totalOutputTokens += outputTokens;
                acc.totalCacheCreation += cacheCreationTokens;
                acc.totalCacheRead += cacheReadTokens;

                return acc;
            },
            {
                totalInputTokens: 0,
                totalOutputTokens: 0,
                totalCacheCreation: 0,
                totalCacheRead: 0
            }
        );

        const pieData = [
            {
                name: "Input Tokens",
                value: stats.totalInputTokens - stats.totalCacheCreation - stats.totalCacheRead,
                fill: "var(--chart-1)"
            },
            { name: "Output Tokens", value: stats.totalOutputTokens, fill: "var(--chart-2)" },
            { name: "Cache Creation", value: stats.totalCacheCreation, fill: "var(--chart-3)" },
            { name: "Cache Read", value: stats.totalCacheRead, fill: "var(--chart-4)" }
        ].filter((item) => item.value > 0);

        const totalTokens = stats.totalInputTokens + stats.totalOutputTokens;

        return { pieData, totalTokens };
    }, [tokenEntries]);

    return (
        <>
            <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value">
                            {pieData.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} stroke="var(--background)" strokeWidth={2} />
                            ))}
                        </Pie>
                        <ChartTooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                            <p className="font-semibold text-foreground">{data.name}</p>
                                            <p className="text-sm text-muted-foreground">Tokens: {data.value.toLocaleString()}</p>
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
                {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="flex gap-4 text-muted-foreground">
                            <span>{item.value.toLocaleString()}</span>
                            <span>({Math.round((item.value / totalTokens) * 100)}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
