import axios from '@/config/axios';
import {
    AIChatType,
    CreateChatSessionRequest,
    SendMessageRequest,
    SendMessageResponse,
    GetSessionsResponse,
    GetMessagesResponse,
    ChatSession
} from '@/types/aiChat';

class AIChatApiService {
    private baseUrl = '/AiChat';

    private getAuthHeaders(token: string) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async createChatSession(request: CreateChatSessionRequest, token: string): Promise<{ success: boolean, chatSession?: ChatSession }> {
        try {
            const response = await axios.post(`${this.baseUrl}/sessions`, request, {
                headers: this.getAuthHeaders(token)
            });

            return response.data;
        } catch (error) {
            console.error('Error creating chat session:', error);
            return { success: false };
        }
    }

    async sendMessage(request: SendMessageRequest, token: string): Promise<SendMessageResponse> {
        try {
            const response = await axios.post(`${this.baseUrl}/messages`, request, {
                headers: this.getAuthHeaders(token)
            });

            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                success: false,
                message: 'Network error',
                statusCode: 500,
                userMessage: null as any,
                aiResponse: null as any,
                tokensUsed: 0,
                responseTimeMs: 0,
                isFallback: false,
                requiresTopicRedirect: false
            };
        }
    }

    async getChatSessions(page = 0, pageSize = 20, chatType?: AIChatType, token?: string): Promise<GetSessionsResponse> {
        try {
            let url = `${this.baseUrl}/sessions?page=${page}&pageSize=${pageSize}`;
            if (chatType) {
                url += `&chatType=${chatType}`;
            }

            const response = await axios.get(url, {
                headers: this.getAuthHeaders(token || '')
            });

            return response.data;
        } catch (error) {
            console.error('Error getting chat sessions:', error);
            return {
                success: false,
                sessions: [],
                totalCount: 0,
                currentPage: 0,
                pageSize: 0,
                message: 'Error getting sessions',
                statusCode: 500
            };
        }
    }

    async getMessages(sessionId: string, token: string): Promise<GetMessagesResponse> {
        try {
            const response = await axios.get(`${this.baseUrl}/sessions/${sessionId}/messages`, {
                headers: this.getAuthHeaders(token)
            });

            return response.data;
        } catch (error) {
            console.error('Error getting messages:', error);
            return {
                success: false,
                message: 'Error getting messages',
                statusCode: 500,
                chatSession: null as any
            };
        }
    }

    async updateSessionTitle(sessionId: string, newTitle: string, token: string): Promise<{ success: boolean }> {
        try {
            const response = await axios.put(`${this.baseUrl}/sessions/${sessionId}/title`,
                { newTitle },
                { headers: this.getAuthHeaders(token) }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating session title:', error);
            return { success: false };
        }
    }

    async archiveSession(sessionId: string, token: string): Promise<{ success: boolean }> {
        try {
            const response = await axios.put(`${this.baseUrl}/sessions/${sessionId}/archive`, {}, {
                headers: this.getAuthHeaders(token)
            });
            return response.data;
        } catch (error) {
            console.error('Error archiving session:', error);
            return { success: false };
        }
    }

    async deleteSession(sessionId: string, token: string): Promise<{ success: boolean }> {
        try {
            const response = await axios.delete(`${this.baseUrl}/sessions/${sessionId}`, {
                headers: this.getAuthHeaders(token)
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting session:', error);
            return { success: false };
        }
    }
}

export const aiChatApi = new AIChatApiService();

// Legacy functions for backward compatibility
/**
 * @deprecated Use aiChatApi.createChatSession instead
 */
export const createChatSession = async (
    firstMessage: string,
    customTitle: string,
    token: string
): Promise<{ sessionId: string }> => {
    const response = await aiChatApi.createChatSession({
        chatType: AIChatType.Tour, // Default to Tour chat
        firstMessage,
        customTitle
    }, token);

    if (response.success && response.chatSession) {
        return { sessionId: response.chatSession.id };
    }
    throw new Error('Không thể tạo session chat');
};

/**
 * @deprecated Use aiChatApi.sendMessage instead
 */
export const sendMessage = async (
    sessionId: string,
    message: string,
    token: string,
    includeContext: boolean = true,
    contextMessageCount: number = 10
): Promise<{ reply: string }> => {
    const response = await aiChatApi.sendMessage({
        sessionId,
        message,
        includeContext,
        contextMessageCount
    }, token);

    if (response.success && response.aiResponse && response.aiResponse.content) {
        return { reply: response.aiResponse.content };
    }
    throw new Error('Không nhận được phản hồi từ AI');
};
