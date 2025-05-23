import { useState, useEffect } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/authService';

interface ResetPasswordModalProps {
    isVisible: boolean;
    onClose: () => void;
    email: string;
    onResetSuccess: () => void;
}

const ResetPasswordModal = ({ isVisible, onClose, email, onResetSuccess }: ResetPasswordModalProps) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleResetPassword = async () => {
        if (otp.length !== 6) {
            message.error(t('auth.otpInvalid'));
            return;
        }

        if (newPassword.length < 6) {
            message.error(t('auth.passwordInvalid'));
            return;
        }

        if (newPassword !== confirmPassword) {
            message.error(t('auth.passwordMismatch'));
            return;
        }

        try {
            setLoading(true);
            await authService.resetPassword(email, otp, newPassword);
            message.success(t('auth.resetPasswordSuccess'));
            onResetSuccess();
        } catch (error: any) {
            message.error(error.response?.data?.message || t('auth.resetPasswordFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={t('auth.resetPasswordTitle')}
            open={isVisible}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <div style={{ textAlign: 'center' }}>
                <p>{t('auth.resetPasswordInstructions', { email: email })}</p>
                <p>{t('auth.timeRemaining')}: {formatTime(timeLeft)}</p>

                <Input
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('auth.enterOTP')}
                    style={{ marginBottom: 16 }}
                />

                <Input.Password
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('auth.newPassword')}
                    style={{ marginBottom: 16 }}
                />

                <Input.Password
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirmPassword')}
                    style={{ marginBottom: 16 }}
                />

                <Button
                    type="primary"
                    onClick={handleResetPassword}
                    loading={loading}
                    block
                >
                    {t('auth.resetPassword')}
                </Button>
            </div>
        </Modal>
    );
};

export default ResetPasswordModal;
