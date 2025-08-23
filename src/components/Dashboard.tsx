import { useQuery } from "@tanstack/react-query";
import { Bot } from "lucide-react";
import { loadDashboardData } from "@/lib/data-service";
import { getCachedDirectoryHandle } from "@/lib/directory-storage";
import { useFilterStore } from "@/lib/store";
import { ConversationTable } from "./ConversationTable";
import { DataStateWrapper } from "./DataStateWrapper";
import { DailyChart } from "./charts/dashboard/DailyChart";
import { HourlyChart } from "./charts/dashboard/HourlyChart";
import { ProjectChart } from "./charts/dashboard/ProjectChart";
import { FilterIndicator } from "./FilterIndicator";
import { StatsCards } from "./StatsCards";
import { WelcomeScreen } from "./WelcomeScreen";


export function Dashboard() {
    const { dataRefreshKey, selectedProject, startDate, endDate } = useFilterStore();
    const hasDirectoryHandle = getCachedDirectoryHandle() !== null;
    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard-data", dataRefreshKey, selectedProject, startDate, endDate],
        queryFn: loadDashboardData,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: hasDirectoryHandle // Only run query if directory is selected
    });

    if (!hasDirectoryHandle) return <WelcomeScreen />;

    return (
        <DataStateWrapper
            isLoading={isLoading}
            error={error}
            loadingMessage="Loading your conversation data..."
            noDirectoryIcon={<Bot className="h-12 w-12" />}
            noDirectoryMessage="Please select your Claude data directory to view analytics."
        >
            {!data ? null : (
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
            )}
        </DataStateWrapper>
    );
}
