import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Alert, Descriptions, Tag, Spin } from 'antd';
import { useAuthStore } from '@/store/useAuthStore';
import { getMyInvitations } from '@/services/tourguideService';

const { Title, Text, Paragraph } = Typography;

const TourGuideDebug: React.FC = () => {
    const { user, isAuthenticated, token } = useAuthStore();
    const [apiTest, setApiTest] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testAPI = async () => {
        setLoading(true);
        try {
            console.log('Testing API with token:', token);
            const response = await getMyInvitations();
            console.log('API Response:', response);
            setApiTest(response);
        } catch (error: any) {
            console.error('API Error:', error);
            setApiTest({
                success: false,
                error: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        } finally {
            setLoading(false);
        }
    };

    const checkLocalStorage = () => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('LocalStorage Check:');
        console.log('Token:', storedToken);
        console.log('User:', storedUser);
        
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                console.log('Parsed User Data:', userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    };

    useEffect(() => {
        checkLocalStorage();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Title level={2}>Tour Guide Debug Panel</Title>
            
            {/* Authentication Status */}
            <Card title="Authentication Status" style={{ marginBottom: '16px' }}>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Is Authenticated">
                        <Tag color={isAuthenticated ? 'green' : 'red'}>
                            {isAuthenticated ? 'Yes' : 'No'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="User Name">
                        {user?.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="User Email">
                        {user?.email || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="User Role">
                        <Tag color={user?.role === 'Tour Guide' ? 'green' : 'orange'}>
                            {user?.role || 'N/A'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Token">
                        {token ? (
                            <Text code style={{ fontSize: '10px' }}>
                                {token.substring(0, 50)}...
                            </Text>
                        ) : 'No token'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Role Check */}
            {user?.role !== 'Tour Guide' && (
                <Alert
                    message="Role Mismatch"
                    description={`Current user role is "${user?.role}" but "Tour Guide" is required to access invitation features.`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            )}

            {/* API Test */}
            <Card title="API Test" style={{ marginBottom: '16px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                        type="primary" 
                        onClick={testAPI} 
                        loading={loading}
                        disabled={!isAuthenticated}
                    >
                        Test Get My Invitations API
                    </Button>
                    
                    <Button onClick={checkLocalStorage}>
                        Check LocalStorage
                    </Button>

                    <Button
                        type="default"
                        onClick={() => window.location.href = '/tour-guide/invitations'}
                    >
                        Navigate to Invitations Page
                    </Button>

                    <Button
                        type="primary"
                        onClick={() => {
                            // Auto login as tour guide for testing
                            const loginData = {
                                email: 'tourguide1@example.com',
                                password: '12345678h@'
                            };
                            console.log('Auto login data:', loginData);
                            // You can implement auto login here if needed
                        }}
                    >
                        Auto Login as Tour Guide
                    </Button>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin size="large" />
                            <div>Testing API...</div>
                        </div>
                    )}

                    {apiTest && (
                        <Card size="small" title="API Test Result">
                            {apiTest.success ? (
                                <div>
                                    <Alert
                                        message="API Test Successful"
                                        type="success"
                                        showIcon
                                        style={{ marginBottom: '16px' }}
                                    />
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Status Code">
                                            {apiTest.statusCode || apiTest.data?.statusCode}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Message">
                                            {apiTest.message || apiTest.data?.message}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Invitations Count">
                                            {apiTest.data?.invitations?.length || 0}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Statistics">
                                            {apiTest.data?.statistics ? (
                                                <div>
                                                    <div>Total: {apiTest.data.statistics.totalInvitations}</div>
                                                    <div>Pending: {apiTest.data.statistics.pendingCount}</div>
                                                    <div>Accepted: {apiTest.data.statistics.acceptedCount}</div>
                                                    <div>Rejected: {apiTest.data.statistics.rejectedCount}</div>
                                                </div>
                                            ) : 'No statistics'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>
                            ) : (
                                <div>
                                    <Alert
                                        message="API Test Failed"
                                        description={apiTest.error || 'Unknown error'}
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: '16px' }}
                                    />
                                    {apiTest.status && (
                                        <div>
                                            <Text strong>HTTP Status: </Text>
                                            <Tag color="red">{apiTest.status}</Tag>
                                        </div>
                                    )}
                                    {apiTest.data && (
                                        <div style={{ marginTop: '8px' }}>
                                            <Text strong>Response Data:</Text>
                                            <pre style={{ 
                                                background: '#f5f5f5', 
                                                padding: '8px', 
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                overflow: 'auto'
                                            }}>
                                                {JSON.stringify(apiTest.data, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    )}
                </Space>
            </Card>

            {/* Environment Info */}
            <Card title="Environment Info" size="small">
                <Descriptions column={1} size="small">
                    <Descriptions.Item label="API Base URL">
                        {import.meta.env.VITE_API_URL || 'http://localhost:5267/api'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Current URL">
                        {window.location.href}
                    </Descriptions.Item>
                    <Descriptions.Item label="Environment">
                        {import.meta.env.MODE}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Instructions */}
            <Card title="Debug Instructions" size="small" style={{ marginTop: '16px' }}>
                <Paragraph>
                    <Text strong>To debug Tour Guide invitation issues:</Text>
                </Paragraph>
                <ol>
                    <li>Check if you are authenticated and have "Tour Guide" role</li>
                    <li>Test the API connection using the button above</li>
                    <li>Check browser console for detailed error messages</li>
                    <li>Verify the API base URL is correct</li>
                    <li>Make sure the backend server is running</li>
                </ol>
                
                <Paragraph style={{ marginTop: '16px' }}>
                    <Text strong>Common Issues:</Text>
                </Paragraph>
                <ul>
                    <li><Text code>401 Unauthorized</Text>: Token expired or invalid</li>
                    <li><Text code>403 Forbidden</Text>: Wrong user role</li>
                    <li><Text code>404 Not Found</Text>: API endpoint not available</li>
                    <li><Text code>500 Server Error</Text>: Backend server issue</li>
                </ul>
            </Card>
        </div>
    );
};

export default TourGuideDebug;
