import { useQuery } from "@tanstack/react-query";
import { Bot, Copy, Database, FolderOpen, TrendingUp, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loadDashboardData } from "@/lib/data-service";
import { getCachedDirectoryHandle } from "@/lib/directory-storage";
import { useFilterStore } from "@/lib/store";
import { ConversationTable } from "./ConversationTable";
import { DailyChart } from "./charts/DailyChart";
import { HourlyChart } from "./charts/HourlyChart";
import { ProjectChart } from "./charts/ProjectChart";
import { FilterIndicator } from "./FilterIndicator";
import { DirectorySelector } from "./SettingsPopover";
import { StatsCards } from "./StatsCards";
import React from "react";

function WelcomeScreen() {
    const [customUsername, setCustomUsername] = React.useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('claude-username') || '';
    });

    const username = React.useMemo(() => {
        if (customUsername.trim()) return customUsername.trim();

        const platform = navigator.platform.toLowerCase();
        if (platform.includes('win')) {
            return 'Username';
        } else {
            return 'username';
        }
    }, [customUsername]);

    const handleUsernameChange = (value: string) => {
        setCustomUsername(value);
        if (typeof window !== 'undefined') {
            localStorage.setItem('claude-username', value);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };
    return (
        <div className="flex flex-1 items-center justify-center p-6">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl">Welcome to CCTime</CardTitle>
                    <CardDescription className="text-lg">Claude Code Conversation Analytics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center text-muted-foreground">
                        <p>To get started, please select your Claude data directory.</p>
                        <div className="text-sm mt-3 space-y-2 text-left">
                            <div className="flex items-center justify-between gap-4">
                                <p className="font-medium">Examples of Claude data paths:</p>
                                <div className="flex items-center gap-2">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <Input
                                        placeholder="username"
                                        value={customUsername}
                                        onChange={(e) => handleUsernameChange(e.target.value)}
                                        className="h-6 w-24 text-xs px-2"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-accent/50 transition-colors">
                                    <Badge variant="outline">Windows</Badge>
                                    <code className="text-sm font-mono flex-1">C:\Users\{username}\.claude</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(`C:\\Users\\${username}\\.claude`)}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-accent/50 transition-colors">
                                    <Badge variant="outline">macOS</Badge>
                                    <code className="text-sm font-mono flex-1">/Users/{username}/.claude</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(`/Users/${username}/.claude`)}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-accent/50 transition-colors">
                                    <Badge variant="outline">Linux</Badge>
                                    <code className="text-sm font-mono flex-1">/home/{username.toLowerCase()}/.claude</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(`/home/${username.toLowerCase()}/.claude`)}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="text-center p-4">
                            <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <h3 className="font-semibold">Track Conversations</h3>
                            <p className="text-sm text-muted-foreground">Daily activity and session analytics</p>
                        </Card>
                        <Card className="text-center p-4">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <h3 className="font-semibold">Usage Insights</h3>
                            <p className="text-sm text-muted-foreground">Understand your coding patterns</p>
                        </Card>
                        <Card className="text-center p-4">
                            <FolderOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                            <h3 className="font-semibold">Project Analysis</h3>
                            <p className="text-sm text-muted-foreground">Per-project activity breakdown</p>
                        </Card>
                    </div>

                    <div className="flex justify-center">
                        <DirectorySelector />
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                        <p>Requires Chrome, Edge, or another browser with File System Access API support</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function Dashboard() {
    const { dataRefreshKey, selectedProject, startDate, endDate } = useFilterStore();
    const hasDirectoryHandle = getCachedDirectoryHandle() !== null;

    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard-data", dataRefreshKey, selectedProject, startDate, endDate],
        queryFn: loadDashboardData,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: hasDirectoryHandle // Only run query if directory is selected
    });

    // Show welcome screen if no directory is selected
    if (!hasDirectoryHandle) {
        return <WelcomeScreen />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Bot className="h-8 w-8" />
                            Claude Code Analytics
                        </h1>
                        <p className="text-muted-foreground text-lg">Loading your conversation data...</p>
                    </div>

                    {/* Skeleton Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((skeletonId) => (
                            <Card key={skeletonId} className="animate-pulse">
                                <CardHeader className="space-y-0 pb-2">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-full"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Skeleton Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Card className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-muted rounded w-1/3"></div>
                                <div className="h-4 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] bg-muted rounded"></div>
                            </CardContent>
                        </Card>
                        <Card className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-muted rounded w-1/3"></div>
                                <div className="h-4 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] bg-muted rounded"></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-600">
                    <h2 className="text-2xl font-bold mb-2">Error loading data</h2>
                    <p>{error instanceof Error ? error.message : "Unknown error"}</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
            <div className="flex flex-col space-y-3">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your Claude Code conversation analytics</p>
                </div>
                <FilterIndicator />
            </div>

            <StatsCards stats={data.totalStats} />

            <div className="grid gap-6">
                <DailyChart data={data.conversations} />

                <div className="grid gap-6 md:grid-cols-2">
                    <HourlyChart data={data.hourlyActivity} />
                    <ProjectChart data={data.projectActivity} />
                </div>

                <ConversationTable data={data.conversations.slice(0, 10)} />
            </div>
        </div>
    );
}
