import type { UsageData } from "@/lib/types";
import { TokenInfo } from "./TokenInfo";

export class ClaudeEntry {
    private rawData: UsageData;
    private _tokens?: TokenInfo;

    constructor(rawEntry: UsageData) {
        this.rawData = rawEntry;
    }

    // Direct data access (primitives)
    get rawEntry(): UsageData {
        return this.rawData;
    }

    get timestamp(): Date {
        return new Date(this.rawData.timestamp || new Date());
    }

    get project(): string {
        return ClaudeEntry.formatProjectName(this.rawData.cwd || "Unknown Project");
    }

    get projectRaw(): string {
        return this.rawData.cwd || "";
    }

    get sessionId(): string {
        return this.rawData.sessionId || "";
    }

    get model(): string {
        return this.rawData.message?.model || "";
    }

    get tokens(): TokenInfo {
        if (!this._tokens) {
            this._tokens = new TokenInfo(this.rawData.message?.usage);
        }
        return this._tokens;
    }

    get cost(): number {
        return this.rawData.costUSD || 0;
    }

    // Basic validation primitives
    get isValid(): boolean {
        return !!(this.rawData.timestamp && this.rawData.timestamp.length > 0);
    }

    get hasUsage(): boolean {
        const usage = this.rawData.message?.usage;
        return !!(
            usage &&
            (usage.input_tokens ||
                usage.output_tokens ||
                usage.cache_creation_input_tokens ||
                usage.cache_read_input_tokens ||
                this.rawData.costUSD)
        );
    }

    // Basic filter primitives
    isInDateRange(start?: Date, end?: Date): boolean {
        if (!start && !end) return true;

        const entryDate = this.formatDate();
        const startStr = start?.toISOString().split("T")[0];
        const endStr = end?.toISOString().split("T")[0];

        if (startStr && entryDate < startStr) return false;
        if (endStr && entryDate > endStr) return false;

        return true;
    }

    belongsToProject(projectName: string): boolean {
        return this.project === projectName;
    }

    belongsToSession(sessionId: string): boolean {
        return this.sessionId === sessionId;
    }

    hasModel(modelName: string): boolean {
        return this.model.toLowerCase().includes(modelName.toLowerCase());
    }

    // Basic transformation primitives
    formatDate(): string {
        return this.timestamp.toISOString().split("T")[0];
    }

    getHour(): number {
        return this.timestamp.getHours();
    }

    getDayOfWeek(): number {
        return this.timestamp.getDay();
    }

    // Static utility methods (primitives)
    static formatProjectName(rawName: string): string {
        if (!rawName) return "Unknown Project";

        let decoded = rawName;
        try {
            decoded = decodeURIComponent(rawName);
        } catch {
            // If decoding fails, use raw name
        }

        // Always extract the last meaningful part of any path
        if (decoded.includes("/") || decoded.includes("\\")) {
            const parts = decoded.split(/[/\\]/);
            const filteredParts = parts.filter((p) => p.length > 0);
            decoded = filteredParts[filteredParts.length - 1] || "Unknown Project";
        }

        // Clean up the name
        return (
            decoded
                .replace(/[-_]/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown Project"
        );
    }

    static getProjectNameFromPath(filePath: string): string {
        const normalizedPath = filePath.replace(/\\/g, "/");
        const pathParts = normalizedPath.split("/");

        const projectsIndex = pathParts.findIndex((part) => part === "projects");
        if (projectsIndex !== -1 && projectsIndex + 1 < pathParts.length) {
            const rawProjectName = pathParts[projectsIndex + 1];
            return ClaudeEntry.formatProjectName(rawProjectName);
        }

        const parentDir = pathParts[pathParts.length - 2];
        if (parentDir && parentDir !== "projects") {
            return ClaudeEntry.formatProjectName(parentDir);
        }

        return "Unknown Project";
    }

    // Static factory methods (primitives)
    static fromRawData(data: UsageData): ClaudeEntry {
        return new ClaudeEntry(data);
    }

    static filterValid(entries: ClaudeEntry[]): ClaudeEntry[] {
        return entries.filter((entry) => entry.isValid);
    }

    static filterWithUsage(entries: ClaudeEntry[]): ClaudeEntry[] {
        return entries.filter((entry) => entry.hasUsage);
    }
}
