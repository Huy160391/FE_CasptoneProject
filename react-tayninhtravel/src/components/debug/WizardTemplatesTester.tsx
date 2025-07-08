import React, { useState } from 'react';
import { Card, Button, Space, Typography, Alert, Spin } from 'antd';
import { ReloadOutlined, DeleteOutlined, BugOutlined } from '@ant-design/icons';
import { useTourTemplateStore } from '../../store/useTourTemplateStore';
import { useAuthStore } from '../../store/useAuthStore';

const { Text, Title } = Typography;

const WizardTemplatesTester: React.FC = () => {
    const { token } = useAuthStore();
    const {
        getTemplates,
        templatesCache,
        templatesLoading,
        clearCache,
        clearTemplatesCache
    } = useTourTemplateStore();
    
    const [testResult, setTestResult] = useState<any>(null);
    const [testing, setTesting] = useState(false);

    const testWizardTemplates = async () => {
        setTesting(true);
        setTestResult(null);
        
        try {
            console.log('🧪 Testing wizard templates fetch...');
            
            // Test with pageIndex=0 (should work)
            const templates = await getTemplates(
                { pageIndex: 0, pageSize: 100, includeInactive: false }, 
                token ?? undefined,
                true // force refresh
            );
            
            setTestResult({
                success: true,
                templatesCount: templates.length,
                templates: templates.slice(0, 3), // Show first 3 for preview
                cacheInfo: templatesCache
            });
            
            console.log('✅ Templates fetched successfully:', templates.length);
        } catch (error) {
            console.error('❌ Error testing templates:', error);
            setTestResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setTesting(false);
        }
    };

    const handleClearCache = () => {
        clearCache();
        setTestResult(null);
    };

    const handleClearTemplatesCache = () => {
        clearTemplatesCache();
        setTestResult(null);
    };

    return (
        <Card 
            title={
                <Space>
                    <BugOutlined />
                    <Title level={4} style={{ margin: 0 }}>Wizard Templates Tester</Title>
                </Space>
            }
            style={{ margin: '20px 0' }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                    message="Debug Tool"
                    description="Test wizard templates fetching with correct pageIndex=0 parameter"
                    type="info"
                    showIcon
                />
                
                <Space wrap>
                    <Button 
                        type="primary" 
                        icon={<ReloadOutlined />}
                        onClick={testWizardTemplates}
                        loading={testing || templatesLoading}
                    >
                        Test Fetch Templates (pageIndex=0)
                    </Button>
                    
                    <Button 
                        icon={<DeleteOutlined />}
                        onClick={handleClearTemplatesCache}
                    >
                        Clear Templates Cache
                    </Button>
                    
                    <Button 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleClearCache}
                    >
                        Clear All Cache
                    </Button>
                </Space>

                {/* Cache Status */}
                <Card size="small" title="Cache Status">
                    <Space direction="vertical">
                        <Text>
                            <strong>Templates Cache:</strong> {templatesCache ? 
                                `${templatesCache.data.length} items (${new Date(templatesCache.timestamp).toLocaleTimeString()})` : 
                                'Empty'
                            }
                        </Text>
                        <Text>
                            <strong>Loading:</strong> {templatesLoading ? 'Yes' : 'No'}
                        </Text>
                        <Text>
                            <strong>Token:</strong> {token ? 'Present' : 'Missing'}
                        </Text>
                    </Space>
                </Card>

                {/* Test Results */}
                {testing && (
                    <Card size="small">
                        <Spin /> Testing templates fetch...
                    </Card>
                )}

                {testResult && (
                    <Card 
                        size="small" 
                        title="Test Results"
                        style={{ 
                            borderColor: testResult.success ? '#52c41a' : '#ff4d4f',
                            backgroundColor: testResult.success ? '#f6ffed' : '#fff2f0'
                        }}
                    >
                        {testResult.success ? (
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text strong style={{ color: '#52c41a' }}>
                                    ✅ Success! Fetched {testResult.templatesCount} templates
                                </Text>
                                
                                {testResult.templates.length > 0 && (
                                    <div>
                                        <Text strong>Sample Templates:</Text>
                                        <ul>
                                            {testResult.templates.map((template: any) => (
                                                <li key={template.id}>
                                                    {template.title} ({template.templateType})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <Text type="secondary">
                                    Cache updated: {new Date().toLocaleTimeString()}
                                </Text>
                            </Space>
                        ) : (
                            <Space direction="vertical">
                                <Text strong style={{ color: '#ff4d4f' }}>
                                    ❌ Failed to fetch templates
                                </Text>
                                <Text code>{testResult.error}</Text>
                            </Space>
                        )}
                    </Card>
                )}
            </Space>
        </Card>
    );
};

export default WizardTemplatesTester;
