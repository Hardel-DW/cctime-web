import type { DaySession } from "@/lib/types/session";
import type { ClaudeEntry } from "../core/ClaudeEntry";

export interface SessionStatsData {
    totalSessions: number;
    averageSessionDuration: number;
    averageMessagesPerSession: number;
    activeDays: number;
    dailySessionData: DailySessionData[];
}

export interface DailySessionData {
    date: string;
    sessionCount: number;
    messageCount: number;
    duration: number;
}

export interface SessionData {
    sessionId: string;
    messageCount: number;
    startTime: Date;
    endTime: Date;
    duration: number;
    project: string;
    model: string;
}

export class SessionStats {
    private entries: ClaudeEntry[];

    constructor(entries: ClaudeEntry[]) {
        this.entries = entries.filter((entry) => entry.rawEntry.sessionId).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    get basicStats(): SessionStatsData {
        const sessionMap = new Map<string, ClaudeEntry[]>();

        for (const entry of this.entries) {
            const sessionId = entry.rawEntry.sessionId;
            if (!sessionId) continue;

            if (!sessionMap.has(sessionId)) {
                sessionMap.set(sessionId, []);
            }
            sessionMap.get(sessionId)?.push(entry);
        }

        const sessions = Array.from(sessionMap.values());
        const totalSessions = sessions.length;

        const totalDuration = sessions.reduce((sum, sessionEntries) => {
            if (sessionEntries.length === 0) return sum;
            const start = sessionEntries[0].timestamp;
            const end = sessionEntries[sessionEntries.length - 1].timestamp;
            return sum + (end.getTime() - start.getTime());
        }, 0);

        const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
        const averageMessagesPerSession = totalSessions > 0 ? this.entries.length / totalSessions : 0;

        const uniqueDates = new Set(this.entries.map((entry) => entry.formatDate()));
        const activeDays = uniqueDates.size;

        const dailySessionData = this.getDailySessionData(sessions);

        return {
            totalSessions,
            averageSessionDuration,
            averageMessagesPerSession,
            activeDays,
            dailySessionData
        };
    }

    get allSessions(): SessionData[] {
        const sessionMap = new Map<string, ClaudeEntry[]>();

        for (const entry of this.entries) {
            const sessionId = entry.rawEntry.sessionId;
            if (!sessionId) continue;

            if (!sessionMap.has(sessionId)) {
                sessionMap.set(sessionId, []);
            }
            sessionMap.get(sessionId)?.push(entry);
        }

        return Array.from(sessionMap.entries())
            .map(([sessionId, entries]) => {
                if (entries.length === 0) {
                    return {
                        sessionId,
                        messageCount: 0,
                        startTime: new Date(),
                        endTime: new Date(),
                        duration: 0,
                        project: "Unknown",
                        model: "unknown"
                    };
                }

                const sortedEntries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                const startTime = sortedEntries[0].timestamp;
                const endTime = sortedEntries[sortedEntries.length - 1].timestamp;
                const duration = endTime.getTime() - startTime.getTime();

                return {
                    sessionId,
                    messageCount: entries.length,
                    startTime,
                    endTime,
                    duration,
                    project: entries[0].project || "Unknown",
                    model: entries[0].rawEntry.message?.model || "unknown"
                };
            })
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }

    private getDailySessionData(sessions: ClaudeEntry[][]): DailySessionData[] {
        const dailyMap = new Map<string, { sessions: ClaudeEntry[][]; messages: number }>();

        for (const sessionEntries of sessions) {
            if (sessionEntries.length === 0) continue;

            const date = sessionEntries[0].formatDate();
            if (!dailyMap.has(date)) {
                dailyMap.set(date, { sessions: [], messages: 0 });
            }

            const dayData = dailyMap.get(date);
            if (dayData) {
                dayData.sessions.push(sessionEntries);
                dayData.messages += sessionEntries.length;
            }
        }

        return Array.from(dailyMap.entries())
            .map(([date, data]) => ({
                date,
                sessionCount: data.sessions.length,
                messageCount: data.messages,
                duration: data.sessions.reduce((sum, sessionEntries) => {
                    if (sessionEntries.length === 0) return sum;
                    const start = sessionEntries[0].timestamp;
                    const end = sessionEntries[sessionEntries.length - 1].timestamp;
                    return sum + (end.getTime() - start.getTime());
                }, 0)
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    get daySessions(): DaySession[] {
        const sessionMap = new Map<string, Map<string, any[]>>();

        // Group raw entries by date and session
        for (const entry of this.entries) {
            const rawEntry = entry.rawEntry;
            if (!rawEntry.timestamp || !rawEntry.sessionId) continue;

            const date = new Date(rawEntry.timestamp).toISOString().split("T")[0];

            if (!sessionMap.has(date)) {
                sessionMap.set(date, new Map());
            }

            const dateMap = sessionMap.get(date);
            if (!dateMap) continue;

            if (!dateMap.has(rawEntry.sessionId)) {
                dateMap.set(rawEntry.sessionId, []);
            }

            dateMap.get(rawEntry.sessionId)?.push(rawEntry);
        }

        const result: DaySession[] = [];

        for (const [date, sessions] of sessionMap) {
            const daySessions = [];
            let totalMessages = 0;

            for (const [sessionId, entries] of sessions) {
                const sortedEntries = entries.sort((a, b) => new Date(a.timestamp || "").getTime() - new Date(b.timestamp || "").getTime());

                const start = new Date(sortedEntries[0].timestamp || "");
                const end = new Date(sortedEntries[sortedEntries.length - 1].timestamp || "");
                const messageCount = entries.length;
                totalMessages += messageCount;

                // Get project from entries
                const project = entries.find((e: any) => e.cwd)?.cwd;
                const projectName = project ? project.split(/[/\\]/).pop() || "Unknown Project" : "Unknown Project";

                daySessions.push({
                    sessionId,
                    start,
                    end,
                    messageCount,
                    project: projectName
                });
            }

            // Calculate total time for the day
            let totalMinutes = 0;
            for (const session of daySessions) {
                const duration = Math.max(1, Math.floor((session.end.getTime() - session.start.getTime()) / (1000 * 60)));
                totalMinutes += duration;
            }

            const totalTime = totalMinutes < 60 ? `${totalMinutes}m` : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

            result.push({
                date,
                sessions: daySessions.sort((a, b) => a.start.getTime() - b.start.getTime()),
                totalMessages,
                totalTime
            });
        }

        return result.sort((a, b) => b.date.localeCompare(a.date));
    }

    static fromRawEntries(rawEntries: any[]): SessionStats {
        const entries = rawEntries.map(
            (data) =>
                ({
                    rawEntry: data,
                    project: data.cwd ? data.cwd.split("/").pop() || "Unknown" : "Unknown",
                    timestamp: new Date(data.timestamp),
                    formatDate: () => new Date(data.timestamp).toISOString().split("T")[0]
                }) as ClaudeEntry
        );
        return new SessionStats(entries);
    }
}
