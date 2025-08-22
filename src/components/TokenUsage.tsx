import { useQuery } from "@tanstack/react-query";
import { Coins, Cpu, DollarSign, MessageSquare, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadDashboardData } from "@/lib/data-service";
import { getCachedDirectoryHandle } from "@/lib/directory-storage";
import { useFilterStore } from "@/lib/store";
import { FilterIndicator } from "./FilterIndicator";

export function TokenUsage() {
    const { selectedProject, startDate, endDate } = useFilterStore();
    const hasDirectoryHandle = !!getCachedDirectoryHandle();

    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard-data", selectedProject, startDate, endDate],
        queryFn: () => loadDashboardData(),
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

    const allEntries = data?.allEntries || [];

    // Debug: Check what data we're getting
    console.log("=== TOKEN USAGE DEBUG ===");
    console.log("Has directory handle:", hasDirectoryHandle);
    console.log("Raw data object:", data);
    console.log("Total entries:", allEntries.length);
    console.log("Filter state:", { selectedProject, startDate, endDate });

    // Filter entries with token usage data (including cache tokens)
    const tokenEntries = allEntries.filter((entry) => {
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

    console.log("Token entries found:", tokenEntries.length);
    console.log("Sample token entries:", tokenEntries.slice(0, 3));

    // Calculate comprehensive statistics
    const stats = tokenEntries.reduce(
        (acc, entry) => {
            const usage = entry.message?.usage;
            const inputTokens =
                (usage?.input_tokens || 0) + (usage?.cache_creation_input_tokens || 0) + (usage?.cache_read_input_tokens || 0);
            const outputTokens = usage?.output_tokens || 0;
            const cost = entry.costUSD || 0;
            const model = entry.message?.model || "unknown";

            acc.totalInputTokens += inputTokens;
            acc.totalOutputTokens += outputTokens;
            acc.totalCost += cost;
            acc.messageCount += 1;

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
            modelUsage: {} as Record<string, any>,
            projectUsage: {} as Record<string, any>,
            dailyUsage: {} as Record<string, any>
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
            name: project.split("/").pop() || project,
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
        { name: "Input Tokens", value: stats.totalInputTokens, color: "#8884d8" },
        { name: "Output Tokens", value: stats.totalOutputTokens, color: "#82ca9d" }
    ];

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <div className="text-2xl font-bold">${stats.totalCost.toFixed(4)}</div>
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
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="models">By Models</TabsTrigger>
                    <TabsTrigger value="projects">By Projects</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Token Distribution</CardTitle>
                                <CardDescription>Input vs Output tokens</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {pieData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                    </PieChart>
                                </ResponsiveContainer>
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
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(date) =>
                                                new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                            }
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                            formatter={(value: number) => [value.toLocaleString(), "Tokens"]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="totalTokens"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                            dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
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
                            <CardTitle>Usage by Project</CardTitle>
                            <CardDescription>Token consumption per project directory</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project</TableHead>
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
                            <CardDescription>Daily token consumption over the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={dailyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(date) =>
                                            new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                        }
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                        formatter={(value: number, name: string) => [
                                            value.toLocaleString(),
                                            name === "inputTokens" ? "Input" : "Output"
                                        ]}
                                    />
                                    <Bar dataKey="inputTokens" stackId="a" fill="#8884d8" name="Input Tokens" />
                                    <Bar dataKey="outputTokens" stackId="a" fill="#82ca9d" name="Output Tokens" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
