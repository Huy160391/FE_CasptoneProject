import React, { useState } from 'react';
import {
    Card,
    Button,
    Space,
    Divider,
    Typography,
    Alert,
    Collapse,
    Tag
} from 'antd';
import {
    testApiConnection,
    testTourTemplateEndpoints,
    logApiConfig
} from '../../utils/apiTest';
import {
    getTourTemplates,
    createTourDetails,
    getTourDetailsList,
    getSpecialtyShops,
    createTimelineItems
} from '../../services/tourcompanyService';
import { useAuthStore } from '../../store/useAuthStore';
import TemplatesTester from './TemplatesTester';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const ApiTester: React.FC = () => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const addResult = (test: string, success: boolean, data?: any, error?: any) => {
        const result = {
            test,
            success,
            data,
            error,
            timestamp: new Date().toLocaleTimeString()
        };
        setResults(prev => [result, ...prev]);
    };

    const testConnection = async () => {
        setLoading(true);
        try {
            logApiConfig();
            const success = await testApiConnection();
            addResult('API Connection Test', success);
        } catch (error) {
            addResult('API Connection Test', false, null, error);
        } finally {
            setLoading(false);
        }
    };

    const testTourTemplates = async () => {
        setLoading(true);
        try {
            await testTourTemplateEndpoints();
            const response = await getTourTemplates({}, token ?? undefined);
            addResult('TourTemplate Endpoints', response.success || false, response.data, response);
        } catch (error) {
            addResult('TourTemplate Endpoints', false, null, error);
        } finally {
            setLoading(false);
        }
    };

    const testTourDetails = async () => {
        setLoading(true);
        try {
            // First get templates to use one for creating details
            const templatesResponse = await getTourTemplates({}, token ?? undefined);
            if (!templatesResponse.success || !templatesResponse.data?.length) {
                addResult('TourDetails Test', false, null, 'No templates available for testing');
                return;
            }

            const templateId = templatesResponse.data[0].id;

            // Test create tour details
            const createData = {
                tourTemplateId: templateId,
                title: 'Test Tour Details',
                description: 'Test description for API testing',
                skillsRequired: 'Test skills'
            };

            const createResponse = await createTourDetails(createData, token ?? undefined);
            addResult('Create TourDetails', createResponse.success, createResponse.data, createResponse);

            // Test get tour details list
            const listResponse = await getTourDetailsList({}, token ?? undefined);
            addResult('Get TourDetails List', listResponse.success, listResponse.data, listResponse);

        } catch (error) {
            addResult('TourDetails Test', false, null, error);
        } finally {
            setLoading(false);
        }
    };

    const testTourDetailsList = async () => {
        setLoading(true);
        try {
            console.log('🧪 Testing Tour Details List API...');
            const response = await getTourDetailsList({}, token ?? undefined);
            console.log('🧪 Tour Details List Response:', response);
            addResult('Tour Details List Test', response.success, response.data, response);
        } catch (error) {
            console.error('🧪 Tour Details List Error:', error);
            addResult('Tour Details List Test', false, null, error);
        } finally {
            setLoading(false);
        }
    };

    const testSpecialtyShops = async () => {
        setLoading(true);
        try {
            const response = await getSpecialtyShops(false, token ?? undefined);
            addResult('SpecialtyShops Test', response.success, response.data, response);
        } catch (error) {
            addResult('SpecialtyShops Test', false, null, error);
        } finally {
            setLoading(false);
        }
    };

    const testTimeline = async () => {
        setLoading(true);
        try {
            // First get tour details to use one for creating timeline
            const detailsResponse = await getTourDetailsList({}, token ?? undefined);
            if (!detailsResponse.success || !detailsResponse.data?.length) {
                addResult('Timeline Test', false, null, 'No tour details available for testing');
                return;
            }

            const tourDetailsId = detailsResponse.data[0].id;
            
            // Test create timeline items
            const timelineData = {
                tourDetailsId,
                timelineItems: [
                    {
                        checkInTime: '08:00',
                        activity: 'Test Activity 1',
                        location: 'Test Location 1',
                        orderIndex: 1,
                        estimatedDuration: 30
                    },
                    {
                        checkInTime: '09:00',
                        activity: 'Test Activity 2',
                        location: 'Test Location 2',
                        orderIndex: 2,
                        estimatedDuration: 45
                    }
                ]
            };

            const response = await createTimelineItems(timelineData, token ?? undefined);
            addResult('Timeline Test', response.success, response.data, response);

        } catch (error) {
            addResult('Timeline Test', false, null, error);
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setResults([]);
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Title level={2}>🧪 API Tester</Title>
                <Paragraph>
                    Test các API endpoints để đảm bảo integration hoạt động đúng.
                </Paragraph>

                <Alert
                    message="Development Environment"
                    description={`API Base URL: ${import.meta.env.DEV ? 'http://localhost:5267/api' : 'Production URL'}`}
                    type="info"
                    style={{ marginBottom: 16 }}
                />

                <Space wrap style={{ marginBottom: 16 }}>
                    <Button 
                        type="primary" 
                        onClick={testConnection}
                        loading={loading}
                    >
                        Test Connection
                    </Button>
                    <Button 
                        onClick={testTourTemplates}
                        loading={loading}
                    >
                        Test TourTemplates
                    </Button>
                    <Button
                        onClick={testTourDetails}
                        loading={loading}
                    >
                        Test TourDetails
                    </Button>
                    <Button
                        onClick={testTourDetailsList}
                        loading={loading}
                        type="default"
                    >
                        Test Tour Details List
                    </Button>
                    <Button
                        onClick={testSpecialtyShops}
                        loading={loading}
                    >
                        Test SpecialtyShops
                    </Button>
                    <Button 
                        onClick={testTimeline}
                        loading={loading}
                    >
                        Test Timeline
                    </Button>
                    <Button 
                        onClick={clearResults}
                        danger
                    >
                        Clear Results
                    </Button>
                </Space>

                <Divider />

                <TemplatesTester />

                <Divider />

                <Title level={3}>📊 Test Results</Title>
                
                {results.length === 0 ? (
                    <Alert
                        message="No test results yet"
                        description="Run some tests to see results here."
                        type="info"
                    />
                ) : (
                    <Collapse>
                        {results.map((result, index) => (
                            <Panel
                                header={
                                    <Space>
                                        <Tag color={result.success ? 'green' : 'red'}>
                                            {result.success ? 'PASS' : 'FAIL'}
                                        </Tag>
                                        <Text strong>{result.test}</Text>
                                        <Text type="secondary">{result.timestamp}</Text>
                                    </Space>
                                }
                                key={index}
                            >
                                {result.success ? (
                                    <div>
                                        <Text type="success">✅ Test passed successfully</Text>
                                        {result.data && (
                                            <div style={{ marginTop: 8 }}>
                                                <Text strong>Response Data:</Text>
                                                <pre style={{ 
                                                    background: '#f5f5f5', 
                                                    padding: 8, 
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    maxHeight: 200,
                                                    overflow: 'auto'
                                                }}>
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <Text type="danger">❌ Test failed</Text>
                                        {result.error && (
                                            <div style={{ marginTop: 8 }}>
                                                <Text strong>Error Details:</Text>
                                                <pre style={{ 
                                                    background: '#fff2f0', 
                                                    padding: 8, 
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    maxHeight: 200,
                                                    overflow: 'auto',
                                                    color: '#ff4d4f'
                                                }}>
                                                    {typeof result.error === 'string' 
                                                        ? result.error 
                                                        : JSON.stringify(result.error, null, 2)
                                                    }
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Panel>
                        ))}
                    </Collapse>
                )}
            </Card>
        </div>
    );
};

export default ApiTester;
