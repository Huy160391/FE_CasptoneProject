import { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/authService';
import ResetPasswordModal from './ResetPasswordModal';

interface ForgotPasswordModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const ForgotPasswordModal = ({ isVisible, onClose }: ForgotPasswordModalProps) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    const handleSendOTP = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            message.error(t('auth.emailInvalid'));
            return;
        }

        try {
            setLoading(true);
            await authService.sendOtpResetPassword(email);
            message.success(t('auth.verificationSuccess'));
            setShowResetModal(true);
        } catch (error: any) {
            message.error(error.response?.data?.message || t('auth.verificationFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleResetSuccess = () => {
        setShowResetModal(false);
        onClose();
    };

    return (
        <>
            <Modal
                title={t('auth.forgotPasswordTitle')}
                open={isVisible && !showResetModal}
                onCancel={onClose}
                footer={null}
                destroyOnHidden
            >
                <div style={{ textAlign: 'center' }}>
                    <p>{t('auth.forgotPasswordInstructions')}</p>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('auth.email')}
                        style={{ marginBottom: 16 }}
                    />
                    <Button
                        type="primary"
                        onClick={handleSendOTP}
                        loading={loading}
                        block
                    >
                        {t('auth.sendResetCode')}
                    </Button>
                </div>
            </Modal>

            <ResetPasswordModal
                isVisible={showResetModal}
                onClose={() => setShowResetModal(false)}
                email={email}
                onResetSuccess={handleResetSuccess}
            />
        </>
    );
};

export default ForgotPasswordModal;
