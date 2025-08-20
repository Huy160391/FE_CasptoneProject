// AI Chat Types theo document mới

export enum AIChatType {
    Tour = 1,
    Product = 2,
    TayNinh = 3
}

export interface CreateChatSessionRequest {
    chatType: AIChatType;
    firstMessage?: string;
    customTitle?: string;
}

export interface SendMessageRequest {
    sessionId: string;
    message: string;
    includeContext?: boolean;
    contextMessageCount?: number;
}

export interface ChatSession {
    id: string;
    title: string;
    status: string;
    chatType: AIChatType;
    createdAt: string;
    lastMessageAt: string;
    messageCount: number;
}

export interface ChatMessage {
    id: string;
    content: string;
    messageType: 'User' | 'AI';
    createdAt: string;
    tokensUsed?: number;
    responseTimeMs?: number;
    isFallback?: boolean;
    isError?: boolean;
    isTopicRedirect?: boolean;
    suggestedChatType?: AIChatType;
}

export interface SendMessageResponse {
    success: boolean;
    message: string;
    statusCode: number;
    userMessage: ChatMessage;
    aiResponse: ChatMessage;
    tokensUsed: number;
    responseTimeMs: number;
    isFallback: boolean;
    requiresTopicRedirect: boolean;
    suggestedChatType?: AIChatType;
    redirectSuggestion?: string;
}

export interface GetSessionsResponse {
    success: boolean;
    message: string;
    statusCode: number;
    sessions: ChatSession[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
}

export interface GetMessagesResponse {
    success: boolean;
    message: string;
    statusCode: number;
    chatSession: {
        id: string;
        title: string;
        status: string;
        chatType: AIChatType;
        createdAt: string;
        lastMessageAt: string;
        messages: ChatMessage[];
    };
}
