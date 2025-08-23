import { useQuery } from "@tanstack/react-query";
import { Coins, Cpu, DollarSign, MessageSquare, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCachedDirectoryHandle } from "@/lib/directory-storage";
import { formatProjectName } from "@/lib/project-utils";
import { useFilterStore } from "@/lib/store";
import { loadAllUsageData } from "@/lib/web-data-loader";
import { FilterIndicator } from "./FilterIndicator";

export function TokenUsage() {
    const { selectedProject, startDate, endDate } = useFilterStore();
    const hasDirectoryHandle = !!getCachedDirectoryHandle();

    const {
        data: allEntries,
        isLoading,
        error
    } = useQuery({
        queryKey: ["token-usage-data", selectedProject, startDate, endDate],
        queryFn: () => loadAllUsageData(),
        enabled: hasDirectoryHandle
    });

    if (!hasDirectoryHandle) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Directory Selected</h3>
                        <p className="text-muted-foreground">Please select your Claude data directory to view token usage.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading token usage data...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <Coins className="h-12 w-12 mx-auto mb-4 text-red-500" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                        <p className="text-muted-foreground mb-4">Failed to load token usage data.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Apply filters
    const filteredEntries = (allEntries || []).filter((entry) => {
        // Filter by timestamp (must have valid timestamp)
        if (!entry.timestamp) return false;

        // Filter by project
        if (selectedProject) {
            if (!entry.cwd) return false;
            const projectName = formatProjectName(entry.cwd);
            if (projectName !== selectedProject) return false;
        }

        // Filter by date range
        if (startDate || endDate) {
            const entryDate = new Date(entry.timestamp).toISOString().split("T")[0];
            if (startDate && entryDate < startDate) return false;
            if (endDate && entryDate > endDate) return false;
        }

        return true;
    });

    // Filter entries with token usage data (including cache tokens)
    const tokenEntries = filteredEntries.filter((entry) => {
        const usage = entry.message?.usage;
        return (
            usage &&
            (usage.input_tokens ||
                usage.output_tokens ||
                usage.cache_creation_input_tokens ||
                usage.cache_read_input_tokens ||
                entry.costUSD)
        );
    });

    // Calculate estimated cost if not provided - Updated 2025 pricing
    const calculateEstimatedCost = (
        model: string,
        baseInputTokens: number,
        outputTokens: number,
        cacheCreationTokens: number,
        cacheReadTokens: number
    ): number => {
        // Updated 2025 pricing for Claude models (per 1M tokens)
        const pricing: Record<string, { input: number; output: number }> = {
            "claude-sonnet-4": { input: 3, output: 15 },
            "claude-opus-4": { input: 15, output: 75 },
            "claude-3-5-sonnet": { input: 3, output: 15 },
            "claude-3-opus": { input: 15, output: 75 },
            "claude-3-sonnet": { input: 3, output: 15 },
            "claude-3-haiku": { input: 0.25, output: 1.25 },
            "claude-3-5-haiku": { input: 0.8, output: 4 }
        };

        // Find matching model pricing
        let modelPricing = null;
        for (const [key, price] of Object.entries(pricing)) {
            if (model.toLowerCase().includes(key.toLowerCase().replace("claude-", ""))) {
                modelPricing = price;
                break;
            }
        }

        // Default to Claude 3.5 Sonnet pricing if model not found
        if (!modelPricing) {
            modelPricing = pricing["claude-3-5-sonnet"];
        }

        // Calculate cost with proper cache pricing
        const baseInputCost = (baseInputTokens * modelPricing.input) / 1000000;
        const outputCost = (outputTokens * modelPricing.output) / 1000000;
        const cacheWriteCost = (cacheCreationTokens * modelPricing.input * 1.25) / 1000000; // 25% premium
        const cacheReadCost = (cacheReadTokens * modelPricing.input * 0.1) / 1000000; // 90% discount

        return baseInputCost + outputCost + cacheWriteCost + cacheReadCost;
    };

    // Calculate comprehensive statistics with enhanced cache handling
    const stats = tokenEntries.reduce(
        (
            acc: {
                totalInputTokens: number;
                totalOutputTokens: number;
                totalCost: number;
                messageCount: number;
                totalCacheCreation: number;
                totalCacheRead: number;
                totalEphemeral5m: number;
                totalEphemeral1h: number;
                modelUsage: Record<
                    string,
                    {
                        inputTokens: number;
                        outputTokens: number;
                        cost: number;
                        messages: number;
                    }
                >;
                projectUsage: Record<
                    string,
                    {
                        inputTokens: number;
                        outputTokens: number;
                        cost: number;
                        messages: number;
                    }
                >;
                dailyUsage: Record<
                    string,
                    {
                        inputTokens: number;
                        outputTokens: number;
                        cost: number;
                        messages: number;
                    }
                >;
            },
            entry
        ) => {
            const usage = entry.message?.usage;
            const baseInputTokens = usage?.input_tokens || 0;
            const cacheCreationTokens = usage?.cache_creation_input_tokens || 0;
            const cacheReadTokens = usage?.cache_read_input_tokens || 0;

            // Handle ephemeral cache tokens (Claude Code v1.0.73+)
            const ephemeral5mTokens = usage?.cache_creation?.ephemeral_5m_input_tokens || 0;
            const ephemeral1hTokens = usage?.cache_creation?.ephemeral_1h_input_tokens || 0;

            const outputTokens = usage?.output_tokens || 0;
            const model = entry.message?.model || "unknown";
            const cost =
                entry.costUSD || calculateEstimatedCost(model, baseInputTokens, outputTokens, cacheCreationTokens, cacheReadTokens);

            // For display purposes, keep total input tokens for compatibility
            const inputTokens = baseInputTokens + cacheCreationTokens + cacheReadTokens;

            acc.totalInputTokens += inputTokens;
            acc.totalOutputTokens += outputTokens;
            acc.totalCost += cost;
            acc.messageCount += 1;

            // Track cache statistics
            acc.totalCacheCreation += cacheCreationTokens;
            acc.totalCacheRead += cacheReadTokens;
            acc.totalEphemeral5m += ephemeral5mTokens;
            acc.totalEphemeral1h += ephemeral1hTokens;

            // Track by model
            if (!acc.modelUsage[model]) {
                acc.modelUsage[model] = {
                    inputTokens: 0,
                    outputTokens: 0,
                    cost: 0,
                    messages: 0
                };
            }
            acc.modelUsage[model].inputTokens += inputTokens;
            acc.modelUsage[model].outputTokens += outputTokens;
            acc.modelUsage[model].cost += cost;
            acc.modelUsage[model].messages += 1;

            // Track by project
            const project = entry.cwd || "Unknown Project";
            if (!acc.projectUsage[project]) {
                acc.projectUsage[project] = {
                    inputTokens: 0,
                    outputTokens: 0,
                    cost: 0,
                    messages: 0
                };
            }
            acc.projectUsage[project].inputTokens += inputTokens;
            acc.projectUsage[project].outputTokens += outputTokens;
            acc.projectUsage[project].cost += cost;
            acc.projectUsage[project].messages += 1;

            // Track by date
            const date = new Date(entry.timestamp || new Date()).toISOString().split("T")[0];
            if (!acc.dailyUsage[date]) {
                acc.dailyUsage[date] = {
                    inputTokens: 0,
                    outputTokens: 0,
                    cost: 0,
                    messages: 0
                };
            }
            acc.dailyUsage[date].inputTokens += inputTokens;
            acc.dailyUsage[date].outputTokens += outputTokens;
            acc.dailyUsage[date].cost += cost;
            acc.dailyUsage[date].messages += 1;

            return acc;
        },
        {
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalCost: 0,
            messageCount: 0,
            totalCacheCreation: 0,
            totalCacheRead: 0,
            totalEphemeral5m: 0,
            totalEphemeral1h: 0,
            modelUsage: {} as Record<
                string,
                {
                    inputTokens: number;
                    outputTokens: number;
                    cost: number;
                    messages: number;
                }
            >,
            projectUsage: {} as Record<
                string,
                {
                    inputTokens: number;
                    outputTokens: number;
                    cost: number;
                    messages: number;
                }
            >,
            dailyUsage: {} as Record<
                string,
                {
                    inputTokens: number;
                    outputTokens: number;
                    cost: number;
                    messages: number;
                }
            >
        }
    );

    const totalTokens = stats.totalInputTokens + stats.totalOutputTokens;
    const avgCostPerMessage = stats.messageCount > 0 ? stats.totalCost / stats.messageCount : 0;
    const avgTokensPerMessage = stats.messageCount > 0 ? totalTokens / stats.messageCount : 0;

    // Prepare chart data
    const modelChartData = Object.entries(stats.modelUsage)
        .map(([model, usage]: [string, any]) => ({
            name: model,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.inputTokens + usage.outputTokens,
            cost: usage.cost,
            messages: usage.messages
        }))
        .sort((a, b) => b.totalTokens - a.totalTokens);

    const projectChartData = Object.entries(stats.projectUsage)
        .map(([project, usage]: [string, any]) => ({
            name: formatProjectName(project),
            fullPath: project,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.inputTokens + usage.outputTokens,
            cost: usage.cost,
            messages: usage.messages
        }))
        .sort((a, b) => b.totalTokens - a.totalTokens);

    const dailyChartData = Object.entries(stats.dailyUsage)
        .map(([date, usage]: [string, any]) => ({
            date,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.inputTokens + usage.outputTokens,
            cost: usage.cost,
            messages: usage.messages
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

    const pieData = [
        { name: "Input Tokens", value: stats.totalInputTokens - stats.totalCacheCreation - stats.totalCacheRead, fill: "var(--chart-1)" },
        { name: "Output Tokens", value: stats.totalOutputTokens, fill: "var(--chart-2)" },
        { name: "Cache Creation", value: stats.totalCacheCreation, fill: "var(--chart-3)" },
        { name: "Cache Read", value: stats.totalCacheRead, fill: "var(--chart-4)" }
    ].filter((item) => item.value > 0);

    const cacheEfficiencyData = [
        { name: "Cache Creation", value: stats.totalCacheCreation, fill: "var(--chart-1)" },
        { name: "Cache Read", value: stats.totalCacheRead, fill: "var(--chart-2)" },
        { name: "Ephemeral 5m", value: stats.totalEphemeral5m, fill: "var(--chart-3)" },
        { name: "Ephemeral 1h", value: stats.totalEphemeral1h, fill: "var(--chart-4)" }
    ].filter((item) => item.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Token Usage</h1>
                    <p className="text-muted-foreground">Comprehensive token consumption and cost analysis</p>
                </div>
                <Badge variant="outline" className="text-sm">
                    {tokenEntries.length} messages
                </Badge>
            </div>

            <FilterIndicator />

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {((stats.totalOutputTokens / totalTokens) * 100).toFixed(1)}% output
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">${avgCostPerMessage.toFixed(6)}/msg</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.messageCount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{avgTokensPerMessage.toFixed(0)} tokens/msg</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalCacheRead > 0
                                ? `${((stats.totalCacheRead / (stats.totalCacheCreation + stats.totalCacheRead)) * 100).toFixed(0)}%`
                                : "0%"}
                        </div>
                        <p className="text-xs text-muted-foreground">{stats.totalCacheRead.toLocaleString()} reads</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Models Used</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Object.keys(stats.modelUsage).length}</div>
                        <p className="text-xs text-muted-foreground">Different models</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="rounded-xl bg-zinc-800">
                    <TabsTrigger value="overview" className="rounded-lg">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="cache" className="rounded-lg">
                        Cache
                    </TabsTrigger>
                    <TabsTrigger value="models" className="rounded-lg">
                        By Models
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="rounded-lg">
                        By Projects
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="rounded-lg">
                        Timeline
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Token Distribution</CardTitle>
                                <CardDescription>Input vs Output tokens</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={{}} className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={100}
                                                paddingAngle={3}
                                                dataKey="value">
                                                {pieData.map((entry) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={entry.fill}
                                                        stroke="var(--background)"
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                            </Pie>
                                            <ChartTooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                                                <p className="font-semibold text-foreground">{data.name}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Tokens: {data.value.toLocaleString()}
                                                                </p>
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Usage Trend</CardTitle>
                                <CardDescription>Token consumption over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={dailyChartData}>
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
                                            formatter={(value: number) => [value.toLocaleString(), "Tokens"]}
                                            contentStyle={{
                                                backgroundColor: "var(--popover)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "6px",
                                                color: "var(--popover-foreground)",
                                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="totalTokens"
                                            stroke="var(--chart-1)"
                                            strokeWidth={3}
                                            dot={{ fill: "var(--chart-1)", strokeWidth: 2, r: 5 }}
                                            activeDot={{ r: 7, stroke: "var(--chart-1)", strokeWidth: 2, fill: "var(--background)" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="cache" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cache Usage Breakdown</CardTitle>
                                <CardDescription>Distribution of cache tokens</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={{}} className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={cacheEfficiencyData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={100}
                                                paddingAngle={3}
                                                dataKey="value">
                                                {cacheEfficiencyData.map((entry) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={entry.fill}
                                                        stroke="var(--background)"
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                            </Pie>
                                            <ChartTooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                                                <p className="font-semibold text-foreground">{data.name}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Tokens: {data.value.toLocaleString()}
                                                                </p>
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
                                    {cacheEfficiencyData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <div className="flex gap-4 text-muted-foreground">
                                                <span>{item.value.toLocaleString()}</span>
                                                <span>
                                                    (
                                                    {cacheEfficiencyData.reduce((acc, cur) => acc + cur.value, 0) > 0
                                                        ? Math.round(
                                                              (item.value / cacheEfficiencyData.reduce((acc, cur) => acc + cur.value, 0)) *
                                                                  100
                                                          )
                                                        : 0}
                                                    %)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cache Statistics</CardTitle>
                                <CardDescription>Detailed cache performance metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Cache Creation</p>
                                        <p className="text-2xl font-bold">{stats.totalCacheCreation.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">tokens created</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Cache Reads</p>
                                        <p className="text-2xl font-bold">{stats.totalCacheRead.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">tokens read</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Ephemeral 5m</p>
                                        <p className="text-2xl font-bold">{stats.totalEphemeral5m.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">short-term cache</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Ephemeral 1h</p>
                                        <p className="text-2xl font-bold">{stats.totalEphemeral1h.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">medium-term cache</p>
                                    </div>
                                </div>
                                {stats.totalCacheCreation + stats.totalCacheRead > 0 && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium">Cache Hit Rate</p>
                                        <p className="text-2xl font-bold">
                                            {((stats.totalCacheRead / (stats.totalCacheCreation + stats.totalCacheRead)) * 100).toFixed(1)}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {stats.totalCacheRead.toLocaleString()} reads /{" "}
                                            {(stats.totalCacheCreation + stats.totalCacheRead).toLocaleString()} total
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="models" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage by Model</CardTitle>
                            <CardDescription>Token consumption and costs per model</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Model</TableHead>
                                        <TableHead className="text-right">Messages</TableHead>
                                        <TableHead className="text-right">Input Tokens</TableHead>
                                        <TableHead className="text-right">Output Tokens</TableHead>
                                        <TableHead className="text-right">Total Tokens</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {modelChartData.map((model) => (
                                        <TableRow key={model.name}>
                                            <TableCell className="font-medium">
                                                <Badge variant="outline">{model.name}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{model.messages.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono">{model.inputTokens.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono">{model.outputTokens.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono font-semibold">
                                                {model.totalTokens.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">${model.cost.toFixed(4)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Token Usage</CardTitle>
                            <CardDescription>Token consumption and costs per project directory</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Directory</TableHead>
                                        <TableHead className="text-right">Messages</TableHead>
                                        <TableHead className="text-right">Input Tokens</TableHead>
                                        <TableHead className="text-right">Output Tokens</TableHead>
                                        <TableHead className="text-right">Total Tokens</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projectChartData.map((project) => (
                                        <TableRow key={project.fullPath}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-semibold">{project.name}</div>
                                                    <div className="text-xs text-muted-foreground">{project.fullPath}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{project.messages.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono">{project.inputTokens.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono">{project.outputTokens.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono font-semibold">
                                                {project.totalTokens.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">${project.cost.toFixed(4)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Token Usage Timeline</CardTitle>
                            <CardDescription>Daily input and output token consumption (side by side for better visibility)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={dailyChartData}>
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
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
