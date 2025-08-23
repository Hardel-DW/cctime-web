import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TokenInfo } from "@/lib/models/core/TokenInfo";
import type { UsageData } from "@/lib/types";

export function TokenUsageTimelineChart({ tokenEntries }: { tokenEntries: UsageData[] }) {
    const data = useMemo(() => {
        const dailyUsage: Record<string, { inputTokens: number; outputTokens: number; cost: number; messages: number; }> = {};

        tokenEntries.forEach((entry) => {
            const usage = entry.message?.usage;
            const baseInputTokens = usage?.input_tokens || 0;
            const cacheCreationTokens = usage?.cache_creation_input_tokens || 0;
            const cacheReadTokens = usage?.cache_read_input_tokens || 0;
            const outputTokens = usage?.output_tokens || 0;
            const model = entry.message?.model || "unknown";

            const cost = entry.costUSD || TokenInfo.calculateEstimatedCost(
                model,
                baseInputTokens,
                outputTokens,
                cacheCreationTokens,
                cacheReadTokens
            );

            const inputTokens = baseInputTokens + cacheCreationTokens + cacheReadTokens;
            const date = new Date(entry.timestamp || new Date()).toISOString().split("T")[0];

            if (!dailyUsage[date]) {
                dailyUsage[date] = { inputTokens: 0, outputTokens: 0, cost: 0, messages: 0 };
            }

            dailyUsage[date].inputTokens += inputTokens;
            dailyUsage[date].outputTokens += outputTokens;
            dailyUsage[date].cost += cost;
            dailyUsage[date].messages += 1;
        });

        return Object.entries(dailyUsage)
            .map(([date, usage]) => ({
                date,
                inputTokens: usage.inputTokens,
                outputTokens: usage.outputTokens,
                totalTokens: usage.inputTokens + usage.outputTokens,
                cost: usage.cost,
                messages: usage.messages
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30); // Last 30 days
    }, [tokenEntries]);
    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.3} />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--foreground)" }}
                    tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                />
                <YAxis tick={{ fontSize: 12, fill: "var(--foreground)" }} />
                <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number, name: string) => [
                        value.toLocaleString(),
                        name === "inputTokens" ? "Input Tokens" : "Output Tokens"
                    ]}
                    contentStyle={{
                        backgroundColor: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        color: "var(--popover-foreground)",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                />
                <Bar
                    dataKey="inputTokens"
                    fill="var(--chart-1)"
                    name="Input Tokens"
                    radius={[4, 4, 0, 0]}
                    opacity={0.9}
                />
                <Bar
                    dataKey="outputTokens"
                    fill="var(--chart-2)"
                    name="Output Tokens"
                    radius={[4, 4, 0, 0]}
                    opacity={0.9}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}