# Frontend AI Chat Implementation Guide

## T?ng Quan
H? th?ng AI Chat h? tr? **3 lo?i chat chuy�n bi?t**:
1. **Tour Chat (Type = 1)** - T? v?n v? tours, gi� c?, ??t tour
2. **Product Chat (Type = 2)** - T? v?n mua s?m s?n ph?m ??c s?n
3. **TayNinh Chat (Type = 3)** - Th�ng tin v? l?ch s?, v?n h�a T�y Ninh

## Base URL & Authentication
```
Base URL: https://your-api-domain.com/api/AiChat
Authentication: Bearer Token (JWT) - Required cho t?t c? API tr? test
```

---

## 1. API Endpoints

### 1.1 T?o Phi�n Chat M?i
**Endpoint:** `POST /api/AiChat/sessions`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "chatType": 1,  // 1=Tour, 2=Product, 3=TayNinh
  "firstMessage": "T�i mu?n t�m tour N�i B� ?en",  // Optional
  "customTitle": "T? v?n tour N�i B� ?en"  // Optional
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "T?o phi�n chat th�nh c�ng",
  "statusCode": 201,
  "chatSession": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "[Tour] T? v?n tour N�i B� ?en",
    "status": "Active",
    "chatType": 1,
    "createdAt": "2024-12-15T10:00:00Z",
    "lastMessageAt": "2024-12-15T10:00:00Z",
    "messageCount": 0
  }
}
```

### 1.2 G?i Tin Nh?n
**Endpoint:** `POST /api/AiChat/messages`

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Tour n�o c� gi� r? nh?t?",
  "includeContext": true,  // Optional, default: true
  "contextMessageCount": 10  // Optional, default: 10
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "G?i tin nh?n th�nh c�ng",
  "statusCode": 200,
  "userMessage": {
    "id": "message-id-1",
    "content": "Tour n�o c� gi� r? nh?t?",
    "messageType": "User",
    "createdAt": "2024-12-15T10:05:00Z"
  },
  "aiResponse": {
    "id": "message-id-2",
    "content": "Hi?n t?i c� 3 tour gi� r?: 1. Tour N�i B� ?en - 150,000 VN?...",
    "messageType": "AI",
    "createdAt": "2024-12-15T10:05:02Z",
    "tokensUsed": 250,
    "responseTimeMs": 1500,
    "isFallback": false,
    "isError": false,
    "isTopicRedirect": false,
    "suggestedChatType": null
  },
  "tokensUsed": 250,
  "responseTimeMs": 1500,
  "isFallback": false,
  "requiresTopicRedirect": false,
  "suggestedChatType": null,
  "redirectSuggestion": null
}
```

**Response v?i Topic Redirect:**
```json
{
  "success": true,
  "message": "AI g?i � chuy?n sang lo?i chat ph� h?p h?n",
  "statusCode": 200,
  "userMessage": { /* ... */ },
  "aiResponse": {
    "id": "message-id-2",
    "content": "T�i th?y b?n quan t�m ??n s?n ph?m. ?? ???c t? v?n t?t nh?t, b?n n�n t?o phi�n Product Chat m?i.",
    "messageType": "AI",
    "createdAt": "2024-12-15T10:05:02Z",
    "isTopicRedirect": true,
    "suggestedChatType": 2
  },
  "requiresTopicRedirect": true,
  "suggestedChatType": 2,
  "redirectSuggestion": "?? ???c t? v?n s?n ph?m t?t nh?t, b?n n�n t?o phi�n 'Product Chat' m?i."
}
```

### 1.3 L?y Danh S�ch Phi�n Chat
**Endpoint:** `GET /api/AiChat/sessions`

**Query Parameters:**
```
page=0              // Optional, default: 0
pageSize=20         // Optional, default: 20  
status=Active       // Optional, default: "Active"
chatType=1          // Optional, filter by chat type
```

**Example:** `/api/AiChat/sessions?page=0&pageSize=10&chatType=1`

**Response:**
```json
{
  "success": true,
  "message": "L?y danh s�ch phi�n chat th�nh c�ng",
  "statusCode": 200,
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "[Tour] T? v?n tour N�i B� ?en",
      "status": "Active",
      "chatType": 1,
      "createdAt": "2024-12-15T10:00:00Z",
      "lastMessageAt": "2024-12-15T10:30:00Z",
      "messageCount": 6
    }
  ],
  "totalCount": 25,
  "currentPage": 0,
  "pageSize": 20
}
```

### 1.4 L?y Tin Nh?n Trong Phi�n
**Endpoint:** `GET /api/AiChat/sessions/{sessionId}/messages`

**Example:** `/api/AiChat/sessions/550e8400-e29b-41d4-a716-446655440000/messages`

