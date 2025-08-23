import type { ClaudeEntry } from "../core/ClaudeEntry";

export interface CacheStatsData {
    totalCacheCreationTokens: number;
    totalCacheReadTokens: number;
    totalEphemeral5mTokens: number;
    totalEphemeral1hTokens: number;
    cacheHitRate: number;
    cacheEfficiencyRate: number;
    totalCacheTokens: number;
    cacheSavingsRatio: number;
}

export interface CacheUsageData {
    name: string;
    value: number;
    percentage: number;
}

export class CacheStats {
    private entries: ClaudeEntry[];

    constructor(entries: ClaudeEntry[]) {
        this.entries = entries.filter(entry => {
            const usage = entry.rawEntry.message?.usage;
            return usage && (
                usage.cache_creation_input_tokens ||
                usage.cache_read_input_tokens
            );
        });
    }

    get basicStats(): CacheStatsData {
        const stats = this.entries.reduce(
            (acc, entry) => {
                const usage = entry.rawEntry.message?.usage || {};
                const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
                const cacheReadTokens = usage.cache_read_input_tokens || 0;
                
                const ephemeral5m = usage.cache_creation?.ephemeral_5m_input_tokens || 0;
                const ephemeral1h = usage.cache_creation?.ephemeral_1h_input_tokens || 0;
                
                acc.totalCacheCreationTokens += cacheCreationTokens;
                acc.totalCacheReadTokens += cacheReadTokens;
                acc.totalEphemeral5mTokens += ephemeral5m;
                acc.totalEphemeral1hTokens += ephemeral1h;
                
                return acc;
            },
            {
                totalCacheCreationTokens: 0,
                totalCacheReadTokens: 0,
                totalEphemeral5mTokens: 0,
                totalEphemeral1hTokens: 0
            }
        );

        const totalCacheTokens = stats.totalCacheCreationTokens + stats.totalCacheReadTokens;
        const cacheHitRate = totalCacheTokens > 0 ? stats.totalCacheReadTokens / totalCacheTokens : 0;
        const cacheEfficiencyRate = stats.totalCacheCreationTokens > 0 ? stats.totalCacheReadTokens / stats.totalCacheCreationTokens : 0;
        const cacheSavingsRatio = totalCacheTokens > 0 ? stats.totalCacheReadTokens / totalCacheTokens : 0;

        return {
            ...stats,
            totalCacheTokens,
            cacheHitRate,
            cacheEfficiencyRate,
            cacheSavingsRatio
        };
    }

    get cacheBreakdownData(): CacheUsageData[] {
        const stats = this.basicStats;
        const total = stats.totalCacheTokens;
        
        if (total === 0) return [];

        const data: CacheUsageData[] = [];
        
        if (stats.totalCacheCreationTokens > 0) {
            data.push({
                name: "Cache Creation",
                value: stats.totalCacheCreationTokens,
                percentage: (stats.totalCacheCreationTokens / total) * 100
            });
        }
        
        if (stats.totalCacheReadTokens > 0) {
            data.push({
                name: "Cache Read",
                value: stats.totalCacheReadTokens,
                percentage: (stats.totalCacheReadTokens / total) * 100
            });
        }
        
        if (stats.totalEphemeral5mTokens > 0) {
            data.push({
                name: "Ephemeral 5m",
                value: stats.totalEphemeral5mTokens,
                percentage: (stats.totalEphemeral5mTokens / total) * 100
            });
        }
        
        if (stats.totalEphemeral1hTokens > 0) {
            data.push({
                name: "Ephemeral 1h",
                value: stats.totalEphemeral1hTokens,
                percentage: (stats.totalEphemeral1hTokens / total) * 100
            });
        }

        return data;
    }

    get dailyCacheUsage(): { date: string; cacheCreation: number; cacheRead: number }[] {
        const dailyMap = new Map<string, { cacheCreation: number; cacheRead: number }>();
        
        for (const entry of this.entries) {
            const date = entry.formatDate();
            const usage = entry.rawEntry.message?.usage || {};
            const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
            const cacheReadTokens = usage.cache_read_input_tokens || 0;
            
            if (!dailyMap.has(date)) {
                dailyMap.set(date, { cacheCreation: 0, cacheRead: 0 });
            }
            
            const dayData = dailyMap.get(date)!;
            dayData.cacheCreation += cacheCreationTokens;
            dayData.cacheRead += cacheReadTokens;
        }

        return Array.from(dailyMap.entries())
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    get hasCache(): boolean {
        const stats = this.basicStats;
        return stats.totalCacheTokens > 0;
    }

    static fromRawEntries(rawEntries: any[]): CacheStats {
        const entries = rawEntries.map(data => ({ 
            rawEntry: data, 
            project: data.cwd ? data.cwd.split('/').pop() || 'Unknown' : 'Unknown',
            timestamp: new Date(data.timestamp),
            formatDate: () => new Date(data.timestamp).toISOString().split('T')[0]
        } as ClaudeEntry));
        return new CacheStats(entries);
    }
}