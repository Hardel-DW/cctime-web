import type { ClaudeEntry } from "./ClaudeEntry";

export class SessionInfo {
    private entries: ClaudeEntry[];

    constructor(entries: ClaudeEntry[]) {
        this.entries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    // Direct data access (primitives)
    get sessionId(): string {
        return this.entries[0]?.sessionId || "";
    }

    get startTime(): Date {
        return this.entries[0]?.timestamp || new Date();
    }

    get endTime(): Date {
        return this.entries[this.entries.length - 1]?.timestamp || new Date();
    }

    get messageCount(): number {
        return this.entries.length;
    }

    get totalTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.totalTokens, 0);
    }

    get totalCost(): number {
        return this.entries.reduce((sum, entry) => sum + entry.cost, 0);
    }

    get models(): string[] {
        const uniqueModels = new Set(this.entries.map((entry) => entry.model));
        return Array.from(uniqueModels);
    }

    get project(): string {
        // Most common project in session
        const projects = this.entries.map((entry) => entry.project);
        const projectCounts = projects.reduce(
            (acc, project) => {
                acc[project] = (acc[project] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return Object.entries(projectCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "Unknown Project";
    }

    get primaryModel(): string {
        const models = this.entries.map((entry) => entry.model);
        const modelCounts = models.reduce(
            (acc, model) => {
                acc[model] = (acc[model] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return Object.entries(modelCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "unknown-model";
    }

    get averageTokensPerMessage(): number {
        return this.messageCount > 0 ? this.totalTokens / this.messageCount : 0;
    }

    get averageCostPerMessage(): number {
        return this.messageCount > 0 ? this.totalCost / this.messageCount : 0;
    }

    // Basic validation primitives
    get isEmpty(): boolean {
        return this.entries.length === 0;
    }

    get hasMultipleModels(): boolean {
        return this.models.length > 1;
    }

    // Basic filter primitives
    hasProject(projectName: string): boolean {
        return this.entries.some((entry) => entry.belongsToProject(projectName));
    }

    hasModel(modelName: string): boolean {
        return this.entries.some((entry) => entry.hasModel(modelName));
    }

    isInDateRange(start?: Date, end?: Date): boolean {
        if (!start && !end) return true;
        if (start && this.endTime < start) return false;
        if (end && this.startTime > end) return false;
        return true;
    }

    // Duration calculation primitive
    getDurationString(): string {
        if (this.entries.length === 0) return "0m";
        if (this.entries.length === 1) return "1m";

        const sessions: Array<{ start: Date; end: Date }> = [];
        const SESSION_GAP_MS = 3 * 60 * 1000; // 3 minutes

        let currentSessionStart = this.startTime;
        let currentSessionEnd = this.startTime;

        for (let i = 1; i < this.entries.length; i++) {
            const currentTime = this.entries[i].timestamp;
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

    // Basic operations (primitives)
    getEntries(): ClaudeEntry[] {
        return [...this.entries];
    }

    getEntriesByTimeRange(start: Date, end: Date): ClaudeEntry[] {
        return this.entries.filter((entry) => entry.timestamp >= start && entry.timestamp <= end);
    }

    // Static factory methods (primitives)
    static fromEntries(entries: ClaudeEntry[]): SessionInfo {
        return new SessionInfo(entries);
    }

    static groupBySession(entries: ClaudeEntry[]): Map<string, SessionInfo> {
        const sessionMap = new Map<string, ClaudeEntry[]>();

        for (const entry of entries) {
            const sessionId = entry.sessionId;
            if (!sessionMap.has(sessionId)) {
                sessionMap.set(sessionId, []);
            }
            sessionMap.get(sessionId)?.push(entry);
        }

        const sessions = new Map<string, SessionInfo>();
        for (const [sessionId, sessionEntries] of sessionMap) {
            sessions.set(sessionId, new SessionInfo(sessionEntries));
        }

        return sessions;
    }
}
