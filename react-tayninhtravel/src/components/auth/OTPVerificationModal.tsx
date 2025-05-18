/// <reference types="node" />

import { useState, useEffect } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { authService } from '@/services/authService';

interface OTPVerificationModalProps {
    isVisible: boolean;
    onClose: () => void;
    email: string;
    onVerificationSuccess: () => void;
}

const OTPVerificationModal = ({ isVisible, onClose, email, onVerificationSuccess }: OTPVerificationModalProps) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isVisible && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            onClose();
        }
        return () => clearInterval(timer);
    }, [isVisible, timeLeft, onClose]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            message.error('Mã OTP phải gồm 6 chữ số!');
            return;
        }

        try {
            setLoading(true);
            await authService.verifyOTP(email, otp);
            message.success('Xác thực email thành công!');
            onVerificationSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Xác thực thất bại. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <Modal
            title="Xác thực Email"
            open={isVisible}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <div style={{ textAlign: 'center' }}>
                <p>Vui lòng nhập mã OTP đã được gửi đến email {email}</p>
                <p>Thời gian còn lại: {formatTime(timeLeft)}</p>
                <Input
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập mã OTP 6 chữ số"
                    style={{ marginBottom: 16 }}
                />
                <Button
                    type="primary"
                    onClick={handleVerify}
                    loading={loading}
                    block
                >
                    Xác thực
                </Button>
            </div>
        </Modal>
    );
};

export default OTPVerificationModal; 