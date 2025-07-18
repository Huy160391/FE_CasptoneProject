import React, { useState } from 'react';
import { Modal, Rate, Input, Button, Typography, notification } from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Title } = Typography;

interface CreateReviewModalProps {
    visible: boolean;
    onClose: () => void;
    onShowLogin?: () => void; // Thêm callback mở login modal
    productId: string;
    productName?: string;
    onSubmit?: (rating: number, comment: string) => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({ visible, onClose, onShowLogin, productId, productName, onSubmit }) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleSubmit = async () => {
        if (typeof onSubmit === 'function') {
            setSubmitting(true);
            try {
                await onSubmit(rating, comment);
                setRating(0);
                setComment('');
                onClose();
            } catch {
                notification.error({ message: t('navigation.review.error'), description: t('navigation.review.submitFailed') });
            } finally {
                setSubmitting(false);
            }
        } else {
            if (rating === 0) {
                notification.error({ message: t('navigation.review.ratingRequired'), description: t('navigation.review.pleaseRate') });
                return;
            }
            setSubmitting(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setSubmitting(false);
                    onClose();
                    if (onShowLogin) onShowLogin();
                    return;
                }
                // Gọi hàm tạo review từ userService
                const userService = await import('@/services/userService').then(mod => mod.default);
                await userService.createProductReview(productId, rating, comment);
                notification.success({ message: t('navigation.review.success'), description: t('navigation.review.thankYou') });
                setRating(0);
                setComment('');
                onClose();
            } catch {
                notification.error({ message: t('navigation.review.error'), description: t('navigation.review.submitFailed') });
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            title={<Title level={4}>{t('navigation.review.title', { product: productName })}</Title>}
        >
            <div style={{ marginBottom: 16 }}>
                <Rate value={rating} onChange={setRating} />
            </div>
            <TextArea
                rows={4}
                placeholder={t('navigation.review.commentPlaceholder')}
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={500}
                style={{ marginBottom: 16 }}
            />
            <Button type="primary" block loading={submitting} onClick={handleSubmit}>
                {t('navigation.review.submit')}
            </Button>
        </Modal>
    );
};

export default CreateReviewModal;
