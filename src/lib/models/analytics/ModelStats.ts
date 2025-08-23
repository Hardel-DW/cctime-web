import type { ClaudeEntry } from "../core/ClaudeEntry";

export class ModelData {
    private modelName: string;
    private entries: ClaudeEntry[];

    constructor(modelName: string, entries: ClaudeEntry[]) {
        this.modelName = modelName;
        this.entries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    // Direct data access (primitives)
    get name(): string {
        return this.modelName;
    }

    get version(): string {
        const patterns = [
            /claude[-\s]*(\d+\.?\d*)/i,
            /(\d+\.?\d*)[-\s]*sonnet/i,
            /(\d+\.?\d*)[-\s]*opus/i,
            /(\d+\.?\d*)[-\s]*haiku/i,
            /v(\d+\.?\d*)/i
        ];

        for (const pattern of patterns) {
            const match = this.modelName.match(pattern);
            if (match) return match[1];
        }

        return "unknown";
    }

    get tier(): string {
        const lowerName = this.modelName.toLowerCase();
        if (lowerName.includes("opus")) return "Premium";
        if (lowerName.includes("sonnet")) return "Balanced";
        if (lowerName.includes("haiku")) return "Fast";
        return "Unknown";
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

    get cacheCreationTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.cacheCreation, 0);
    }

    get cacheReadTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.cacheRead, 0);
    }

    get cacheTotal(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.cacheTotal, 0);
    }

    get firstUsed(): Date {
        return this.entries[0]?.timestamp || new Date();
    }

    get lastUsed(): Date {
        return this.entries[this.entries.length - 1]?.timestamp || new Date();
    }

    get activeDays(): number {
        const uniqueDays = new Set(this.entries.map(entry => entry.formatDate()));
        return uniqueDays.size;
    }

    get projects(): string[] {
        const uniqueProjects = new Set(this.entries.map(entry => entry.project));
        return Array.from(uniqueProjects);
    }

    // Basic calculated primitives
    get averageCostPerToken(): number {
        return this.totalTokens > 0 ? this.totalCost / this.totalTokens : 0;
    }

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

    get hasMultipleProjects(): boolean {
        return this.projects.length > 1;
    }

    // Basic filter primitives
    hasProject(projectName: string): boolean {
        return this.entries.some(entry => entry.belongsToProject(projectName));
    }

    isInDateRange(start?: Date, end?: Date): boolean {
        if (!start && !end) return true;
        if (start && this.lastUsed < start) return false;
        if (end && this.firstUsed > end) return false;
        return true;
    }

    // Basic operations (primitives)
    getEntries(): ClaudeEntry[] {
        return [...this.entries];
    }

    getEntriesByProject(projectName: string): ClaudeEntry[] {
        return this.entries.filter(entry => entry.belongsToProject(projectName));
    }

    getEntriesByDateRange(start: Date, end: Date): ClaudeEntry[] {
        return this.entries.filter(entry => entry.isInDateRange(start, end));
    }

    getEntriesByHour(hour: number): ClaudeEntry[] {
        return this.entries.filter(entry => entry.getHour() === hour);
    }

    // Static factory methods (primitives)
    static fromEntries(modelName: string, entries: ClaudeEntry[]): ModelData {
        return new ModelData(modelName, entries);
    }

    static createMultiple(entriesByModel: Map<string, ClaudeEntry[]>): ModelData[] {
        const models: ModelData[] = [];
        for (const [modelName, entries] of entriesByModel) {
            models.push(new ModelData(modelName, entries));
        }
        return models.sort((a, b) => b.totalTokens - a.totalTokens);
    }
}