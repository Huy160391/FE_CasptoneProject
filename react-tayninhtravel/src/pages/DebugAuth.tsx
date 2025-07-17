import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const DebugAuth: React.FC = () => {
    const { user, isAuthenticated, token } = useAuthStore();
    const [localStorageData, setLocalStorageData] = useState<any>({});

    useEffect(() => {
        // Check localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        let parsedUser = null;
        if (storedUser) {
            try {
                parsedUser = JSON.parse(storedUser);
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }

        setLocalStorageData({
            storedToken,
            storedUser,
            parsedUser
        });

        // Log to console
        console.log('=== AUTH DEBUG ===');
        console.log('isAuthenticated:', isAuthenticated);
        console.log('user from store:', user);
        console.log('token from store:', token);
        console.log('localStorage token:', storedToken);
        console.log('localStorage user:', storedUser);
        console.log('parsed user:', parsedUser);
        console.log('==================');
    }, [user, isAuthenticated, token]);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Auth Debug</h1>
            
            <h2>Auth Store State:</h2>
            <pre style={{ background: '#f5f5f5', padding: '10px' }}>
                {JSON.stringify({
                    isAuthenticated,
                    user,
                    token: token ? `${token.substring(0, 20)}...` : null
                }, null, 2)}
            </pre>

            <h2>LocalStorage Data:</h2>
            <pre style={{ background: '#f5f5f5', padding: '10px' }}>
                {JSON.stringify({
                    storedToken: localStorageData.storedToken ? `${localStorageData.storedToken.substring(0, 20)}...` : null,
                    storedUser: localStorageData.storedUser,
                    parsedUser: localStorageData.parsedUser
                }, null, 2)}
            </pre>

            <h2>Current URL:</h2>
            <p>{window.location.href}</p>

            <h2>User Role Check:</h2>
            <p>Expected: "Tour Guide"</p>
            <p>Actual: "{user?.role || 'undefined'}"</p>
            <p>Match: {user?.role === 'Tour Guide' ? '✅ YES' : '❌ NO'}</p>

            <h2>Actions:</h2>
            <button onClick={() => {
                console.log('Current auth state:', { isAuthenticated, user, token });
                alert(`Auth: ${isAuthenticated}, Role: ${user?.role}`);
            }}>
                Log Auth State
            </button>
            
            <button onClick={() => {
                localStorage.clear();
                window.location.reload();
            }} style={{ marginLeft: '10px', background: 'red', color: 'white' }}>
                Clear Storage & Reload
            </button>
        </div>
    );
};

export default DebugAuth;
