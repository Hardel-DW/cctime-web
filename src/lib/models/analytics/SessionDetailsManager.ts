import type { MessageData, SessionDetailsData } from "@/lib/types/session";
import { formatDuration } from "@/lib/utils";

export class SessionDetailsManager {
    private allEntries: any[];

    constructor(allEntries: any[]) {
        this.allEntries = allEntries;
    }

    getSessionDetails(sessionId: string): SessionDetailsData | null {
        if (!sessionId) return null;

        const sessionEntries = this.allEntries
            .filter((entry) => entry.sessionId === sessionId)
            .filter((entry) => entry.timestamp)
            .sort((a, b) => new Date(a.timestamp || "").getTime() - new Date(b.timestamp || "").getTime());

        if (sessionEntries.length === 0) return null;

        const start = new Date(sessionEntries[0].timestamp || "");
        const end = new Date(sessionEntries[sessionEntries.length - 1].timestamp || "");
        const durationMs = Math.max(1000, end.getTime() - start.getTime());
        const durationMinutes = Math.floor(durationMs / (1000 * 60));

        // Extract project name
        const project = sessionEntries.find((entry) => entry.cwd)?.cwd || "";
        const projectName = project ? project.split(/[/\\]/).pop() || "Unknown Project" : "Unknown Project";

        // Get unique models
        const models = [...new Set(sessionEntries.map((entry) => entry.message?.model || "unknown").filter(Boolean))];

        // Calculate token totals
        const totalTokens = sessionEntries.reduce(
            (acc, entry) => {
                const tokens = entry.message?.usage || entry.usage || {};
                acc.input += tokens.input_tokens || 0;
                acc.output += tokens.output_tokens || 0;
                acc.cacheCreation += tokens.cache_creation_input_tokens || 0;
                acc.cacheRead += tokens.cache_read_input_tokens || 0;
                return acc;
            },
            { input: 0, output: 0, cacheCreation: 0, cacheRead: 0, total: 0 }
        );
        totalTokens.total = totalTokens.input + totalTokens.output + totalTokens.cacheCreation + totalTokens.cacheRead;

        // Transform entries to messages
        const messages: MessageData[] = sessionEntries.map((entry) => {
            const tokens = entry.message?.usage || entry.usage || {};
            return {
                timestamp: entry.timestamp || "",
                role: entry.message?.role === "user" ? "user" : "assistant",
                content: this.extractMessageContent(entry.message),
                tokens:
                    tokens && Object.keys(tokens).length > 0
                        ? {
                              input: tokens.input_tokens,
                              output: tokens.output_tokens,
                              cache_creation: tokens.cache_creation_input_tokens,
                              cache_read: tokens.cache_read_input_tokens
                          }
                        : undefined,
                model: entry.message?.model
            };
        });

        return {
            sessionId,
            start,
            end,
            duration: formatDuration(durationMinutes),
            messageCount: sessionEntries.length,
            project: projectName,
            models,
            totalTokens,
            messages
        };
    }

    private extractMessageContent(message: any): string {
        if (!message) return "";

        if (typeof message.content === "string") {
            return message.content;
        }

        if (Array.isArray(message.content)) {
            return message.content
                .map((item: any) => {
                    if (typeof item === "string") return item;
                    if (item.type === "text") return item.text;
                    if (item.type === "tool_use") return `[Tool: ${item.name}]`;
                    if (item.type === "tool_result") return `[Tool Result: ${item.tool_use_id}]`;
                    return "[Content]";
                })
                .join("\n");
        }

        return "[Message content]";
    }
}
