import type { DailyConversation } from "@/lib/types";
import { ClaudeDataManager } from "./ClaudeDataManager";
import { ClaudeEntry } from "./core/ClaudeEntry";

interface DebugEntry {
    raw: any;
    isValid: boolean;
    error?: string;
    fileName?: string;
    lineNumber?: number;
}

interface FileStats {
    fileName: string;
    validCount: number;
    invalidCount: number;
    errorCount: number;
    project: string;
    entries: DebugEntry[];
}

interface ProjectStats {
    project: string;
    files: FileStats[];
    totalValidCount: number;
    totalInvalidCount: number;
    totalErrorCount: number;
}

interface DebugData {
    validEntries: DebugEntry[];
    invalidEntries: DebugEntry[];
    parseErrors: Array<{ line: string; error: string; fileName?: string; lineNumber?: number }>;
    fileStats: Array<{ fileName: string; validCount: number; invalidCount: number; errorCount: number }>;
    projectStats: ProjectStats[];
}

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

    async loadRawDebugData(selectedProject?: string | null, startDate?: string | null, endDate?: string | null): Promise<DebugData> {
        if (!this.directoryHandle) {
            throw new Error("No directory handle available");
        }

        const debugData: DebugData = {
            validEntries: [],
            invalidEntries: [],
            parseErrors: [],
            fileStats: [],
            projectStats: []
        };

        const fileStats = new Map<
            string,
            { validCount: number; invalidCount: number; errorCount: number; project: string; entries: DebugEntry[] }
        >();

        await this.processDirectoryForDebug(this.directoryHandle, "", debugData, fileStats, selectedProject, startDate, endDate);

        // Convert file stats to array
        debugData.fileStats = Array.from(fileStats.entries()).map(([fileName, stats]) => ({
            fileName,
            validCount: stats.validCount,
            invalidCount: stats.invalidCount,
            errorCount: stats.errorCount
        }));

        // Group by projects
        debugData.projectStats = this.groupFileStatsByProject(fileStats);

        return debugData;
    }

    private async processDirectoryForDebug(
        directoryHandle: any,
        currentPath: string,
        debugData: DebugData,
        fileStats: Map<string, { validCount: number; invalidCount: number; errorCount: number; project: string; entries: DebugEntry[] }>,
        selectedProject?: string | null,
        startDate?: string | null,
        endDate?: string | null
    ): Promise<void> {
        try {
            for await (const [name, handle] of directoryHandle.entries()) {
                const fullPath = currentPath ? `${currentPath}/${name}` : name;

                if (handle.kind === "file" && name.endsWith(".jsonl")) {
                    await this.processJsonlFileForDebug(handle, fullPath, debugData, fileStats, selectedProject, startDate, endDate);
                } else if (handle.kind === "directory") {
                    await this.processDirectoryForDebug(handle, fullPath, debugData, fileStats, selectedProject, startDate, endDate);
                }
            }
        } catch (error) {
            console.warn(`Error processing directory ${currentPath}:`, error);
        }
    }

    private async processJsonlFileForDebug(
        fileHandle: any,
        filePath: string,
        debugData: DebugData,
        fileStats: Map<string, { validCount: number; invalidCount: number; errorCount: number; project: string; entries: DebugEntry[] }>,
        selectedProject?: string | null,
        startDate?: string | null,
        endDate?: string | null
    ): Promise<void> {
        try {
            const file = await fileHandle.getFile();
            const content = await file.text();

            const fileName = filePath.split("/").pop() || filePath;
            const fileEntries: DebugEntry[] = [];
            const stats = { validCount: 0, invalidCount: 0, errorCount: 0, project: "", entries: fileEntries };

            const lines = content
                .trim()
                .split("\n")
                .filter((line: string) => line.trim());

            lines.forEach((line: string, lineIndex: number) => {
                const lineNumber = lineIndex + 1;

                try {
                    const rawData = JSON.parse(line);
                    const entry = ClaudeEntry.fromRawData(rawData);

                    // Determine project name
                    const projectName = ClaudeEntry.formatProjectName(rawData.cwd || "");
                    if (!stats.project) {
                        stats.project = projectName;
                    }

                    // Apply project filter
                    if (selectedProject && projectName !== selectedProject) return;

                    // Apply date filter
                    if (startDate || endDate) {
                        if (!rawData.timestamp) return;
                        const entryDate = new Date(rawData.timestamp).toISOString().split("T")[0];
                        if (startDate && entryDate < startDate) return;
                        if (endDate && entryDate > endDate) return;
                    }

                    const debugEntry: DebugEntry = {
                        raw: rawData,
                        isValid: entry.isValid,
                        fileName,
                        lineNumber,
                        error: !entry.isValid ? this.getValidationError(rawData) : undefined
                    };

                    // Add to global lists
                    if (entry.isValid) {
                        debugData.validEntries.push(debugEntry);
                        stats.validCount++;
                    } else {
                        debugData.invalidEntries.push(debugEntry);
                        stats.invalidCount++;
                    }

                    // Add to file-specific entries for lazy loading
                    fileEntries.push(debugEntry);
                } catch (parseError) {
                    stats.errorCount++;
                    debugData.parseErrors.push({
                        line,
                        error: parseError instanceof Error ? parseError.message : String(parseError),
                        fileName,
                        lineNumber
                    });
                }
            });

            if (stats.validCount > 0 || stats.invalidCount > 0 || stats.errorCount > 0) {
                if (!stats.project) {
                    stats.project = "Unknown Project";
                }
                fileStats.set(fileName, stats);
            }
        } catch (error) {
            console.warn(`Error processing file ${filePath}:`, error);
        }
    }

    private getValidationError(rawData: any): string {
        if (!rawData.timestamp) return "Missing timestamp";
        if (typeof rawData.timestamp !== "string") return "Invalid timestamp type";
        if (rawData.timestamp.length === 0) return "Empty timestamp";

        try {
            const date = new Date(rawData.timestamp);
            if (Number.isNaN(date.getTime())) return "Invalid timestamp format";
        } catch {
            return "Cannot parse timestamp";
        }

        return "Unknown validation error";
    }

    private groupFileStatsByProject(
        fileStats: Map<string, { validCount: number; invalidCount: number; errorCount: number; project: string; entries: DebugEntry[] }>
    ): ProjectStats[] {
        const projectMap = new Map<string, FileStats[]>();

        // Group files by project
        for (const [fileName, stats] of fileStats) {
            const projectName = stats.project;
            if (!projectMap.has(projectName)) {
                projectMap.set(projectName, []);
            }
            projectMap.get(projectName)?.push({
                fileName,
                validCount: stats.validCount,
                invalidCount: stats.invalidCount,
                errorCount: stats.errorCount,
                project: stats.project,
                entries: stats.entries
            });
        }

        // Convert to ProjectStats array
        const projectStats: ProjectStats[] = [];
        for (const [project, files] of projectMap) {
            const totalValidCount = files.reduce((sum, file) => sum + file.validCount, 0);
            const totalInvalidCount = files.reduce((sum, file) => sum + file.invalidCount, 0);
            const totalErrorCount = files.reduce((sum, file) => sum + file.errorCount, 0);

            projectStats.push({
                project,
                files,
                totalValidCount,
                totalInvalidCount,
                totalErrorCount
            });
        }

        // Sort by project name
        return projectStats.sort((a, b) => a.project.localeCompare(b.project));
    }

    // Static factory method
    static create(directoryHandle: any): DataService {
        return new DataService(directoryHandle);
    }
}
