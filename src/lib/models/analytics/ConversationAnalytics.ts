import type { DailyConversation } from "@/lib/types";
import { parseDurationToMinutes, formatDuration } from "@/lib/utils/formatters";

export interface ConversationTotals {
    totalMessages: number;
    totalSessions: number;
    totalDurationMinutes: number;
    formattedDuration: string;
}

export class ConversationAnalytics {
    private conversations: DailyConversation[];

    constructor(conversations: DailyConversation[]) {
        this.conversations = conversations;
    }

    get totals(): ConversationTotals {
        const totals = this.conversations.reduce(
            (acc, conversation) => {
                acc.totalMessages += conversation.messages;
                acc.totalSessions += conversation.sessions;
                acc.totalDurationMinutes += parseDurationToMinutes(conversation.conversationTime);
                return acc;
            },
            { totalMessages: 0, totalSessions: 0, totalDurationMinutes: 0 }
        );

        return {
            ...totals,
            formattedDuration: formatDuration(totals.totalDurationMinutes)
        };
    }
}