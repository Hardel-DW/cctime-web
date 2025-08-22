import { z } from "zod";
import { getCachedDirectoryHandle } from "./directory-storage";
import { formatProjectName, getProjectNameFromPath } from "./project-utils";
export const isoTimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/, "Invalid ISO timestamp");

const todoItemSchema = z.looseObject({
    id: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(["pending", "in_progress", "completed"]).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

const fileOperationSchema = z.looseObject({
    filePath: z.string().optional(),
    content: z.string().optional(),
    numLines: z.number().optional(),
    startLine: z.number().optional(),
    totalLines: z.number().optional(),
    operation: z.string().optional(),
    lineCount: z.number().optional(),
    bytesRead: z.number().optional(),
    encoding: z.string().optional()
});

const messageContentSchema = z.looseObject({
    type: z.enum(["text", "tool_use", "tool_result", "image"]).optional(),
    text: z.string().optional(),

    tool_use_id: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    input: z.record(z.string(), z.any()).optional(),

    output: z.any().optional(),
    content: z.union([z.string(), z.array(z.any())]).optional(),
    is_error: z.boolean().optional(),
    error: z.string().optional(),

    source: z
        .object({
            type: z.string().optional(),
            media_type: z.string().optional(),
            data: z.string().optional()
        })
        .optional(),

    cache_control: z
        .object({
            type: z.string().optional()
        })
        .optional()
});

const usageStatsSchema = z.looseObject({
    input_tokens: z.number().optional(),
    output_tokens: z.number().optional(),
    cache_creation_input_tokens: z.number().optional(),
    cache_read_input_tokens: z.number().optional(),
    service_tier: z.string().optional(),
    total_tokens: z.number().optional(),
    prompt_tokens: z.number().optional(),
    completion_tokens: z.number().optional(),
    cache_creation: z.looseObject({
        ephemeral_5m_input_tokens: z.number().optional(),
        ephemeral_1h_input_tokens: z.number().optional()
    }).optional()
});

const messageSchema = z.looseObject({
    id: z.string().optional(),
    type: z.string().optional(),
    role: z.enum(["user", "assistant", "system"]).optional(),
    content: z
        .union([
            z.string(),
            z.array(messageContentSchema)
        ])
        .optional(),
    model: z.string().optional(),
    stop_reason: z.string().nullable().optional(),
    stop_sequence: z.string().nullable().optional(),
    usage: usageStatsSchema.optional(),
    metadata: z.record(z.string(), z.any()).optional(),

    system: z.string().optional(),
    temperature: z.number().optional(),
    max_tokens: z.number().optional(),

    tool_calls: z.array(z.any()).optional(),
    tool_use_id: z.string().optional(),

    stream: z.boolean().optional(),
    partial: z.boolean().optional(),
    finished: z.boolean().optional(),

    created_at: z.string().optional(),
    processing_time: z.number().optional()
});

const toolUseResultSchema = z.looseObject({
    type: z.string().optional(),
    oldTodos: z.array(todoItemSchema).optional(),
    newTodos: z.array(todoItemSchema).optional(),
    file: fileOperationSchema.optional(),
    files: z.array(fileOperationSchema).optional(),
    result: z.any().optional(),
    error: z.string().optional(),
    duration: z.number().optional(),
    tool_name: z.string().optional(),
    tool_input: z.record(z.string(), z.any()).optional(),
    tool_output: z.any().optional(),
    success: z.boolean().optional()
});

export const usageDataSchema = z.looseObject({
    timestamp: isoTimestampSchema.optional(),
    cwd: z.string().optional(),
    sessionId: z.string().optional(),
    parentUuid: z.string().nullable().optional(),
    uuid: z.string().optional(),
    isSidechain: z.boolean().optional(),
    userType: z.string().optional(),
    version: z.string().optional(),
    type: z.string().optional(),

    gitBranch: z.string().optional(),
    projectHash: z.string().optional(),
    workspaceType: z.string().optional(),

    message: messageSchema.optional(),

    toolUseResult: toolUseResultSchema.optional(),
    toolCalls: z.array(z.any()).optional(),

    costUSD: z.number().optional(),
    tokenUsage: usageStatsSchema.optional(),
    model: z.string().optional(),

    isApiErrorMessage: z.boolean().optional(),
    error: z.string().optional(),
    errorCode: z.string().optional(),

    conversationId: z.string().optional(),
    turnId: z.string().optional(),
    messageIndex: z.number().optional(),
    requestId: z.string().optional(),

    platform: z.string().optional(),
    userAgent: z.string().optional(),
    environment: z.record(z.string(), z.any()).optional(),

    metadata: z.record(z.string(), z.any()).optional(),
    context: z.record(z.string(), z.any()).optional(),
    source: z.string().optional(),
    event: z.string().optional(),
    data: z.any().optional(),

    summary: z.string().optional(),
    duration: z.number().optional(),
    completed: z.boolean().optional(),

    resumeState: z.record(z.string(), z.any()).optional(),
    continuationData: z.any().optional()
})
    .transform((data) => {
        if (!data.timestamp) {
            data.timestamp = new Date().toISOString();
        }
        return data;
    });

export type UsageData = z.infer<typeof usageDataSchema>;
export type ISOTimestamp = z.infer<typeof isoTimestampSchema>;
export type TodoItem = z.infer<typeof todoItemSchema>;
export type FileOperation = z.infer<typeof fileOperationSchema>;
export type MessageContent = z.infer<typeof messageContentSchema>;
export type UsageStats = z.infer<typeof usageStatsSchema>;
export type Message = z.infer<typeof messageSchema>;
export type ToolUseResult = z.infer<typeof toolUseResultSchema>;

export interface Project {
    name: string;
    path: string;
    messageCount: number;
    lastActivity: string;
}

/**
 * Parse JSONL content and extract usage data
 */
function parseJsonlContent(content: string): UsageData[] {
    const lines = content
        .trim()
        .split("\n")
        .filter((line) => line.trim());
    const entries: UsageData[] = [];

    for (const line of lines) {
        try {
            const data = JSON.parse(line);
            const entry = usageDataSchema.parse(data);
            entries.push(entry);
        } catch (error) {
            console.warn("Skipping invalid line:", error);
        }
    }

    return entries;
}

/**
 * Load projects from selected directory
 */
export async function loadProjectsFromDirectory(): Promise<Project[]> {
    try {
        if (!("showDirectoryPicker" in window)) {
            throw new Error("File System Access API not supported in this browser");
        }

        const directoryHandle = getCachedDirectoryHandle();
        if (!directoryHandle) {
            throw new Error(
                "No Claude directory selected. Please select your Claude directory in Settings first. Default location: ~/.claude or %USERPROFILE%\\.claude"
            );
        }

        const projects = new Map<string, Project>();

        await processDirectory(directoryHandle, "", projects);

        return Array.from(projects.values()).sort((a, b) => b.messageCount - a.messageCount);
    } catch (error) {
        console.error("Error loading projects:", error);
        throw error;
    }
}

/**
 * Process directory recursively to find JSONL files
 */
async function processDirectory(directoryHandle: any, currentPath: string, projects: Map<string, Project>): Promise<void> {
    try {
        for await (const [name, handle] of directoryHandle.entries()) {
            const fullPath = currentPath ? `${currentPath}/${name}` : name;

            if (handle.kind === "file" && name.endsWith(".jsonl")) {
                await processJsonlFile(handle, fullPath, projects);
            } else if (handle.kind === "directory") {
                await processDirectory(handle, fullPath, projects);
            }
        }
    } catch (error) {
        console.warn(`Error processing directory ${currentPath}:`, error);
    }
}

/**
 * Process a single JSONL file
 */
async function processJsonlFile(fileHandle: any, filePath: string, projects: Map<string, Project>): Promise<void> {
    try {
        const file = await fileHandle.getFile();
        const content = await file.text();
        const entries = parseJsonlContent(content);

        if (entries.length === 0) return;

        let projectName = getProjectNameFromPath(filePath);

        const cwdProjects = new Set(
            entries
                .map((entry) => entry.cwd)
                .filter(Boolean)
                .map((cwd) => formatProjectName(cwd || "Unknown"))
        );

        if (cwdProjects.size === 1) {
            projectName = Array.from(cwdProjects)[0];
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

/**
 * Load all usage data from directory
 */
export async function loadAllUsageData(): Promise<UsageData[]> {
    try {
        if (!("showDirectoryPicker" in window)) {
            throw new Error("File System Access API not supported");
        }

        const directoryHandle = getCachedDirectoryHandle();
        if (!directoryHandle) {
            throw new Error(
                "No Claude directory selected. Please select your Claude directory in Settings first. Default location: ~/.claude or %USERPROFILE%\\.claude"
            );
        }

        const allEntries: UsageData[] = [];
        await collectAllEntries(directoryHandle, "", allEntries);

        return allEntries.sort((a, b) => new Date(a.timestamp || "").getTime() - new Date(b.timestamp || "").getTime());
    } catch (error) {
        console.error("Error loading usage data:", error);
        throw error;
    }
}

async function collectAllEntries(directoryHandle: any, currentPath: string, allEntries: UsageData[]): Promise<void> {
    try {
        for await (const [name, handle] of directoryHandle.entries()) {
            const fullPath = currentPath ? `${currentPath}/${name}` : name;

            if (handle.kind === "file" && name.endsWith(".jsonl")) {
                const file = await handle.getFile();
                const content = await file.text();
                const entries = parseJsonlContent(content);
                allEntries.push(...entries);
            } else if (handle.kind === "directory") {
                await collectAllEntries(handle, fullPath, allEntries);
            }
        }
    } catch (error) {
        console.warn(`Error collecting entries from ${currentPath}:`, error);
    }
}