**Response:**
```json
{
  "success": true,
  "message": "L?y tin nh?n th�nh c�ng",
  "statusCode": 200,
  "chatSession": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "[Tour] T? v?n tour N�i B� ?en",
    "status": "Active",
    "chatType": 1,
    "createdAt": "2024-12-15T10:00:00Z",
    "lastMessageAt": "2024-12-15T10:30:00Z",
    "messages": [
      {
        "id": "msg-1",
        "content": "T�i mu?n t�m tour N�i B� ?en",
        "messageType": "User",
        "createdAt": "2024-12-15T10:00:00Z"
      },
      {
        "id": "msg-2", 
        "content": "T�i c� th? gi�p b?n t�m tour N�i B� ?en. Hi?n c� 3 g�i tour...",
        "messageType": "AI",
        "createdAt": "2024-12-15T10:00:02Z",
        "tokensUsed": 180,
        "responseTimeMs": 1200,
        "isFallback": false,
        "isError": false,
        "isTopicRedirect": false
      }
    ]
  }
}
```

### 1.5 C�c API Kh�c
```javascript
// C?p nh?t ti�u ?? phi�n chat
PUT /api/AiChat/sessions/{sessionId}/title
Body: { "newTitle": "Ti�u ?? m?i" }

// L?u tr? phi�n chat
PUT /api/AiChat/sessions/{sessionId}/archive

// X�a phi�n chat
DELETE /api/AiChat/sessions/{sessionId}

// L?y th?ng k�
GET /api/AiChat/stats
```

---

## 2. Frontend Implementation

### 2.1 TypeScript Interfaces

```typescript
// Enums
export enum AIChatType {
  Tour = 1,
  Product = 2,
  TayNinh = 3
}

// API Request Types
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

// API Response Types
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
```

### 2.2 API Service Class

```typescript
class AIChatApiService {
  private baseUrl = 'https://your-api-domain.com/api/AiChat';
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async createChatSession(request: CreateChatSessionRequest): Promise<{success: boolean, chatSession?: ChatSession}> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return { success: false };
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });
      
      return await response.json();
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

  async getChatSessions(page = 0, pageSize = 20, chatType?: AIChatType): Promise<{
    success: boolean;
    sessions: ChatSession[];
    totalCount: number;
  }> {
    try {
      let url = `${this.baseUrl}/sessions?page=${page}&pageSize=${pageSize}`;
      if (chatType) {
        url += `&chatType=${chatType}`;
      }
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return { success: false, sessions: [], totalCount: 0 };
    }
  }

  async getMessages(sessionId: string): Promise<{
    success: boolean;
    chatSession?: {
      id: string;
      title: string;
      chatType: AIChatType;
      messages: ChatMessage[];
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/messages`, {
        headers: this.getAuthHeaders()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error getting messages:', error);
      return { success: false };
    }
  }
}

