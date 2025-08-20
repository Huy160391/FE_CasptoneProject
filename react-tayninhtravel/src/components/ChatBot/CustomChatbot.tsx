

import React, { useRef, useState } from 'react';
import { SendOutlined, MessageOutlined, CloseOutlined } from '@ant-design/icons';
import './CustomChatbot.scss';
import { createChatSession, sendMessage } from '@/services/chatbotService';
import { useTranslation } from 'react-i18next';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

interface CustomChatbotProps {
    useEnhanced?: boolean; // Prop để chọn phiên bản Enhanced
}

const CustomChatbot: React.FC<CustomChatbotProps> = ({ useEnhanced = false }) => {
    const { t, i18n } = useTranslation();

    // Nếu sử dụng Enhanced version, import và render component đó
    if (useEnhanced) {
        const EnhancedChatbot = React.lazy(() => import('./EnhancedChatbot'));
        return (
            <React.Suspense fallback={<div>Loading...</div>}>
                <EnhancedChatbot />
            </React.Suspense>
        );
    }

    // Code của phiên bản cũ (legacy)
    const [visible, setVisible] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => [{ sender: 'bot', text: t('chatbot.greeting') }]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);

    // (Đã khai báo phía trên, không cần lặp lại)


    // Cập nhật lại lời chào khi đổi ngôn ngữ nếu chưa chat gì thêm
    React.useEffect(() => {
        if (messages.length === 1 && messages[0].sender === 'bot') {
            setMessages([{ sender: 'bot', text: t('chatbot.greeting') }]);
            if (sessionId) setSessionId(null);
        }
    }, [i18n.language, sessionId, messages.length, messages[0]?.sender]);
    // ...existing code...

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Lấy token từ localStorage (hoặc context, store...)
    const getToken = () => localStorage.getItem('token') || '';

    // Tạo session khi mở chat lần đầu
    const handleOpen = async () => {
        setError(null);
        const token = getToken();
        if (!token) {
            setError(t('chatbot.error.login', 'Bạn cần đăng nhập để sử dụng chat.'));
            return;
        }
        setVisible(true);
        // Chỉ tạo session nếu chưa có
        if (!sessionId) {
            setLoading(true);
            try {
                const res = await createChatSession(t('chatbot.greeting'), 'Hỗ trợ AI', token);
                setSessionId(res.sessionId);
                // Không set lại messages ở đây, để useEffect và useState khởi tạo lo
            } catch (e: any) {
                setError(t('chatbot.error.init', 'Không thể khởi tạo phiên chat.'));
            } finally {
                setLoading(false);
            }
        }
    };

    // Gửi tin nhắn qua API
    const handleSend = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setError(null);
        try {
            let currentSessionId = sessionId;
            const token = getToken();
            // Nếu chưa có sessionId (vừa đổi ngôn ngữ hoặc lần đầu), tạo session mới
            if (!currentSessionId) {
                const res = await createChatSession(t('chatbot.greeting'), 'Hỗ trợ AI', token);
                currentSessionId = res.sessionId;
                setSessionId(res.sessionId);
                // Nếu là lần đầu chat, cập nhật lại greeting đúng ngôn ngữ
                setMessages([{ sender: 'bot', text: t('chatbot.greeting') }]);
            }
            setMessages(prev => [...prev, { sender: 'user', text: input }]);
            setInput('');
            const resMsg = await sendMessage(currentSessionId, input, token);
            setMessages(prev => [...prev, { sender: 'bot', text: resMsg.reply }]);
        } catch (e: any) {
            setMessages(prev => [...prev, { sender: 'bot', text: t('chatbot.error.send', 'Xin lỗi, có lỗi khi gửi tin nhắn.') }]);
            setError(t('chatbot.error.send', 'Gửi tin nhắn thất bại.'));
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (visible && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, visible]);

    // Ref cho vùng chat bot
    const chatWindowRef = useRef<HTMLDivElement>(null);

    // Đóng chatbot khi click ra ngoài, KHÔNG reset session/messages
    React.useEffect(() => {
        if (!visible) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
                setVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [visible]);

    return (
        <>
            {!visible && (
                <button className="custom-chatbot-fab" onClick={handleOpen}>
                    <MessageOutlined style={{ fontSize: 24 }} />
                </button>
            )}
            {visible && (
                <div className="custom-chatbot-window" ref={chatWindowRef}>
                    <div className="custom-chatbot-header">
                        <span>TNDT Chatbot</span>
                        <button className="custom-chatbot-close" onClick={() => setVisible(false)}>
                            <CloseOutlined />
                        </button>
                    </div>
                    <div className="custom-chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`custom-chatbot-message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="custom-chatbot-message bot">
                                <span className="custom-chatbot-typing">
                                    <span className="dot">.</span>
                                    <span className="dot">.</span>
                                    <span className="dot">.</span>
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="custom-chatbot-input-row">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={loading ? t('common.loading', 'Đang xử lý...') : t('chatbot.inputPlaceholder')}
                            className="custom-chatbot-input"
                            disabled={loading}
                        />
                        <button className="custom-chatbot-send" onClick={handleSend} disabled={loading || !sessionId}>
                            <SendOutlined />
                        </button>
                    </div>
                    {error && <div className="custom-chatbot-error">{error}</div>}
                </div>
            )}
        </>
    );
};

export default CustomChatbot;
