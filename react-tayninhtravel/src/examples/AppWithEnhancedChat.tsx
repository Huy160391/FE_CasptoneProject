import React from 'react';
import AIChatWrapper from '@/components/ChatBot';

const App: React.FC = () => {
    return (
        <div className="App">
            <h1>TNDT Travel Website</h1>
            <p>Nội dung website...</p>

            {/* Enhanced AI Chatbot */}
            <AIChatWrapper version="enhanced" />
        </div>
    );
};

export default App;
