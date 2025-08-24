import { claudeModels } from "@/lib/data/models";
import type { UsageStats } from "@/lib/types";

export class TokenInfo {
    private usage?: UsageStats;

    constructor(usage?: UsageStats) {
        this.usage = usage || {};
    }

    // Direct token access (primitives)
    get input(): number {
        return this.usage?.input_tokens || 0;
    }

    get output(): number {
        return this.usage?.output_tokens || 0;
    }

    get cacheCreation(): number {
        return this.usage?.cache_creation_input_tokens || 0;
    }

    get cacheRead(): number {
        return this.usage?.cache_read_input_tokens || 0;
    }

    get ephemeral5m(): number {
        return this.usage?.cache_creation?.ephemeral_5m_input_tokens || 0;
    }

    get ephemeral1h(): number {
        return this.usage?.cache_creation?.ephemeral_1h_input_tokens || 0;
    }

    // Basic calculated properties (primitives)
    get totalInput(): number {
        return this.input + this.cacheCreation + this.cacheRead;
    }

    get totalTokens(): number {
        return this.totalInput + this.output;
    }

    get cacheTotal(): number {
        return this.cacheCreation + this.cacheRead + this.ephemeral5m + this.ephemeral1h;
    }

    // Basic validation primitives
    get hasTokens(): boolean {
        return this.totalTokens > 0;
    }

    get hasCache(): boolean {
        return this.cacheTotal > 0;
    }

    get isEmpty(): boolean {
        return this.totalTokens === 0;
    }

    // Basic operations (primitives)
    add(other: TokenInfo): TokenInfo {
        const combinedUsage: UsageStats = {
            input_tokens: this.input + other.input,
            output_tokens: this.output + other.output,
            cache_creation_input_tokens: this.cacheCreation + other.cacheCreation,
            cache_read_input_tokens: this.cacheRead + other.cacheRead,
            cache_creation: {
                ephemeral_5m_input_tokens: this.ephemeral5m + other.ephemeral5m,
                ephemeral_1h_input_tokens: this.ephemeral1h + other.ephemeral1h
            }
        };
        return new TokenInfo(combinedUsage);
    }

    calculateEstimatedCost(model: string): number {
        return TokenInfo.calculateEstimatedCost(model, this.input, this.output, this.cacheCreation, this.cacheRead);
    }

    // Static utility methods (primitives)
    static calculateEstimatedCost(
        model: string,
        baseInputTokens: number,
        outputTokens: number,
        cacheCreationTokens: number,
        cacheReadTokens: number
    ): number {
        let modelData = claudeModels.find(
            (m) =>
                model.toLowerCase().includes(m.name.toLowerCase().replace(/\s+/g, "-")) ||
                model.toLowerCase().includes(m.name.toLowerCase().replace(/\s+/g, "")) ||
                model.toLowerCase().includes(m.version)
        );

        if (!modelData) {
            modelData = claudeModels.find((m) => m.name === "Claude 3.5 Sonnet") || claudeModels[0];
        }

        const baseInputCost = (baseInputTokens * modelData.inputPrice) / 1000000;
        const outputCost = (outputTokens * modelData.outputPrice) / 1000000;
        const cacheWriteCost = (cacheCreationTokens * modelData.inputPrice * modelData.cacheWriteMultiplier) / 1000000;
        const cacheReadCost = (cacheReadTokens * modelData.inputPrice * modelData.cacheReadMultiplier) / 1000000;

        return baseInputCost + outputCost + cacheWriteCost + cacheReadCost;
    }

    // Static factory methods (primitives)
    static empty(): TokenInfo {
        return new TokenInfo();
    }

    static fromUsage(usage: UsageStats): TokenInfo {
        return new TokenInfo(usage);
    }

    static sum(tokens: TokenInfo[]): TokenInfo {
        return tokens.reduce((acc, token) => acc.add(token), TokenInfo.empty());
    }
}
