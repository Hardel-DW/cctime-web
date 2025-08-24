import type { UsageData } from "@/lib/types";
import { ModelData } from "./analytics/ModelStats";
import { ProjectData } from "./analytics/ProjectStats";
import { ClaudeEntry } from "./core/ClaudeEntry";
import { SessionInfo } from "./core/SessionInfo";

export interface Project {
    name: string;
    path: string;
    messageCount: number;
    lastActivity: string;
}

export class ClaudeDataManager {
    private entries: ClaudeEntry[];

    constructor(rawData: UsageData[]) {
        this.entries = rawData
            .map((data) => ClaudeEntry.fromRawData(data))
            .filter((entry) => entry.isValid)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    // Direct data access (primitives)
    get totalEntries(): number {
        return this.entries.length;
    }

    get totalTokens(): number {
        return this.entries.reduce((sum, entry) => sum + entry.tokens.totalTokens, 0);
    }

    get totalCost(): number {
        return this.entries.reduce((sum, entry) => sum + entry.cost, 0);
    }

    get dateRange(): { start: Date; end: Date } {
        if (this.entries.length === 0) {
            const now = new Date();
            return { start: now, end: now };
        }
        return {
            start: this.entries[0].timestamp,
            end: this.entries[this.entries.length - 1].timestamp
        };
    }

    get uniqueProjects(): string[] {
        const projects = new Set(this.entries.map((entry) => entry.project));
        return Array.from(projects);
    }

    get uniqueModels(): string[] {
        const models = new Set(this.entries.map((entry) => entry.model));
        return Array.from(models);
    }

    get uniqueSessions(): string[] {
        const sessions = new Set(this.entries.map((entry) => entry.sessionId));
        return Array.from(sessions);
    }

    // Basic validation primitives
    get isEmpty(): boolean {
        return this.entries.length === 0;
    }

    get hasMultipleProjects(): boolean {
        return this.uniqueProjects.length > 1;
    }

    get hasMultipleModels(): boolean {
        return this.uniqueModels.length > 1;
    }

    // Basic operations (primitives)
    getAllEntries(): ClaudeEntry[] {
        return [...this.entries];
    }

    getEntriesByProject(projectName: string): ClaudeEntry[] {
        return this.entries.filter((entry) => entry.belongsToProject(projectName));
    }

    getEntriesByModel(modelName: string): ClaudeEntry[] {
        return this.entries.filter((entry) => entry.hasModel(modelName));
    }

    getEntriesBySession(sessionId: string): ClaudeEntry[] {
        return this.entries.filter((entry) => entry.belongsToSession(sessionId));
    }

    getEntriesByDateRange(start?: Date, end?: Date): ClaudeEntry[] {
        return this.entries.filter((entry) => entry.isInDateRange(start, end));
    }

    getEntriesByHour(hour: number): ClaudeEntry[] {
        return this.entries.filter((entry) => entry.getHour() === hour);
    }

    // Aggregation methods (primitives)
    getAllSessions(): SessionInfo[] {
        const sessionMap = SessionInfo.groupBySession(this.entries);
        return Array.from(sessionMap.values());
    }

    getSessionById(sessionId: string): SessionInfo | null {
        const entries = this.getEntriesBySession(sessionId);
        return entries.length > 0 ? SessionInfo.fromEntries(entries) : null;
    }

    getAllProjects(): ProjectData[] {
        const projectMap = new Map<string, ClaudeEntry[]>();

        for (const entry of this.entries) {
            const project = entry.project;
            if (!projectMap.has(project)) {
                projectMap.set(project, []);
            }
            projectMap.get(project)?.push(entry);
        }

        return ProjectData.createMultiple(projectMap);
    }

    getProjectByName(projectName: string): ProjectData | null {
        const entries = this.getEntriesByProject(projectName);
        return entries.length > 0 ? ProjectData.fromEntries(projectName, entries) : null;
    }

    getAllModels(): ModelData[] {
        const modelMap = new Map<string, ClaudeEntry[]>();

        for (const entry of this.entries) {
            const model = entry.model;
            if (!modelMap.has(model)) {
                modelMap.set(model, []);
            }
            modelMap.get(model)?.push(entry);
        }

        return ModelData.createMultiple(modelMap);
    }

    getModelByName(modelName: string): ModelData | null {
        const entries = this.getEntriesByModel(modelName);
        return entries.length > 0 ? ModelData.fromEntries(modelName, entries) : null;
    }

    // Filter operations (primitives)
    filterByProject(projectName: string): ClaudeDataManager {
        const filteredEntries = this.getEntriesByProject(projectName);
        const rawData = filteredEntries.map((entry) => entry.rawEntry);
        return new ClaudeDataManager(rawData);
    }

    filterByModel(modelName: string): ClaudeDataManager {
        const filteredEntries = this.getEntriesByModel(modelName);
        const rawData = filteredEntries.map((entry) => entry.rawEntry);
        return new ClaudeDataManager(rawData);
    }

    filterBySession(sessionId: string): ClaudeDataManager {
        const filteredEntries = this.getEntriesBySession(sessionId);
        const rawData = filteredEntries.map((entry) => entry.rawEntry);
        return new ClaudeDataManager(rawData);
    }

    filterByDateRange(start?: Date, end?: Date): ClaudeDataManager {
        const filteredEntries = this.getEntriesByDateRange(start, end);
        const rawData = filteredEntries.map((entry) => entry.rawEntry);
        return new ClaudeDataManager(rawData);
    }

    // Static data loading methods (primitives)
    static parseJsonlContent(content: string): UsageData[] {
        const lines = content
            .trim()
            .split("\n")
            .filter((line) => line.trim());
        const entries: UsageData[] = [];

        for (const line of lines) {
            try {
                const data = JSON.parse(line);
                entries.push(data);
            } catch (error) {
                console.warn("Skipping invalid line:", error);
            }
        }

        return entries;
    }

    static async loadProjectsFromDirectory(directoryHandle: any): Promise<Project[]> {
        if (!directoryHandle) {
            throw new Error("No directory handle provided");
        }

        const projects = new Map<string, Project>();
        await ClaudeDataManager.processDirectory(directoryHandle, "", projects);

        return Array.from(projects.values()).sort((a, b) => b.messageCount - a.messageCount);
    }

    static async loadAllUsageData(directoryHandle: any): Promise<UsageData[]> {
        if (!directoryHandle) {
            throw new Error("No directory handle provided");
        }

        const allEntries: UsageData[] = [];
        await ClaudeDataManager.collectAllEntries(directoryHandle, "", allEntries);
        return allEntries.sort((a, b) => new Date(a.timestamp || "").getTime() - new Date(b.timestamp || "").getTime());
    }

    private static async processDirectory(directoryHandle: any, currentPath: string, projects: Map<string, Project>): Promise<void> {
        try {
            for await (const [name, handle] of directoryHandle.entries()) {
                const fullPath = currentPath ? `${currentPath}/${name}` : name;

                if (handle.kind === "file" && name.endsWith(".jsonl")) {
                    await ClaudeDataManager.processJsonlFile(handle, fullPath, projects);
                } else if (handle.kind === "directory") {
                    await ClaudeDataManager.processDirectory(handle, fullPath, projects);
                }
            }
        } catch (error) {
            console.warn(`Error processing directory ${currentPath}:`, error);
        }
    }

    private static async processJsonlFile(fileHandle: any, filePath: string, projects: Map<string, Project>): Promise<void> {
        try {
            const file = await fileHandle.getFile();
            const content = await file.text();
            const entries = ClaudeDataManager.parseJsonlContent(content);

            if (entries.length === 0) return;

            // Use the same logic as TokenStats: always use formatProjectName on CWD
            const rawCwdPaths = entries.map((entry) => entry.cwd).filter(Boolean);

            let projectName: string;
            if (rawCwdPaths.length > 0) {
                // Use the first CWD path and format it properly (same as TokenStats)
                projectName = ClaudeEntry.formatProjectName(rawCwdPaths[0] || "");
            } else {
                // Fallback: try to extract project from file path but format it properly
                const pathSegments = filePath.split("/");
                const projectFolder = pathSegments[1]; // e.g., "C--Users-Hardel-Desktop-repository-twitchplay"
                if (projectFolder) {
                    // Convert encoded path back to normal path then format
                    const decodedPath = projectFolder.replace(/-/g, "/");
                    projectName = ClaudeEntry.formatProjectName(decodedPath);
                } else {
                    projectName = "Unknown Project";
                }
            }

            if (!projects.has(projectName)) {
                projects.set(projectName, {
                    name: projectName,
                    path: filePath,
                    messageCount: 0,
                    lastActivity: entries[0].timestamp || ""
                });
            }

            const project = projects.get(projectName);
            if (!project) return;
            project.messageCount += entries.length;

            for (const entry of entries) {
                if (new Date(entry.timestamp || "") > new Date(project.lastActivity)) {
                    project.lastActivity = entry.timestamp || "";
                }
            }
        } catch (error) {
            console.warn(`Error processing file ${filePath}:`, error);
        }
    }

    private static async collectAllEntries(directoryHandle: any, currentPath: string, allEntries: UsageData[]): Promise<void> {
        try {
            for await (const [name, handle] of directoryHandle.entries()) {
                const fullPath = currentPath ? `${currentPath}/${name}` : name;

                if (handle.kind === "file" && name.endsWith(".jsonl")) {
                    const file = await handle.getFile();
                    const content = await file.text();
                    const entries = ClaudeDataManager.parseJsonlContent(content);
                    allEntries.push(...entries);
                } else if (handle.kind === "directory") {
                    await ClaudeDataManager.collectAllEntries(handle, fullPath, allEntries);
                }
            }
        } catch (error) {
            console.warn(`Error collecting entries from ${currentPath}:`, error);
        }
    }

    // Static factory methods (primitives)
    static fromRawData(data: UsageData[]): ClaudeDataManager {
        return new ClaudeDataManager(data);
    }

    static empty(): ClaudeDataManager {
        return new ClaudeDataManager([]);
    }
}
