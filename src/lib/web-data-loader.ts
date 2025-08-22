import { z } from "zod";
import { getCachedDirectoryHandle } from "./directory-storage";
import { formatProjectName, getProjectNameFromPath } from "./project-utils";

// Types basés sur la version CLI
export const isoTimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/, "Invalid ISO timestamp");

export const usageDataSchema = z.object({
    timestamp: isoTimestampSchema.optional(), // Allow missing timestamps
    cwd: z.string().optional(),
    message: z
        .object({
            content: z
                .array(
                    z.object({
                        type: z.string().optional(),
                        text: z.string().optional()
                    })
                )
                .optional(),
            role: z.string().optional(),
            usage: z
                .object({
                    input_tokens: z.number().optional(),
                    output_tokens: z.number().optional(),
                    cache_creation_input_tokens: z.number().optional(),
                    cache_read_input_tokens: z.number().optional(),
                    service_tier: z.string().optional()
                })
                .optional(),
            model: z.string().optional()
        })
        .optional(),
    costUSD: z.number().optional(),
    sessionId: z.string().optional(),
    isApiErrorMessage: z.boolean().optional()
}).transform(data => {
    // Provide fallback timestamp if missing
    if (!data.timestamp) {
        data.timestamp = new Date().toISOString();
    }
    return data;
});

export type UsageData = z.infer<typeof usageDataSchema>;
export type ISOTimestamp = z.infer<typeof isoTimestampSchema>;

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

        // Parcourir récursivement le dossier pour trouver les fichiers .jsonl
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

        // Déterminer le projet depuis le chemin ou le cwd des entrées
        let projectName = getProjectNameFromPath(filePath);

        // Si on peut pas déterminer depuis le path, utiliser le cwd des entrées
        const cwdProjects = new Set(
            entries
                .map((entry) => entry.cwd)
                .filter(Boolean)
                .map((cwd) => formatProjectName(cwd || "Unknown"))
        );

        if (cwdProjects.size === 1) {
            projectName = Array.from(cwdProjects)[0];
        }

        // Grouper par projet
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

        // Mettre à jour la dernière activité
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
 * Load all usage data from directory (pour les autres composants)
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
