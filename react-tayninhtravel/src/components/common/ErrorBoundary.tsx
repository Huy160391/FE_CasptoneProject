import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/tour-guide/dashboard';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <Result
                        status="error"
                        title="Đã xảy ra lỗi"
                        subTitle="Có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc quay về trang chủ."
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
                            >
                                Về Dashboard
                            </Button>
                        ]}
                    >
                        {process.env.NODE_ENV === 'development' && (
                            <div style={{ 
                                textAlign: 'left', 
                                background: '#f5f5f5', 
                                padding: '16px', 
                                borderRadius: '4px',
                                marginTop: '16px'
                            }}>
                                <h4>Error Details (Development Only):</h4>
                                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                                    {this.state.error?.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}
                    </Result>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
