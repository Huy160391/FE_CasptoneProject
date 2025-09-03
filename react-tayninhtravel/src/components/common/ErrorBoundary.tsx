import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography, Collapse } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';
import { getErrorMessage } from '@/utils/errorHandler';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Enhanced error logging
        console.group('🔴 Error Boundary Caught Error');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Component Stack:', errorInfo.componentStack);
        console.groupEnd();

        // Update state with error info
        this.setState({
            error,
            errorInfo
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log to external error reporting service in production
        if (import.meta.env.PROD) {
            console.log('Error would be reported to external service:', {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                errorId: this.state.errorId
            });
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const { error, errorInfo, errorId } = this.state;
            const isDevelopment = import.meta.env.DEV;

            return (
                <div style={{
                    padding: '50px 20px',
                    textAlign: 'center',
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    <Result
                        status="error"
                        title="Đã xảy ra lỗi không mong muốn"
                        subTitle={
                            <div>
                                <Paragraph>
                                    Ứng dụng đã gặp phải một lỗi không mong muốn.
                                    Chúng tôi đã ghi nhận sự cố này và sẽ khắc phục sớm nhất có thể.
                                </Paragraph>
                                <Text type="secondary">
                                    Mã lỗi: {errorId}
                                </Text>
                            </div>
                        }
                        extra={[
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={this.handleReload}
                                key="reload"
                            >
                                Tải lại trang
                            </Button>,
                            <Button
                                icon={<HomeOutlined />}
                                onClick={this.handleGoHome}
                                key="home"
                                style={{ marginLeft: '8px' }}
                            >
                                Về trang chủ
                            </Button>,
                            <Button
                                type="link"
                                onClick={this.handleReset}
                                key="reset"
                                style={{ marginLeft: '8px' }}
                            >
                                Thử lại
                            </Button>
                        ]}
                    />

                    {/* Error details for development or when showDetails is true */}
                    {(isDevelopment || this.props.showDetails) && error && (
                        <div style={{
                            marginTop: '30px',
                            textAlign: 'left',
                            width: '100%',
                            maxWidth: '700px'
                        }}>
                            <Collapse ghost>
                                <Panel
                                    header={
                                        <Text type="secondary">
                                            <BugOutlined /> Chi tiết lỗi (Development)
                                        </Text>
                                    }
                                    key="error-details"
                                >
                                    <div style={{
                                        backgroundColor: '#f5f5f5',
                                        padding: '15px',
                                        borderRadius: '6px',
                                        fontFamily: 'monospace',
                                        fontSize: '12px',
                                        overflow: 'auto'
                                    }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <strong>Error Message:</strong>
                                            <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                                                {getErrorMessage(error)}
                                            </pre>
                                        </div>

                                        <div style={{ marginBottom: '10px' }}>
                                            <strong>Stack Trace:</strong>
                                            <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                                                {error.stack}
                                            </pre>
                                        </div>

                                        {errorInfo && (
                                            <div>
                                                <strong>Component Stack:</strong>
                                                <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                                                    {errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                            </Collapse>
                        </div>
                    )}

                    {/* User-friendly error reporting */}
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#f0f2f5',
                        borderRadius: '6px',
                        maxWidth: '600px'
                    }}>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                            💡 <strong>Gợi ý:</strong> Nếu lỗi vẫn tiếp tục xảy ra, vui lòng:
                        </Text>
                        <ul style={{
                            textAlign: 'left',
                            marginTop: '10px',
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            <li>Thử tải lại trang</li>
                            <li>Xóa cache trình duyệt</li>
                            <li>Kiểm tra kết nối internet</li>
                            <li>Liên hệ hỗ trợ với mã lỗi: <code>{errorId}</code></li>
                        </ul>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
