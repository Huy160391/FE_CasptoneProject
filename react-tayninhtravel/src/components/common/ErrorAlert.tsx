import React from 'react';
import { Alert, Typography } from 'antd';
import { ExclamationCircleOutlined, CloseCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ErrorAlertProps {
    type?: 'error' | 'warning' | 'info' | 'success';
    message: string;
    description?: string;
    details?: string[];
    showIcon?: boolean;
    closable?: boolean;
    onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
    type = 'error',
    message,
    description,
    details,
    showIcon = true,
    closable = true,
    onClose
}) => {
    const getIcon = () => {
        switch (type) {
            case 'error':
                return <CloseCircleOutlined />;
            case 'warning':
                return <WarningOutlined />;
            case 'info':
                return <InfoCircleOutlined />;
            default:
                return <ExclamationCircleOutlined />;
        }
    };

    const renderDescription = () => {
        if (!description && !details) return null;

        return (
            <div>
                {description && <Text>{description}</Text>}
                {details && details.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                        <Text strong>Chi tiết lỗi:</Text>
                        <ul style={{ margin: '4px 0 0 16px' }}>
                            {details.map((detail, index) => (
                                <li key={index}>
                                    <Text type="secondary">{detail}</Text>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Alert
            type={type}
            message={message}
            description={renderDescription()}
            icon={showIcon ? getIcon() : undefined}
            closable={closable}
            onClose={onClose}
            style={{ marginBottom: 16 }}
        />
    );
};

export default ErrorAlert;
