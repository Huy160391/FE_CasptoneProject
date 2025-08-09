import React from 'react';
import EnhancedChatbot from '@/components/ChatBot/EnhancedChatbot';

const TestChatbot: React.FC = () => {
    return (
        <div style={{
            height: '100vh',
            padding: '20px',
            background: '#f5f5f5'
        }}>
            <h1>Test Enhanced Chatbot</h1>
            <p>Click vào button chatbot ở góc dưới phải để test các tính năng:</p>

            <ul>
                <li>✅ Chọn chat type trước khi tạo session</li>
                <li>✅ Tạo nhiều phiên chat</li>
                <li>✅ Popup custom để xóa phiên chat</li>
                <li>✅ Popup custom để sửa tên phiên chat</li>
                <li>✅ Switch giữa các phiên chat</li>
                <li>✅ Session management với sidebar</li>
            </ul>

            <EnhancedChatbot />
        </div>
    );
};

export default TestChatbot;
