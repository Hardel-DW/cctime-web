export interface SessionData {
    sessionId: string;
    start: Date;
    end: Date;
    messageCount: number;
    project?: string;
}

export interface DaySession {
    date: string;
    sessions: SessionData[];
    totalMessages: number;
    totalTime: string;
}

export interface MessageData {
    timestamp: string;
    role: "user" | "assistant";
    content: string;
    tokens?: {
        input?: number;
        output?: number;
        cache_creation?: number;
        cache_read?: number;
    };
    model?: string;
}

export interface SessionDetailsData {
    sessionId: string;
    start: Date;
    end: Date;
    duration: string;
    messageCount: number;
    project: string;
    models: string[];
    totalTokens: {
        input: number;
        output: number;
        cacheCreation: number;
        cacheRead: number;
        total: number;
    };
    messages: MessageData[];
}
