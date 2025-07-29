import React, { useState } from 'react';
import { Button, Card, Typography, Space, Alert, Divider } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { 
    runAllTimezoneTests, 
    validateTimezoneConfiguration,
    testVietnamTimezone,
    testTourPricingTimezone,
    testAPIDataTransformation
} from '../../utils/timezoneTest';

const { Title, Text } = Typography;

/**
 * Development component for testing timezone implementation
 * Only visible in development mode
 */
const TimezoneTestPanel: React.FC = () => {
    const [testResults, setTestResults] = useState<{
        allTests?: boolean;
        validation?: boolean;
        individual?: { [key: string]: boolean };
    }>({});
    const [isRunning, setIsRunning] = useState(false);

    // Only show in development
    if (import.meta.env.PROD) {
        return null;
    }

    const runTest = async (testName: string, testFunction: () => boolean | void) => {
        setIsRunning(true);
        try {
            console.log(`\n🧪 Running ${testName}...`);
            const result = testFunction();
            const success = result !== false;
            
            setTestResults(prev => ({
                ...prev,
                individual: {
                    ...prev.individual,
                    [testName]: success
                }
            }));
            
            return success;
        } catch (error) {
            console.error(`❌ ${testName} failed:`, error);
            setTestResults(prev => ({
                ...prev,
                individual: {
                    ...prev.individual,
                    [testName]: false
                }
            }));
            return false;
        } finally {
            setIsRunning(false);
        }
    };

    const runAllTests = async () => {
        setIsRunning(true);
        try {
            const result = runAllTimezoneTests();
            setTestResults(prev => ({ ...prev, allTests: result }));
        } catch (error) {
            console.error('❌ All tests failed:', error);
            setTestResults(prev => ({ ...prev, allTests: false }));
        } finally {
            setIsRunning(false);
        }
    };

    const runValidation = async () => {
        setIsRunning(true);
        try {
            const result = validateTimezoneConfiguration();
            setTestResults(prev => ({ ...prev, validation: result }));
        } catch (error) {
            console.error('❌ Validation failed:', error);
            setTestResults(prev => ({ ...prev, validation: false }));
        } finally {
            setIsRunning(false);
        }
    };

    const getResultIcon = (result?: boolean) => {
        if (result === undefined) return null;
        return result ? 
            <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    };

    const getResultText = (result?: boolean) => {
        if (result === undefined) return 'Not run';
        return result ? 'PASSED' : 'FAILED';
    };

    return (
        <Card 
            title={
                <Space>
                    <Title level={4} style={{ margin: 0 }}>
                        🇻🇳 Vietnam Timezone Test Panel
                    </Title>
                    <Text type="secondary">(Development Only)</Text>
                </Space>
            }
            style={{ margin: '20px', maxWidth: '800px' }}
        >
            <Alert
                message="Vietnam Timezone Implementation"
                description="This panel tests the Vietnam timezone (UTC+7) implementation across the entire system including backend API, frontend components, and business logic."
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
            />

            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Quick Validation */}
                <div>
                    <Title level={5}>Quick Validation</Title>
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={runValidation}
                            loading={isRunning}
                        >
                            Validate Configuration
                        </Button>
                        <Space>
                            {getResultIcon(testResults.validation)}
                            <Text>{getResultText(testResults.validation)}</Text>
                        </Space>
                    </Space>
                </div>

                <Divider />

                {/* Individual Tests */}
                <div>
                    <Title level={5}>Individual Tests</Title>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                            <Button
                                onClick={() => runTest('Vietnam Timezone Utils', testVietnamTimezone)}
                                loading={isRunning}
                            >
                                Test Timezone Utils
                            </Button>
                            <Space>
                                {getResultIcon(testResults.individual?.['Vietnam Timezone Utils'])}
                                <Text>{getResultText(testResults.individual?.['Vietnam Timezone Utils'])}</Text>
                            </Space>
                        </Space>

                        <Space>
                            <Button
                                onClick={() => runTest('Tour Pricing Timezone', testTourPricingTimezone)}
                                loading={isRunning}
                            >
                                Test Pricing Logic
                            </Button>
                            <Space>
                                {getResultIcon(testResults.individual?.['Tour Pricing Timezone'])}
                                <Text>{getResultText(testResults.individual?.['Tour Pricing Timezone'])}</Text>
                            </Space>
                        </Space>

                        <Space>
                            <Button
                                onClick={() => runTest('API Data Transformation', testAPIDataTransformation)}
                                loading={isRunning}
                            >
                                Test API Transformation
                            </Button>
                            <Space>
                                {getResultIcon(testResults.individual?.['API Data Transformation'])}
                                <Text>{getResultText(testResults.individual?.['API Data Transformation'])}</Text>
                            </Space>
                        </Space>
                    </Space>
                </div>

                <Divider />

                {/* Comprehensive Test */}
                <div>
                    <Title level={5}>Comprehensive Test</Title>
                    <Space>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            onClick={runAllTests}
                            loading={isRunning}
                        >
                            Run All Tests
                        </Button>
                        <Space>
                            {getResultIcon(testResults.allTests)}
                            <Text strong>{getResultText(testResults.allTests)}</Text>
                        </Space>
                    </Space>
                </div>

                {/* Instructions */}
                <Alert
                    message="How to Use"
                    description={
                        <div>
                            <p>1. <strong>Quick Validation:</strong> Run basic checks to ensure timezone is configured correctly</p>
                            <p>2. <strong>Individual Tests:</strong> Test specific components separately</p>
                            <p>3. <strong>Comprehensive Test:</strong> Run all tests together</p>
                            <p>4. <strong>Check Console:</strong> Detailed test results are logged to the browser console</p>
                        </div>
                    }
                    type="warning"
                    showIcon
                />
            </Space>
        </Card>
    );
};

export default TimezoneTestPanel;
