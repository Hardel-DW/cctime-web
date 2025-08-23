import type { ClaudeEntry } from "../core/ClaudeEntry";
import { SessionInfo } from "../core/SessionInfo";

export class ProjectData {
    private projectName: string;
    private entries: ClaudeEntry[];

    constructor(projectName: string, entries: ClaudeEntry[]) {
        this.projectName = projectName;
        this.entries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    // Direct data access (primitives)
    get name(): string {
        return this.projectName;
    }

    get totalTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.totalTokens, 0);
    }

    get totalCost(): number {
        return this.entries.reduce((sum, entry) => sum + entry.cost, 0);
    }

    get messageCount(): number {
        return this.entries.length;
    }

    get inputTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.totalInput, 0);
    }

    get outputTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.output, 0);
    }

    get cacheTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.cacheTotal, 0);
    }

    get cacheCreationTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.cacheCreation, 0);
    }

    get cacheReadTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.cacheRead, 0);
    }

    get firstActivity(): Date {
        return this.entries[0]?.timestamp || new Date();
    }

    get lastActivity(): Date {
        return this.entries[this.entries.length - 1]?.timestamp || new Date();
    }

    get models(): string[] {
        const uniqueModels = new Set(this.entries.map(entry => entry.model));
        return Array.from(uniqueModels);
    }

    get activeDays(): number {
        const uniqueDays = new Set(this.entries.map(entry => entry.formatDate()));
        return uniqueDays.size;
    }

    // Basic calculated primitives
    get averageCostPerMessage(): number {
        return this.messageCount > 0 ? this.totalCost / this.messageCount : 0;
    }

    get averageTokensPerMessage(): number {
        return this.messageCount > 0 ? this.totalTokens / this.messageCount : 0;
    }

    get averageMessagesPerDay(): number {
        return this.activeDays > 0 ? this.messageCount / this.activeDays : 0;
    }

    // Basic validation primitives
    get isEmpty(): boolean {
        return this.entries.length === 0;
    }

    get hasMultipleModels(): boolean {
        return this.models.length > 1;
    }

    // Basic filter primitives
    hasModel(modelName: string): boolean {
        return this.entries.some(entry => entry.hasModel(modelName));
    }

    isInDateRange(start?: Date, end?: Date): boolean {
        if (!start && !end) return true;
        if (start && this.lastActivity < start) return false;
        if (end && this.firstActivity > end) return false;
        return true;
    }

    // Basic operations (primitives)
    getEntries(): ClaudeEntry[] {
        return [...this.entries];
    }

    getEntriesByDateRange(start: Date, end: Date): ClaudeEntry[] {
        return this.entries.filter(entry => entry.isInDateRange(start, end));
    }

    getEntriesByModel(modelName: string): ClaudeEntry[] {
        return this.entries.filter(entry => entry.hasModel(modelName));
    }

    getEntriesByHour(hour: number): ClaudeEntry[] {
        return this.entries.filter(entry => entry.getHour() === hour);
    }

    getSessions(): SessionInfo[] {
        const sessionMap = SessionInfo.groupBySession(this.entries);
        return Array.from(sessionMap.values());
    }

    // Static factory methods (primitives)
    static fromEntries(projectName: string, entries: ClaudeEntry[]): ProjectData {
        return new ProjectData(projectName, entries);
    }

    static createMultiple(entriesByProject: Map<string, ClaudeEntry[]>): ProjectData[] {
        const projects: ProjectData[] = [];
        for (const [projectName, entries] of entriesByProject) {
            projects.push(new ProjectData(projectName, entries));
        }
        return projects.sort((a, b) => b.totalTokens - a.totalTokens);
    }
}