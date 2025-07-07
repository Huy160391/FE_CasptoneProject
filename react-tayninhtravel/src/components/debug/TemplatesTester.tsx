import React, { useState } from 'react';
import { Card, Button, Space, Alert, Typography, Tag } from 'antd';
import { ApiOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import { getTourTemplates, handleApiError } from '../../services/tourcompanyService';
import { TourTemplate } from '../../types/tour';
import axios from '../../config/axios';

const { Text, Paragraph } = Typography;

const TemplatesTester: React.FC = () => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<TourTemplate[]>([]);
    const [error, setError] = useState<string>('');
    const [lastResponse, setLastResponse] = useState<any>(null);

    const testTemplatesAPI = async () => {
        setLoading(true);
        setError('');
        setLastResponse(null);

        try {
            console.log('🧪 Testing Templates API...');
            console.log('Token:', token ? 'Present' : 'Missing');

            const response = await getTourTemplates({
                pageIndex: 0,
                pageSize: 10,
                includeInactive: false
            }, token);
            console.log('Raw response:', response);

            setLastResponse(response);

            // Handle different response formats
            let templateItems = [];

            if (response.statusCode === 200 && response.data) {
                if (Array.isArray(response.data)) {
                    templateItems = response.data;
                } else if (response.data.items) {
                    templateItems = response.data.items;
                } else if (response.success && response.data) {
                    templateItems = response.data.items || response.data || [];
                }

                setTemplates(templateItems);
                console.log('✅ Success! Templates:', templateItems);
            } else {
                setError('API returned unsuccessful response');
                console.warn('⚠️ Unsuccessful response:', response);
            }
        } catch (err: any) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            console.error('❌ Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const testDirectAPI = async () => {
        setLoading(true);
        setError('');
        setLastResponse(null);

        try {
            console.log('🧪 Testing Direct API Call...');

            // Test trực tiếp với axios
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const url = '/TourCompany/template';
            const params = {
                pageIndex: 1,
                pageSize: 10,
                includeInactive: false
            };

            console.log('Direct API call:', { url, params, headers });

            const response = await axios.get(url, { params, headers });
            console.log('Direct response:', response);

            setLastResponse(response.data);

            if (response.data && response.data.data) {
                const templateItems = response.data.data.items || response.data.data || [];
                setTemplates(templateItems);
                console.log('✅ Direct Success! Templates:', templateItems);
            } else {
                setError('Direct API call - unexpected response format');
            }
        } catch (err: any) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            console.error('❌ Direct Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="🧪 Templates API Tester" style={{ margin: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <Text strong>Current Status:</Text>
                    <div style={{ marginTop: 8 }}>
                        <Space>
                            <Tag color={token ? 'green' : 'red'}>
                                Token: {token ? 'Present' : 'Missing'}
                            </Tag>
                            <Tag color={templates.length > 0 ? 'green' : 'default'}>
                                Templates: {templates.length}
                            </Tag>
                        </Space>
                    </div>
                </div>

                <Space>
                    <Button
                        type="primary"
                        icon={<ApiOutlined />}
                        onClick={testTemplatesAPI}
                        loading={loading}
                    >
                        Test via Service
                    </Button>
                    <Button
                        type="default"
                        icon={<ApiOutlined />}
                        onClick={testDirectAPI}
                        loading={loading}
                    >
                        Test Direct API
                    </Button>
                </Space>

                {error && (
                    <Alert
                        message="API Error"
                        description={error}
                        type="error"
                        showIcon
                        icon={<ExclamationCircleOutlined />}
                    />
                )}

                {templates.length > 0 && (
                    <Alert
                        message={`Success! Found ${templates.length} templates`}
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                        description={
                            <div>
                                {templates.map(template => (
                                    <div key={template.id} style={{ marginBottom: 4 }}>
                                        • {template.title} (Type: {template.templateType})
                                    </div>
                                ))}
                            </div>
                        }
                    />
                )}

                {lastResponse && (
                    <Card size="small" title="Last API Response">
                        <pre style={{ 
                            background: '#f5f5f5', 
                            padding: 8, 
                            borderRadius: 4,
                            fontSize: 12,
                            maxHeight: 300,
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(lastResponse, null, 2)}
                        </pre>
                    </Card>
                )}

                <Card size="small" title="Debug Info">
                    <Paragraph>
                        <Text strong>API Base URL:</Text> {import.meta.env.DEV ? 'http://localhost:5267/api' : 'Production URL'}
                    </Paragraph>
                    <Paragraph>
                        <Text strong>API Endpoint:</Text>
                        <div style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: 4, margin: '4px 0' }}>
                            GET /TourCompany/template?pageIndex=1&pageSize=10&includeInactive=false
                        </div>
                    </Paragraph>
                    <Paragraph>
                        <Text strong>Expected Response Format:</Text>
                        <pre style={{ fontSize: 11, background: '#f9f9f9', padding: 4 }}>
{`{
  "success": true,
  "data": {
    "items": [
      {
        "id": "guid",
        "title": "Template Name",
        "templateType": 1,
        ...
      }
    ]
  }
}`}
                        </pre>
                    </Paragraph>
                </Card>
            </Space>
        </Card>
    );
};

export default TemplatesTester;
