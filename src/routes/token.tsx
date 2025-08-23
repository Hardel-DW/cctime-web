import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layouts/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { Coins, Cpu, DollarSign, MessageSquare, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilterStore } from "@/lib/store";
import { ClaudeDataManager } from "@/lib/models/ClaudeDataManager";
import { TokenStats } from "@/lib/models/analytics/TokenStats";
import { CacheStats } from "@/lib/models/analytics/CacheStats";
import { DataFilters } from "@/lib/models/analytics/DataFilters";
import { DataStateWrapper } from "@/components/layouts/DataStateWrapper";
import { FilterIndicator } from "@/components/layouts/FilterIndicator";
import { TokenDistributionChart } from "@/components/charts/token/TokenDistributionChart";
import { DailyUsageTrendChart } from "@/components/charts/token/DailyUsageTrendChart";
import { CacheUsageBreakdownChart } from "@/components/charts/token/CacheUsageBreakdownChart";
import { TokenUsageTimelineChart } from "@/components/charts/token/TokenUsageTimelineChart";

export const Route = createFileRoute("/token")({
    component: TokenComponent
});

export function TokenComponent() {
    const { selectedProject, startDate, endDate, directoryHandle } = useFilterStore();
    const { data: allEntries, isLoading, error } = useQuery({
        queryKey: ["token-usage-data", selectedProject, startDate, endDate],
        queryFn: () => ClaudeDataManager.loadAllUsageData(directoryHandle),
        enabled: !!directoryHandle
    });

    const filteredEntries = DataFilters.filterTokenEntries(allEntries || [], selectedProject, startDate, endDate);
    const tokenStats = TokenStats.fromRawEntries(filteredEntries);
    const cacheStats = CacheStats.fromRawEntries(filteredEntries);
    const stats = tokenStats.basicStats;
    const cacheBasicStats = cacheStats.basicStats;
    const tokenEntries = tokenStats.tokenEntries;
    const modelChartData = tokenStats.modelChartData;
    const projectChartData = tokenStats.projectChartData;

    return (
        <PageLayout>
            <DataStateWrapper
                isLoading={isLoading}
                error={error}
                loadingMessage="Loading token usage data..."
                noDirectoryIcon={<Coins className="h-12 w-12" />}
                noDirectoryMessage="Please select your Claude data directory to view token usage analytics."
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Token Usage</h1>
                            <p className="text-muted-foreground">Comprehensive token consumption and cost analysis</p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {stats.messageCount} messages
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
                                <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.totalOutputTokens / stats.totalTokens) * 100).toFixed(1)}% output
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
                                <p className="text-xs text-muted-foreground">${stats.avgCostPerMessage.toFixed(6)}/msg</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.messageCount.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">{stats.avgTokensPerMessage.toFixed(0)} tokens/msg</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
                                <Cpu className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {cacheBasicStats.totalCacheReadTokens > 0
                                        ? `${(cacheBasicStats.cacheHitRate * 100).toFixed(0)}%`
                                        : "0%"}
                                </div>
                                <p className="text-xs text-muted-foreground">{cacheBasicStats.totalCacheReadTokens.toLocaleString()} reads</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Models Used</CardTitle>
                                <Cpu className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{modelChartData.length}</div>
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
                                        <TokenDistributionChart tokenEntries={tokenEntries} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Daily Usage Trend</CardTitle>
                                        <CardDescription>Token consumption over time</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <DailyUsageTrendChart tokenEntries={tokenEntries} />
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
                                        <CacheUsageBreakdownChart tokenEntries={tokenEntries} />
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
                                                <p className="text-2xl font-bold">{cacheBasicStats.totalCacheCreationTokens.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">tokens created</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Cache Reads</p>
                                                <p className="text-2xl font-bold">{cacheBasicStats.totalCacheReadTokens.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">tokens read</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Ephemeral 5m</p>
                                                <p className="text-2xl font-bold">{cacheBasicStats.totalEphemeral5mTokens.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">short-term cache</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Ephemeral 1h</p>
                                                <p className="text-2xl font-bold">{cacheBasicStats.totalEphemeral1hTokens.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">medium-term cache</p>
                                            </div>
                                        </div>
                                        {cacheBasicStats.totalCacheTokens > 0 && (
                                            <div className="pt-4 border-t">
                                                <p className="text-sm font-medium">Cache Hit Rate</p>
                                                <p className="text-2xl font-bold">
                                                    {(cacheBasicStats.cacheHitRate * 100).toFixed(1)}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {cacheBasicStats.totalCacheReadTokens.toLocaleString()} reads /{" "}
                                                    {cacheBasicStats.totalCacheTokens.toLocaleString()} total
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
                                    <TokenUsageTimelineChart tokenEntries={tokenEntries} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </DataStateWrapper>
        </PageLayout>
    );
}
