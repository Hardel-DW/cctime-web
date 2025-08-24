import type { ClaudeEntry } from "../core/ClaudeEntry";
import { ClaudeEntry as ClaudeEntryClass } from "../core/ClaudeEntry";
import { TokenInfo } from "../core/TokenInfo";

export interface TokenStatsData {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCacheCreationTokens: number;
    totalCacheReadTokens: number;
    totalCost: number;
    messageCount: number;
    totalTokens: number;
    avgCostPerMessage: number;
    avgTokensPerMessage: number;
}

export interface ModelStatsData {
    name: string;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    cacheTokens: number;
    cost: number;
    messages: number;
}

export interface ProjectStatsData {
    name: string;
    fullPath?: string;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    cacheTokens: number;
    cost: number;
    messages: number;
}

export class TokenStats {
    private entries: ClaudeEntry[];

    constructor(entries: ClaudeEntry[]) {
        this.entries = entries.filter((entry) => {
            const usage = entry.rawEntry.message?.usage;
            return (
                usage &&
                (usage.input_tokens ||
                    usage.output_tokens ||
                    usage.cache_creation_input_tokens ||
                    usage.cache_read_input_tokens ||
                    entry.rawEntry.costUSD)
            );
        });
    }

    get basicStats(): TokenStatsData {
        const stats = this.entries.reduce(
            (acc, entry) => {
                const usage = entry.rawEntry.message?.usage || {};
                const inputTokens = usage.input_tokens || 0;
                const outputTokens = usage.output_tokens || 0;
                const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
                const cacheReadTokens = usage.cache_read_input_tokens || 0;

                acc.totalInputTokens += inputTokens;
                acc.totalOutputTokens += outputTokens;
                acc.totalCacheCreationTokens += cacheCreationTokens;
                acc.totalCacheReadTokens += cacheReadTokens;
                const cost =
                    entry.rawEntry.costUSD ||
                    TokenInfo.calculateEstimatedCost(
                        entry.rawEntry.message?.model || "claude-3-5-sonnet-20241022",
                        inputTokens,
                        outputTokens,
                        cacheCreationTokens,
                        cacheReadTokens
                    );
                acc.totalCost += cost;

                return acc;
            },
            {
                totalInputTokens: 0,
                totalOutputTokens: 0,
                totalCacheCreationTokens: 0,
                totalCacheReadTokens: 0,
                totalCost: 0
            }
        );

        const totalTokens = stats.totalInputTokens + stats.totalOutputTokens + stats.totalCacheCreationTokens + stats.totalCacheReadTokens;
        const messageCount = this.entries.length;
        const avgCostPerMessage = messageCount > 0 ? stats.totalCost / messageCount : 0;
        const avgTokensPerMessage = messageCount > 0 ? totalTokens / messageCount : 0;

        return {
            ...stats,
            messageCount,
            totalTokens,
            avgCostPerMessage,
            avgTokensPerMessage
        };
    }

    get modelStats(): Record<string, ModelStatsData> {
        return this.entries.reduce(
            (acc, entry) => {
                const model = entry.rawEntry.message?.model || "unknown";
                const usage = entry.rawEntry.message?.usage || {};
                const inputTokens = usage.input_tokens || 0;
                const outputTokens = usage.output_tokens || 0;
                const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
                const cacheReadTokens = usage.cache_read_input_tokens || 0;
                const cost =
                    entry.rawEntry.costUSD ||
                    TokenInfo.calculateEstimatedCost(
                        model || entry.rawEntry.message?.model || "claude-3-5-sonnet-20241022",
                        inputTokens,
                        outputTokens,
                        cacheCreationTokens,
                        cacheReadTokens
                    );

                if (!acc[model]) {
                    acc[model] = {
                        name: model,
                        totalTokens: 0,
                        inputTokens: 0,
                        outputTokens: 0,
                        cacheTokens: 0,
                        cost: 0,
                        messages: 0
                    };
                }

                acc[model].totalTokens += inputTokens + outputTokens + cacheCreationTokens + cacheReadTokens;
                acc[model].inputTokens += inputTokens;
                acc[model].outputTokens += outputTokens;
                acc[model].cacheTokens += cacheCreationTokens + cacheReadTokens;
                acc[model].cost += cost;
                acc[model].messages += 1;

                return acc;
            },
            {} as Record<string, ModelStatsData>
        );
    }

    get modelChartData(): ModelStatsData[] {
        return Object.values(this.modelStats);
    }

    get projectStats(): Record<string, ProjectStatsData> {
        return this.entries.reduce(
            (acc, entry) => {
                const fullPath = entry.rawEntry.cwd || "Unknown";
                const projectName = ClaudeEntryClass.formatProjectName(fullPath);
                const usage = entry.rawEntry.message?.usage || {};
                const inputTokens = usage.input_tokens || 0;
                const outputTokens = usage.output_tokens || 0;
                const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
                const cacheReadTokens = usage.cache_read_input_tokens || 0;
                const cost =
                    entry.rawEntry.costUSD ||
                    TokenInfo.calculateEstimatedCost(
                        entry.rawEntry.message?.model || "claude-3-5-sonnet-20241022",
                        inputTokens - cacheCreationTokens - cacheReadTokens,
                        outputTokens,
                        cacheCreationTokens,
                        cacheReadTokens
                    );

                if (!acc[projectName]) {
                    acc[projectName] = {
                        name: projectName,
                        fullPath: entry.rawEntry.cwd,
                        totalTokens: 0,
                        inputTokens: 0,
                        outputTokens: 0,
                        cacheTokens: 0,
                        cost: 0,
                        messages: 0
                    };
                }

                acc[projectName].totalTokens += inputTokens + outputTokens + cacheCreationTokens + cacheReadTokens;
                acc[projectName].inputTokens += inputTokens;
                acc[projectName].outputTokens += outputTokens;
                acc[projectName].cacheTokens += cacheCreationTokens + cacheReadTokens;
                acc[projectName].cost += cost;
                acc[projectName].messages += 1;

                return acc;
            },
            {} as Record<string, ProjectStatsData>
        );
    }

    get projectChartData(): ProjectStatsData[] {
        return Object.values(this.projectStats);
    }

    get tokenEntries(): any[] {
        return this.entries.map((entry) => entry.rawEntry);
    }

    static fromRawEntries(rawEntries: any[]): TokenStats {
        const entries = rawEntries.map(
            (data) => ({ rawEntry: data, project: data.cwd ? data.cwd.split("/").pop() || "Unknown" : "Unknown" }) as ClaudeEntry
        );
        return new TokenStats(entries);
    }
}
