import React, { useState, useEffect, useRef } from 'react';
import {
    SendOutlined,
    MessageOutlined,
    CloseOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined
} from '@ant-design/icons';
import './EnhancedChatbot.scss';
import { aiChatApi } from '@/services/chatbotService';
import { AIChatType, ChatSession, ChatMessage, CreateChatSessionRequest, SendMessageRequest } from '@/types/aiChat';
import { useThemeStore } from '@/store/useThemeStore';
import { useTranslation } from 'react-i18next';

const EnhancedChatbot: React.FC = () => {
    const { isDarkMode } = useThemeStore();
    const { t } = useTranslation();

    // States
    const [visible, setVisible] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedChatType, setSelectedChatType] = useState<AIChatType>(AIChatType.Tour);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSessionList, setShowSessionList] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
    const [sessionToEdit, setSessionToEdit] = useState<ChatSession | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [isCreatingSession, setIsCreatingSession] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle click outside to close chat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (visible && chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
                // Check if click is not on the FAB button
                const fabButton = document.querySelector('.enhanced-chatbot-fab');
                if (fabButton && !fabButton.contains(event.target as Node)) {
                    setVisible(false);
                }
            }
        };

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible]);

    // Handle click outside to close sidebar
    useEffect(() => {
        const handleSidebarClickOutside = (event: MouseEvent) => {
            if (showSessionList && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                // Check if click is not on the session list button
                const sessionListBtn = document.querySelector('.session-list-btn');
                if (sessionListBtn && !sessionListBtn.contains(event.target as Node)) {
                    setShowSessionList(false);
                }
            }
        };

        if (showSessionList) {
            document.addEventListener('mousedown', handleSidebarClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleSidebarClickOutside);
        };
    }, [showSessionList]);

    // Get token helper
    const getToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    // Load sessions on mount
    useEffect(() => {
        if (visible) {
            loadSessions();
        }
    }, [visible]);

    // Load chat sessions - theo document
    const loadSessions = async () => {
        const token = getToken();
        if (!token) {
            setError(t('chatbot.errors.loginRequired'));
            return;
        }

        try {
            const response = await aiChatApi.getChatSessions(0, 50, undefined, token);
            if (response.success && response.sessions) {
                setSessions(response.sessions);
            } else {
                console.error('Failed to load sessions:', response.message);
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
            setError(t('chatbot.errors.cannotLoadSessions'));
        }
    };

    // Create new session - theo document với firstMessage
    const createNewSession = async (chatType: AIChatType, firstMessage?: string) => {
        const token = getToken();
        if (!token) {
            setError(t('chatbot.errors.loginRequired'));
            return;
        }

        setIsCreatingSession(true);
        setError(null);

        try {
            const request: CreateChatSessionRequest = {
                chatType,
                customTitle: getChatTypeName(chatType)
            };

            if (firstMessage?.trim()) {
                request.firstMessage = firstMessage.trim();
            }

            const response = await aiChatApi.createChatSession(request, token);

            if (response.success && response.chatSession) {
                const newSession = response.chatSession;
                setSessions(prev => [newSession, ...prev]);
                setCurrentSession(newSession);

                // Load messages if there was a first message
                if (firstMessage?.trim()) {
                    await loadMessages(newSession.id);
                } else {
                    setMessages([]);
                }

                setNewMessage('');
            } else {
                setError(t('chatbot.errors.cannotCreateSession'));
            }
        } catch (error) {
            console.error('Error creating session:', error);
            setError(t('chatbot.errors.createSessionError'));
        } finally {
            setIsCreatingSession(false);
        }
    };

    // Load messages for a session - theo document
    const loadMessages = async (sessionId: string) => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await aiChatApi.getMessages(sessionId, token);
            if (response.success && response.chatSession) {
                setMessages(response.chatSession.messages || []);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    // Send message - theo document với topic redirect handling
    const sendMessage = async () => {
        if (!newMessage.trim() || !currentSession || isLoading) return;

        const token = getToken();
        if (!token) {
            setError(t('chatbot.errors.loginRequired'));
            return;
        }

        const messageContent = newMessage.trim();
        setNewMessage('');
        setIsLoading(true);
        setError(null);

        try {
            const request: SendMessageRequest = {
                sessionId: currentSession.id,
                message: messageContent,
                includeContext: true,
                contextMessageCount: 10
            };

            const response = await aiChatApi.sendMessage(request, token);

            if (response.success) {
                // Add both user message and AI response
                const newMessages: ChatMessage[] = [];
                if (response.userMessage) {
                    newMessages.push(response.userMessage);
                }
                if (response.aiResponse) {
                    newMessages.push(response.aiResponse);
                }

                setMessages(prev => [...prev, ...newMessages]);

                // Handle topic redirect
                if (response.requiresTopicRedirect && response.suggestedChatType && response.redirectSuggestion) {
                    handleTopicRedirect(response.suggestedChatType, response.redirectSuggestion, messageContent);
                }
            } else {
                setError(t('chatbot.errors.cannotSendMessage'));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setError(t('chatbot.errors.sendMessageError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle topic redirect - theo document
    const handleTopicRedirect = (suggestedType: AIChatType, suggestion: string, originalMessage: string) => {
        const confirmed = window.confirm(t('chatbot.topicRedirect.confirmMessage', { suggestion }));
        if (confirmed) {
            createNewSession(suggestedType, originalMessage);
        }
    };

    // Delete session
    const handleDeleteSession = async () => {
        if (!sessionToDelete) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await aiChatApi.deleteSession(sessionToDelete.id, token);
            if (response.success) {
                setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));

                if (currentSession?.id === sessionToDelete.id) {
                    setCurrentSession(null);
                    setMessages([]);
                }

                setShowDeleteModal(false);
                setSessionToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    // Update session title
    const handleUpdateSessionTitle = async () => {
        if (!sessionToEdit || !editTitle.trim()) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await aiChatApi.updateSessionTitle(sessionToEdit.id, editTitle.trim(), token);
            if (response.success) {
                setSessions(prev => prev.map(s =>
                    s.id === sessionToEdit.id
                        ? { ...s, title: editTitle.trim() }
                        : s
                ));

                if (currentSession?.id === sessionToEdit.id) {
                    setCurrentSession(prev => prev ? { ...prev, title: editTitle.trim() } : null);
                }

                setShowEditModal(false);
                setSessionToEdit(null);
                setEditTitle('');
            }
        } catch (error) {
            console.error('Error updating session title:', error);
        }
    };

    // Modal handlers
    const openDeleteModal = (session: ChatSession) => {
        setSessionToDelete(session);
        setShowDeleteModal(true);
    };

    const openEditModal = (session: ChatSession) => {
        setSessionToEdit(session);
        setEditTitle(session.title);
        setShowEditModal(true);
    };

    // Select session and load messages
    const selectSession = async (session: ChatSession) => {
        setCurrentSession(session);
        setShowSessionList(false);
        await loadMessages(session.id);
    };

    // Get chat type name helper
    const getChatTypeName = (chatType: AIChatType): string => {
        switch (chatType) {
            case AIChatType.Tour: return t('chatbot.chatTypes.tour');
            case AIChatType.Product: return t('chatbot.chatTypes.product');
            case AIChatType.TayNinh: return t('chatbot.chatTypes.tayninh');
            default: return t('chatbot.chatTypes.default');
        }
    };

    // Get chat type icon
    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (currentSession) {
                sendMessage();
            } else {
                createNewSession(selectedChatType, newMessage);
            }
        }
    };

    return (
        <div className={`enhanced-chatbot ${isDarkMode ? 'dark-mode' : ''}`}>
            {/* Chat Button */}
            <div
                className="enhanced-chatbot-fab"
                onClick={() => setVisible(!visible)}
            >
                <MessageOutlined />
            </div>

            {/* Chat Window */}
            {visible && (
                <div className="enhanced-chatbot-window" ref={chatWindowRef}>
                    {/* Header */}
                    <div className="enhanced-chatbot-header">
                        <div className="header-left">
                            <button
                                className="session-list-btn"
                                onClick={() => setShowSessionList(!showSessionList)}
                                title={t('chatbot.tooltips.sessionHistory')}
                            >
                                ☰
                            </button>
                            <div className="header-title">
                                {currentSession ? currentSession.title : t('chatbot.title')}
                            </div>
                        </div>
                        <div className="header-right">
                            <button
                                className="new-session-btn"
                                onClick={() => {
                                    setCurrentSession(null);
                                    setMessages([]);
                                    setShowSessionList(false);
                                }}
                                title={t('chatbot.tooltips.newChat')}
                            >
                                <PlusOutlined />
                            </button>
                            <button
                                className="close-btn"
                                onClick={() => setVisible(false)}
                                title={t('chatbot.tooltips.closeChat')}
                            >
                                <CloseOutlined />
                            </button>
                        </div>
                    </div>

                    {/* Session List */}
                    {showSessionList && (
                        <div className="sessions-sidebar" ref={sidebarRef}>
                            <div className="sessions-header">
                                <h4>{t('chatbot.sessions.history')}</h4>
                                <button onClick={() => setShowSessionList(false)}>×</button>
                            </div>
                            <div className="sessions-list">
                                {sessions.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--chatbot-text-secondary)' }}>
                                        {t('chatbot.sessions.noSessions')}
                                    </div>
                                ) : (
                                    sessions.map(session => (
                                        <div
                                            key={session.id}
                                            className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                                            onClick={() => selectSession(session)}
                                        >
                                            <div className="session-content">
                                                <div className="session-title">
                                                    {getChatTypeName(session.chatType)} - {session.title}
                                                </div>
                                                <div className="session-meta">
                                                    {formatTimestamp(session.lastMessageAt || session.createdAt)}
                                                </div>
                                            </div>
                                            <div className="session-actions">
                                                <button
                                                    className="edit-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(session);
                                                    }}
                                                    title={t('chatbot.tooltips.rename')}
                                                >
                                                    <EditOutlined />
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal(session);
                                                    }}
                                                    title={t('chatbot.tooltips.delete')}
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chat Type Selector */}
                    {!currentSession && (
                        <div className="chat-type-selector">
                            <div className="selector-header">
                                <h3>{t('chatbot.chatTypes.selectType')}</h3>
                            </div>
                            <div className="chat-type-buttons">
                                {Object.values(AIChatType).filter(type => typeof type === 'number').map(type => (
                                    <button
                                        key={type}
                                        className={selectedChatType === type ? 'active' : ''}
                                        onClick={() => setSelectedChatType(type as AIChatType)}
                                    >
                                        {getChatTypeName(type as AIChatType)}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="create-new-btn"
                                onClick={() => createNewSession(selectedChatType)}
                                disabled={isCreatingSession}
                            >
                                {isCreatingSession ? t('chatbot.actions.creating') : t('chatbot.actions.startChat', { type: getChatTypeName(selectedChatType) })}
                            </button>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="enhanced-chatbot-messages">
                        {error && (
                            <div style={{
                                background: 'var(--chatbot-danger)',
                                color: 'white',
                                padding: '12px',
                                margin: '16px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                {error}
                                <button
                                    onClick={() => setError(null)}
                                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {!currentSession && !error && (
                            <div className="no-session">
                                <div className="no-session-icon">💬</div>
                                <h4>{t('chatbot.welcome.title')}</h4>
                                <p>{t('chatbot.welcome.instructions')}</p>
                                <ol>
                                    <li>{t('chatbot.welcome.steps.selectType')}</li>
                                    <li>{t('chatbot.welcome.steps.startChat')}</li>
                                    <li>{t('chatbot.welcome.steps.languageNote')}</li>
                                </ol>
                                <div className="chat-type-descriptions">
                                    <div className="type-desc">
                                        <span className="icon">🎯</span>
                                        <strong>{t('chatbot.chatTypes.tour')}:</strong> {t('chatbot.chatTypes.descriptions.tour')}
                                    </div>
                                    <div className="type-desc">
                                        <span className="icon">🛍️</span>
                                        <strong>{t('chatbot.chatTypes.product')}:</strong> {t('chatbot.chatTypes.descriptions.product')}
                                    </div>
                                    <div className="type-desc">
                                        <span className="icon">🏛️</span>
                                        <strong>{t('chatbot.chatTypes.tayninh')}:</strong> {t('chatbot.chatTypes.descriptions.tayninh')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSession && messages.length === 0 && !isLoading && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--chatbot-text-secondary)' }}>
                                <h4 style={{ color: 'var(--chatbot-text)', marginBottom: '8px' }}>
                                    {t('chatbot.conversation.startTitle')}
                                </h4>
                                <p style={{ margin: 0 }}>
                                    {t('chatbot.conversation.startMessage')}
                                </p>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.messageType === 'User' ? 'user' : 'ai'}`}
                            >
                                <div className="message-content">
                                    {message.content}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--chatbot-text-secondary)', marginTop: '4px' }}>
                                    {formatTimestamp(message.createdAt)}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message ai">
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="enhanced-chatbot-input-area">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={
                                    currentSession
                                        ? t('chatbot.placeholders.typeMessage')
                                        : t('chatbot.placeholders.startChatMessage', { type: getChatTypeName(selectedChatType) })
                                }
                                disabled={isLoading || isCreatingSession}
                            />
                            <button
                                onClick={currentSession ? sendMessage : () => createNewSession(selectedChatType, newMessage)}
                                disabled={!newMessage.trim() || isLoading || isCreatingSession}
                                className="send-btn"
                                title={currentSession ? t('chatbot.tooltips.sendMessage') : t('chatbot.tooltips.startChat')}
                            >
                                <SendOutlined />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && sessionToDelete && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{t('chatbot.sessions.delete')}</h3>
                        <p>
                            {t('chatbot.sessions.deleteConfirm', { title: sessionToDelete.title })}
                        </p>
                        <p>{t('chatbot.sessions.deleteWarning')}</p>
                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                {t('chatbot.actions.cancel')}
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleDeleteSession}
                            >
                                {t('chatbot.actions.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && sessionToEdit && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{t('chatbot.sessions.edit')}</h3>
                        <p>{t('chatbot.sessions.editPrompt')}</p>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder={t('chatbot.sessions.editPlaceholder')}
                            autoFocus
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleUpdateSessionTitle();
                                }
                            }}
                        />
                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowEditModal(false)}
                            >
                                {t('chatbot.actions.cancel')}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleUpdateSessionTitle}
                                disabled={!editTitle.trim()}
                            >
                                {t('chatbot.actions.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedChatbot;
