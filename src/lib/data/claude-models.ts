export interface ClaudeModel {
    name: string;
    version: string;
    tier: string;
    description: string;
    inputPrice: number;
    outputPrice: number;
    cacheWriteMultiplier: number;
    cacheReadMultiplier: number;
    contextWindow: string;
    special?: string;
}

export const claudeModels: ClaudeModel[] = [
    {
        name: "Claude Opus 4.1",
        version: "4.1",
        tier: "Premium",
        description: "World-class performance for the most demanding tasks",
        inputPrice: 15,
        outputPrice: 75,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "200K"
    },
    {
        name: "Claude 4 Opus",
        version: "4.0",
        tier: "Premium",
        description: "Advanced reasoning and analysis for complex tasks",
        inputPrice: 15,
        outputPrice: 75,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "200K"
    },
    {
        name: "Claude Sonnet 4",
        version: "4.0",
        tier: "Balanced",
        description: "Excellent balance of performance and speed",
        inputPrice: 3,
        outputPrice: 15,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "200K"
    },
    {
        name: "Claude Sonnet 4 (1M Context)",
        version: "4.0-1M",
        tier: "Premium Long Context",
        description: "Extended context for processing large documents",
        inputPrice: 6,
        outputPrice: 22.5,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "1M",
        special: "Premium pricing applies to ALL tokens when >200K input tokens"
    },
    {
        name: "Claude Sonnet 3.7",
        version: "3.7",
        tier: "Balanced",
        description: "Enhanced Sonnet with improved capabilities",
        inputPrice: 3,
        outputPrice: 15,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "200K"
    },
    {
        name: "Claude 3.5 Sonnet",
        version: "3.5",
        tier: "Balanced",
        description: "Strong performance with efficient processing",
        inputPrice: 3,
        outputPrice: 15,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "200K"
    },
    {
        name: "Claude 3.5 Haiku",
        version: "3.5",
        tier: "Fast",
        description: "Ultra-fast responses for high-volume tasks",
        inputPrice: 0.8,
        outputPrice: 4,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "200K"
    },
    {
        name: "Claude 3 Opus",
        version: "3.0",
        tier: "Premium",
        description: "Legacy premium model with strong performance",
        inputPrice: 15,
        outputPrice: 75,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "200K"
    },
    {
        name: "Claude 3 Sonnet",
        version: "3.0",
        tier: "Balanced",
        description: "Legacy balanced model",
        inputPrice: 3,
        outputPrice: 15,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "200K"
    },
    {
        name: "Claude 3 Haiku",
        version: "3.0",
        tier: "Fast",
        description: "Legacy fast model",
        inputPrice: 0.25,
        outputPrice: 1.25,
        cacheWriteMultiplier: 1.25,
        cacheReadMultiplier: 0.1,
        contextWindow: "200K"
    }
];