import React from 'react';
import CustomChatbot from './CustomChatbot';
import EnhancedChatbot from './EnhancedChatbot';

interface AIChatWrapperProps {
    version?: 'legacy' | 'enhanced';
}

/**
 * Wrapper component để lựa chọn phiên bản AI Chat
 * - legacy: Phiên bản cũ, đơn giản
 * - enhanced: Phiên bản mới với 3 loại chat, session management
 */
const AIChatWrapper: React.FC<AIChatWrapperProps> = ({ version = 'enhanced' }) => {
    if (version === 'legacy') {
        return <CustomChatbot useEnhanced={false} />;
    }

    return <EnhancedChatbot />;
};

export default AIChatWrapper;
