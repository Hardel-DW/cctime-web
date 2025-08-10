import { formatProjectName } from "./project-utils";
import { useFilterStore } from "./store";
import type { DailyConversation, DashboardData, HourlyActivity, ProjectActivity } from "./types";
import { type ISOTimestamp, loadAllUsageData, type UsageData } from "./web-data-loader";

/**
 * Format date from ISO timestamp to YYYY-MM-DD using local timezone
 */
function formatDate(timestamp: ISOTimestamp): string {
    return new Date(timestamp).toISOString().split("T")[0];
}

/**
 * Calculate conversation time using CLI logic
 */
function calculateConversationTime(entries: Array<{ timestamp: ISOTimestamp }>): string {
    if (entries.length === 0) return "0m";
    if (entries.length === 1) return "1m";

    const sortedEntries = [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const sessions: Array<{ start: Date; end: Date }> = [];
    const SESSION_GAP_MS = 3 * 60 * 1000; // 3 minutes

    let currentSessionStart = new Date(sortedEntries[0].timestamp);
    let currentSessionEnd = new Date(sortedEntries[0].timestamp);

    for (let i = 1; i < sortedEntries.length; i++) {
        const currentTime = new Date(sortedEntries[i].timestamp);
        const timeSinceLastMessage = currentTime.getTime() - currentSessionEnd.getTime();

        if (timeSinceLastMessage <= SESSION_GAP_MS) {
            currentSessionEnd = currentTime;
        } else {
            sessions.push({ start: currentSessionStart, end: currentSessionEnd });
            currentSessionStart = currentTime;
            currentSessionEnd = currentTime;
        }
    }
    sessions.push({ start: currentSessionStart, end: currentSessionEnd });

    let totalMinutes = 0;
    for (const session of sessions) {
        const sessionDurationMs = session.end.getTime() - session.start.getTime();
        const sessionMinutes = Math.max(1, Math.floor(sessionDurationMs / (1000 * 60)));
        totalMinutes += sessionMinutes;
    }

    if (totalMinutes < 60) {
        return `${totalMinutes}m`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
}

/**
 * Load real dashboard data from Claude files
 */
export const loadDashboardData = async (): Promise<DashboardData> => {
    try {
        // Charger toutes les données usage réelles
        const allEntries = await loadAllUsageData();

        if (allEntries.length === 0) {
            throw new Error("No usage data found. Please select your Claude directory in Settings.");
        }

        // Appliquer les filtres depuis le store
        const { selectedProject, startDate, endDate } = useFilterStore.getState();

        let filteredEntries = allEntries;

        // Filtrer par projet
        if (selectedProject) {
            filteredEntries = filteredEntries.filter((entry) => {
                if (!entry.cwd) return false;
                const projectName = formatProjectName(entry.cwd);
                return projectName === selectedProject;
            });
        }

        // Filtrer par dates
        if (startDate || endDate) {
            filteredEntries = filteredEntries.filter((entry) => {
                const entryDate = formatDate(entry.timestamp);
                if (startDate && entryDate < startDate) return false;
                if (endDate && entryDate > endDate) return false;
                return true;
            });
        }

        // Grouper par date pour créer les conversations quotidiennes
        const dailyGroups = new Map<string, UsageData[]>();

        for (const entry of filteredEntries) {
            const date = formatDate(entry.timestamp);
            if (!dailyGroups.has(date)) {
                dailyGroups.set(date, []);
            }
            const group = dailyGroups.get(date);
            if (group) {
                group.push(entry);
            }
        }

        // Créer les conversations quotidiennes
        const conversations: DailyConversation[] = [];

        for (const [date, entries] of dailyGroups) {
            if (entries.length === 0) continue;

            entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            const firstEntry = entries[0];
            const lastEntry = entries[entries.length - 1];
            const sessionIds = Array.from(new Set(entries.map((e) => e.sessionId).filter(Boolean))) as string[];

            conversations.push({
                date,
                firstMessage: new Date(firstEntry.timestamp),
                lastMessage: new Date(lastEntry.timestamp),
                conversationTime: calculateConversationTime(entries),
                messages: entries.length,
                sessions: sessionIds.length || 1,
                sessionIds
            });
        }

        // Trier par date (plus récent en premier)
        conversations.sort((a, b) => b.date.localeCompare(a.date));

        // Analyser l'activité horaire
        const hourlyActivity: HourlyActivity[] = Array.from({ length: 24 }, (_, hour) => {
            const hourlyEntries = filteredEntries.filter((entry) => new Date(entry.timestamp).getHours() === hour);

            return {
                hour,
                messageCount: hourlyEntries.length,
                totalTime: Math.floor(hourlyEntries.length / 10) // Estimation grossière
            };
        });

        // Analyser l'activité par projet
        const projectMap = new Map<string, { messages: number; time: number; sessions: Set<string> }>();

        for (const entry of filteredEntries) {
            const projectName = formatProjectName(entry.cwd || "Unknown Project");

            if (!projectMap.has(projectName)) {
                projectMap.set(projectName, { messages: 0, time: 0, sessions: new Set() });
            }

            const project = projectMap.get(projectName);
            if (!project) continue;
            project.messages++;
            if (entry.sessionId) {
                project.sessions.add(entry.sessionId);
            }
        }

        const projectActivity: ProjectActivity[] = Array.from(projectMap.entries())
            .map(([name, data]) => ({
                projectName: name,
                messageCount: data.messages,
                conversationTime: Math.floor(data.messages / 10), // Estimation en minutes
                sessionCount: data.sessions.size
            }))
            .sort((a, b) => b.messageCount - a.messageCount);

        // Calculer les statistiques totales
        const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages, 0);
        const totalSessions = conversations.reduce((sum, conv) => sum + conv.sessions, 0);
        const activeDays = conversations.length;
        const totalConversationMinutes = conversations.reduce((sum, conv) => {
            const match = conv.conversationTime.match(/(?:(\d+)h)?\s*(?:(\d+)m)?/);
            if (!match) return sum;
            return sum + parseInt(match[1] || "0", 10) * 60 + parseInt(match[2] || "0", 10);
        }, 0);

        const formatTotalTime = (totalMinutes: number): string =>
            totalMinutes < 60
                ? `${totalMinutes}m`
                : totalMinutes % 60 === 0
                  ? `${Math.floor(totalMinutes / 60)}h`
                  : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

        return {
            conversations,
            allEntries: [],
            hourlyActivity,
            projectActivity,
            sessionDetails: [], // TODO: Implémenter si nécessaire
            userGaps: [], // TODO: Implémenter si nécessaire
            totalStats: {
                activeDays,
                totalMessages,
                totalSessions,
                avgMessagesPerDay: activeDays > 0 ? Math.round(totalMessages / activeDays) : 0,
                totalConversationTime: formatTotalTime(totalConversationMinutes)
            }
        };
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        throw error;
    }
};
