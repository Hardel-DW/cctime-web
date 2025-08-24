import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { UsageData } from "@/lib/types";

export function CacheUsageBreakdownChart({ tokenEntries }: { tokenEntries: UsageData[] }) {
    const { data, totalCacheTokens } = useMemo(() => {
        const stats = tokenEntries.reduce(
            (acc, entry) => {
                const usage = entry.message?.usage;
                const cacheCreationTokens = usage?.cache_creation_input_tokens || 0;
                const cacheReadTokens = usage?.cache_read_input_tokens || 0;
                const ephemeral5mTokens = usage?.cache_creation?.ephemeral_5m_input_tokens || 0;
                const ephemeral1hTokens = usage?.cache_creation?.ephemeral_1h_input_tokens || 0;

                acc.totalCacheCreation += cacheCreationTokens;
                acc.totalCacheRead += cacheReadTokens;
                acc.totalEphemeral5m += ephemeral5mTokens;
                acc.totalEphemeral1h += ephemeral1hTokens;

                return acc;
            },
            {
                totalCacheCreation: 0,
                totalCacheRead: 0,
                totalEphemeral5m: 0,
                totalEphemeral1h: 0
            }
        );

        const data = [
            { name: "Cache Creation", value: stats.totalCacheCreation, fill: "var(--chart-1)" },
            { name: "Cache Read", value: stats.totalCacheRead, fill: "var(--chart-2)" },
            { name: "Ephemeral 5m", value: stats.totalEphemeral5m, fill: "var(--chart-3)" },
            { name: "Ephemeral 1h", value: stats.totalEphemeral1h, fill: "var(--chart-4)" }
        ].filter((item) => item.value > 0);

        const totalCacheTokens = stats.totalCacheCreation + stats.totalCacheRead + stats.totalEphemeral5m + stats.totalEphemeral1h;

        return { data, totalCacheTokens };
    }, [tokenEntries]);

    return (
        <>
            <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value">
                            {data.map((entry) => (
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
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="flex gap-4 text-muted-foreground">
                            <span>{item.value.toLocaleString()}</span>
                            <span>({totalCacheTokens > 0 ? Math.round((item.value / totalCacheTokens) * 100) : 0}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
