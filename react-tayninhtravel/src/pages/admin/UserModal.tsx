import { Modal, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@/types/user';

const { Option } = Select;

interface UserModalProps {
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
    form: any;
    editingUser: User | null;
}

const UserModal = ({ visible, onOk, onCancel, form, editingUser }: UserModalProps) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (!visible) form.resetFields();
    }, [visible, form]);

    return (
        <Modal
            title={editingUser ? t('admin.users.modal.edit') : t('admin.users.modal.add')}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText={editingUser ? t('common.save') : t('common.add')}
            cancelText={t('common.cancel')}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="name"
                    label={t('profile.name')}
                    rules={[{ required: true, message: t('profile.nameRequired') }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="email"
                    label={t('profile.email')}
                    rules={[
                        { required: true, message: t('profile.emailRequired') },
                        { type: 'email', message: t('profile.emailInvalid') },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label={t('profile.phone')}
                    rules={[
                        { required: true, message: t('profile.phoneRequired') },
                        { pattern: /^[0-9]{10}$/, message: t('auth.phoneInvalid') },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="status"
                    label={t('admin.users.columns.status')}
                    rules={[{ required: true, message: t('admin.users.validation.statusRequired') }]}
                >
                    <Select>
                        <Option value={true}>{t('admin.users.status.active')}</Option>
                        <Option value={false}>{t('admin.users.status.inactive')}</Option>
                    </Select>
                </Form.Item>

                {!editingUser && (
                    <>
                        <Form.Item
                            name="password"
                            label={t('auth.password')}
                            rules={[
                                { required: true, message: t('auth.passwordRequired') },
                                { min: 6, message: t('auth.passwordInvalid') },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label={t('auth.confirmPassword')}
                            dependencies={['password']}
                            rules={[
                                { required: true, message: t('auth.confirmPasswordRequired') },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(t('auth.passwordMismatch')));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default UserModal;