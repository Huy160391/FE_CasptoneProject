import axios from '@/config/axios';

/**
 * Tạo session chat mới qua API
 * @param firstMessage string
 * @param customTitle string
 * @param token Bearer token
 * @returns Promise<{ sessionId: string }>
 */
export const createChatSession = async (
    firstMessage: string,
    customTitle: string,
    token: string
): Promise<{ sessionId: string }> => {
    const res = await axios.post(
        '/AIchat/sessions',
        {
            firstMessage,
            customTitle
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    if (res.data && res.data.chatSession && res.data.chatSession.id) {
        return { sessionId: res.data.chatSession.id };
    }
    throw new Error('Không thể tạo session chat');
};

/**
 * Gửi tin nhắn tới bot qua API
 * @param sessionId string
 * @param message string
 * @param token Bearer token
 * @param includeContext boolean (default true)
 * @param contextMessageCount number (default 0)
 * @returns Promise<{ reply: string }>
 */
export const sendMessage = async (
    sessionId: string,
    message: string,
    token: string,
    includeContext: boolean = true,
    contextMessageCount: number = 0
): Promise<{ reply: string }> => {
    const res = await axios.post(
        '/AIchat/messages',
        {
            sessionId,
            message,
            includeContext,
            contextMessageCount
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    if (res.data && res.data.aiResponse && res.data.aiResponse.content) {
        return { reply: res.data.aiResponse.content };
    }
    throw new Error('Không nhận được phản hồi từ AI');
};
