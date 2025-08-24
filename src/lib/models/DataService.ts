import type { DailyConversation } from "@/lib/types";
import { ClaudeDataManager } from "./ClaudeDataManager";

export class DataService {
    private directoryHandle: any;

    constructor(directoryHandle: any) {
        this.directoryHandle = directoryHandle;
    }

    async loadDashboardData(selectedProject?: string | null, startDate?: string | null, endDate?: string | null) {
        if (!this.directoryHandle) {
            throw new Error("No directory handle available");
        }

        const rawData = await ClaudeDataManager.loadAllUsageData(this.directoryHandle);
        let dataManager = ClaudeDataManager.fromRawData(rawData);

        // Apply filters
        if (selectedProject) {
            dataManager = dataManager.filterByProject(selectedProject);
        }
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            dataManager = dataManager.filterByDateRange(start, end);
        }

        return this.transformToLegacyFormat(dataManager);
    }

    private transformToLegacyFormat(dataManager: ClaudeDataManager) {
        const sessions = dataManager.getAllSessions();
        const conversations: DailyConversation[] = [];

        // Group sessions by date
        const dailyMap = new Map<string, typeof sessions>();
        sessions.forEach((session) => {
            const date = session.startTime.toISOString().split("T")[0];
            if (!dailyMap.has(date)) {
                dailyMap.set(date, []);
            }
            dailyMap.get(date)?.push(session);
        });

        // Create daily conversations
        for (const [date, daySessions] of dailyMap) {
            if (daySessions.length === 0) continue;

            const allEntries = daySessions.flatMap((s) => s.getEntries());
            allEntries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            const totalTime = daySessions.reduce((sum, session) => {
                const timeStr = session.getDurationString();
                const match = timeStr.match(/(?:(\d+)h)?\s*(?:(\d+)m)?/);
                const hours = parseInt(match?.[1] || "0", 10);
                const minutes = parseInt(match?.[2] || "0", 10);
                return sum + hours * 60 + minutes;
            }, 0);

            const formatTime = (totalMinutes: number): string => {
                if (totalMinutes < 60) return `${totalMinutes}m`;
                const hours = Math.floor(totalMinutes / 60);
                const mins = totalMinutes % 60;
                return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
            };

            conversations.push({
                date,
                firstMessage: allEntries[0]?.timestamp,
                lastMessage: allEntries[allEntries.length - 1]?.timestamp,
                conversationTime: formatTime(totalTime),
                messages: allEntries.length,
                sessions: daySessions.length,
                sessionIds: daySessions.map((s) => s.sessionId).filter(Boolean)
            });
        }

        conversations.sort((a, b) => b.date.localeCompare(a.date));

        return {
            conversations,
            allEntries: dataManager.getAllEntries().map((e) => e.rawEntry),
            hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                messageCount: dataManager.getEntriesByHour(hour).length,
                totalTime: Math.floor(dataManager.getEntriesByHour(hour).length / 10)
            })),
            projectActivity: dataManager.getAllProjects().map((project) => ({
                projectName: project.name,
                messageCount: project.messageCount,
                conversationTime: Math.floor(project.messageCount / 10),
                sessionCount: project.getSessions().length
            })),
            sessionDetails: [],
            userGaps: [],
            totalStats: {
                activeDays: conversations.length,
                totalMessages: dataManager.totalEntries,
                totalSessions: sessions.length,
                avgMessagesPerDay: conversations.length > 0 ? Math.round(dataManager.totalEntries / conversations.length) : 0,
                totalConversationTime: this.formatTotalConversationTime(conversations)
            }
        };
    }

    private formatTotalConversationTime(conversations: DailyConversation[]): string {
        const totalMinutes = conversations.reduce((sum, conv) => {
            const match = conv.conversationTime?.match(/(?:(\d+)h)?\s*(?:(\d+)m)?/);
            const hours = parseInt(match?.[1] || "0", 10) * 60;
            const minutes = parseInt(match?.[2] || "0", 10);
            return sum + hours + minutes;
        }, 0);

        if (totalMinutes < 60) return `${totalMinutes}m`;

        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
    }

    // Static factory method
    static create(directoryHandle: any): DataService {
        return new DataService(directoryHandle);
    }
}
