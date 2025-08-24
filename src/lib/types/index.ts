// ===== CORE DATA TYPES =====
// These are the fundamental data structures from the JSONL files

export interface UsageStats {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
    service_tier?: string;
    cache_creation?: {
        ephemeral_5m_input_tokens?: number;
        ephemeral_1h_input_tokens?: number;
    };
}

export interface UsageData {
    timestamp?: string;
    cwd?: string;
    message?: {
        content?: Array<{
            type?: string;
            text?: string;
        }>;
        role?: string;
        usage?: UsageStats;
        model?: string;
    };
    costUSD?: number;
    sessionId?: string;
    isApiErrorMessage?: boolean;
}

// ===== LEGACY DASHBOARD TYPES =====
// These are for the existing dashboard components that haven't been migrated yet

export interface DailyConversation {
    date: string;
    firstMessage: Date;
    lastMessage: Date;
    conversationTime: string;
    messages: number;
    sessions: number;
    sessionIds: string[];
}

export interface HourlyActivity {
    hour: number;
    messageCount: number;
    totalTime: number; // in minutes
}

export interface ProjectActivity {
    projectName: string;
    messageCount: number;
    conversationTime: number; // in minutes
    sessionCount: number;
}

export interface SessionDetail {
    start: Date;
    end: Date;
    duration: number; // in minutes
    messageCount: number;
    project?: string;
}

export interface UserToUserGap {
    gap: number; // in minutes
    timestamp: Date;
    project?: string;
}

export interface DashboardData {
    conversations: DailyConversation[];
    allEntries: UsageData[];
    hourlyActivity: HourlyActivity[];
    projectActivity: ProjectActivity[];
    sessionDetails: SessionDetail[];
    userGaps: UserToUserGap[];
    totalStats: {
        activeDays: number;
        totalMessages: number;
        totalSessions: number;
        avgMessagesPerDay: number;
        totalConversationTime: string;
    };
}