export const aiChatApi = new AIChatApiService();
```

### 2.3 React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { aiChatApi, AIChatType } from './api/AIChatApiService';

const AIChatComponent = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatType, setSelectedChatType] = useState(AIChatType.Tour);
  const [isLoading, setIsLoading] = useState(false);

  // L?y danh s�ch phi�n chat
  const loadSessions = async () => {
    const response = await aiChatApi.getChatSessions(0, 20);
    if (response.success) {
      setSessions(response.sessions);
    }
  };

  // T?o phi�n chat m?i
  const createNewSession = async (chatType, firstMessage) => {
    const response = await aiChatApi.createChatSession({
      chatType,
      firstMessage
    });
    
    if (response.success && response.chatSession) {
      setSessions(prev => [response.chatSession, ...prev]);
      setCurrentSession(response.chatSession);
      
      // N?u c� first message, load messages
      if (firstMessage) {
        await loadMessages(response.chatSession.id);
      }
    }
  };

  // Load tin nh?n c?a session
  const loadMessages = async (sessionId) => {
    const response = await aiChatApi.getMessages(sessionId);
    if (response.success && response.chatSession) {
      setMessages(response.chatSession.messages);
    }
  };

  // G?i tin nh?n
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;
    
    setIsLoading(true);
    const response = await aiChatApi.sendMessage({
      sessionId: currentSession.id,
      message: newMessage,
      includeContext: true,
      contextMessageCount: 10
    });
    
    if (response.success) {
      // Th�m tin nh?n user v� AI v�o danh s�ch
      setMessages(prev => [...prev, response.userMessage, response.aiResponse]);
      setNewMessage('');
      
      // X? l� topic redirect
      if (response.requiresTopicRedirect) {
        showRedirectDialog(response.suggestedChatType, response.redirectSuggestion);
      }
    }
    
    setIsLoading(false);
  };

  // Hi?n th? dialog g?i � chuy?n lo?i chat
  const showRedirectDialog = (suggestedType, suggestion) => {
    const confirmed = window.confirm(`${suggestion}\n\nB?n c� mu?n t?o phi�n chat m?i kh�ng?`);
    if (confirmed) {
      createNewSession(suggestedType, newMessage);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="ai-chat-container">
      {/* Chat Type Selector */}
      <div className="chat-type-selector">
        <h3>Ch?n lo?i chat:</h3>
        <div className="chat-type-buttons">
          <button 
            className={selectedChatType === AIChatType.Tour ? 'active' : ''}
            onClick={() => setSelectedChatType(AIChatType.Tour)}
          >
            ?? Tour Chat
          </button>
          <button 
            className={selectedChatType === AIChatType.Product ? 'active' : ''}
            onClick={() => setSelectedChatType(AIChatType.Product)}
          >
            ??? Product Chat
          </button>
          <button 
            className={selectedChatType === AIChatType.TayNinh ? 'active' : ''}
            onClick={() => setSelectedChatType(AIChatType.TayNinh)}
          >
            ??? TayNinh Chat
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="sessions-sidebar">
        <button onClick={() => createNewSession(selectedChatType)}>
          + T?o phi�n m?i
        </button>
        <div className="sessions-list">
          {sessions.map(session => (
            <div 
              key={session.id} 
              className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentSession(session);
                loadMessages(session.id);
              }}
            >
              <div className="session-title">{session.title}</div>
              <div className="session-type">
                {getChatTypeName(session.chatType)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {currentSession ? (
          <>
            <div className="messages-container">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.messageType.toLowerCase()}`}
                >
                  <div className="message-content">{message.content}</div>
                  {message.isTopicRedirect && (
                    <div className="redirect-notice">
                      ?? G?i �: C�u h?i n�y ph� h?p v?i {getChatTypeName(message.suggestedChatType)} h?n
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Message Input */}
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nh?p tin nh?n..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
              />
              <button 
                onClick={sendMessage}
                disabled={isLoading || !newMessage.trim()}
              >
                {isLoading ? '?ang g?i...' : 'G?i'}
              </button>
            </div>
          </>
        ) : (
          <div className="no-session">
            Ch?n phi�n chat ho?c t?o phi�n m?i ?? b?t ??u
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function
const getChatTypeName = (chatType) => {
  switch (chatType) {
    case AIChatType.Tour: return 'Tour Chat';
    case AIChatType.Product: return 'Product Chat';
    case AIChatType.TayNinh: return 'TayNinh Chat';
    default: return 'Unknown';
  }
};

export default AIChatComponent;
```

---

## 3. Styling Suggestions (CSS)

```css
.ai-chat-container {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.chat-type-selector {
  padding: 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.chat-type-buttons {
  display: flex;
  gap: 10px;
}

.chat-type-buttons button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.chat-type-buttons button.active {
  background: #007bff;
  color: white;
}

.sessions-sidebar {
  width: 300px;
  border-right: 1px solid #ddd;
  background: #fafafa;
}

.session-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.session-item:hover {
  background: #f0f0f0;
}

.session-item.active {
  background: #e3f2fd;
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin: 10px 0;
  padding: 12px;
  border-radius: 8px;
  max-width: 80%;
}

.message.user {
  background: #007bff;
  color: white;
  margin-left: auto;
}

.message.ai {
  background: #f1f1f1;
  color: #333;
}

.redirect-notice {
  margin-top: 8px;
  padding: 6px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  font-size: 0.9em;
}

.message-input {
  display: flex;
  padding: 20px;
  border-top: 1px solid #ddd;
  background: white;
}

.message-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.message-input button {
  margin-left: 10px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

---

## 4. L?u � Quan Tr?ng

### 4.1 Error Handling
- Lu�n check `success` field trong response
- Hi?n th? th�ng b�o l?i user-friendly
- Retry logic cho network errors
- Fallback UI khi AI kh�ng ph?n h?i

### 4.2 User Experience
- Loading states khi g?i message
- Auto-scroll to bottom khi c� tin nh?n m?i
- Keyboard shortcuts (Enter ?? g?i)
- Message timestamps hi?n th? r� r�ng

### 4.3 Performance
- Pagination cho messages c?
- Lazy loading sessions
- Debounce cho typing indicators
- Cache sessions ? localStorage

### 4.4 Topic Redirect Handling
- Hi?n th? r� r�ng khi AI suggest chuy?n chat type
- Confirm dialog tr??c khi t?o session m?i
- Keep context khi redirect
- Visual indicators cho redirect messages

---

## 5. Testing

### 5.1 API Testing v?i Postman/curl
```bash
# Test t?o session
curl -X POST "https://your-api.com/api/AiChat/sessions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chatType": 1, "firstMessage": "T�i mu?n t�m tour N�i B� ?en"}'

# Test g?i message
curl -X POST "https://your-api.com/api/AiChat/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "your-session-id", "message": "Tour n�o gi� r? nh?t?"}'
```

### 5.2 Test Scenarios
1. **Basic Flow:** T?o session ? G?i message ? Nh?n response
2. **Topic Redirect:** G?i c�u h?i kh�ng ?�ng chat type ? Nh?n redirect
3. **Context:** G?i nhi?u message li�n ti?p ? Ki?m tra context
4. **Error Handling:** Network error, invalid session, etc.

---

**Completed! ??** 

T�i li?u n�y bao g?m t?t c? th�ng tin c?n thi?t ?? Frontend team implement AI Chat v?i 3 lo?i chat type. M?i API ?� ???c document chi ti?t v?i examples v� c� s?n TypeScript interfaces cho type safety.