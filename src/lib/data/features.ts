export interface SpecialFeature {
    name: string;
    price: string;
    description: string;
    iconName: string;
}

export const specialFeatures: SpecialFeature[] = [
    {
        name: "Web Search",
        price: "$10 per 1,000 searches",
        description: "Real-time web search capability",
        iconName: "Zap"
    },
    {
        name: "Code Execution",
        price: "$0.05 per session-hour",
        description: "Sandboxed code execution environment",
        iconName: "Cpu"
    },
    {
        name: "Batch API Discount",
        price: "50% off input & output",
        description: "Asynchronous processing discount",
        iconName: "TrendingDown"
    }
];
