import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, Button, Card, Spin, Select } from 'antd';
import { BankOutlined, UserOutlined, CreditCardOutlined } from '@ant-design/icons';
import { BankAccountFormData, BankAccount } from '@/types';
import shopWithdrawalService, { SupportedBank } from '@/services/shopWithdrawalService';

interface BankAccountFormProps {
    /** Initial data for editing existing bank account */
    initialData?: BankAccount;
    /** Loading state */
    loading?: boolean;
    /** Form submission handler */
    onSubmit: (data: BankAccountFormData) => Promise<void>;
    /** Cancel handler */
    onCancel?: () => void;
    /** Whether this is an edit form */
    isEdit?: boolean;
}

/**
 * BankAccountForm Component
 * 
 * A reusable form component for creating and editing bank account information.
 * Follows the project's form patterns with proper validation and error handling.
 * 
 * Features:
 * - Vietnamese bank account number validation
 * - Real-time form validation
 * - Loading states
 * - Accessibility support
 * - Responsive design
 */
const BankAccountForm: React.FC<BankAccountFormProps> = ({
    initialData,
    loading = false,
    onSubmit,
    onCancel,
    isEdit = false
}) => {
    const [form] = Form.useForm<BankAccountFormData>();
    const [supportedBanks, setSupportedBanks] = useState<SupportedBank[]>([]);
    const [banksLoading, setBanksLoading] = useState(false);
    const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
    const [showCustomBankInput, setShowCustomBankInput] = useState(false);

    // Initialize form with existing data when editing
    useEffect(() => {
        if (initialData && isEdit) {
            form.setFieldsValue({
                bankName: initialData.bankName,
                accountNumber: initialData.accountNumber,
                accountHolderName: initialData.accountHolderName,
                isDefault: initialData.isDefault
            });
        }
    }, [initialData, isEdit, form]);

    // Load supported banks list
    useEffect(() => {
        loadSupportedBanks();
    }, []);

    const loadSupportedBanks = async () => {
        try {
            setBanksLoading(true);
            const banks = await shopWithdrawalService.getSupportedBanks();
            setSupportedBanks(banks);
        } catch (error) {
            console.error('Error loading supported banks:', error);
        } finally {
            setBanksLoading(false);
        }
    };

    const handleBankSelect = (value: number) => {
        setSelectedBankId(value);
        const selectedBank = supportedBanks.find(bank => bank.value === value);

        if (selectedBank?.value === 999) {
            // "Other" bank selected
            setShowCustomBankInput(true);
            form.setFieldValue('bankName', '');
        } else {
            // Predefined bank selected
            setShowCustomBankInput(false);
            form.setFieldValue('bankName', selectedBank?.displayName || '');
        }
    };

    /**
     * Handle form submission with validation
     */
    const handleSubmit = async (values: BankAccountFormData & { bankSelection?: number; customBankName?: string }) => {
        try {
            // Prepare final form data
            const formData: BankAccountFormData = {
                bankName: showCustomBankInput ? values.customBankName || '' : values.bankName,
                accountNumber: values.accountNumber,
                accountHolderName: values.accountHolderName,
                isDefault: values.isDefault || false
            };

            // Log selected bank for debugging
            console.log('Selected bank ID:', selectedBankId);

            await onSubmit(formData);

            if (!isEdit) {
                form.resetFields();
                setSelectedBankId(null);
                setShowCustomBankInput(false);
            }
        } catch (error) {
            // Error handling is done in parent component
            console.error('Form submission error:', error);
        }
    };

    /**
     * Validate Vietnamese bank account number
     * Most Vietnamese banks use 6-19 digit account numbers
     */
    const validateAccountNumber = (_: any, value: string) => {
        if (!value) {
            return Promise.resolve();
        }

        // Remove spaces and special characters
        const cleanValue = value.replace(/[\s-]/g, '');

        // Check if it's all digits
        if (!/^\d+$/.test(cleanValue)) {
            return Promise.reject(new Error('Số tài khoản chỉ được chứa số'));
        }

        // Check length (6-19 digits for Vietnamese banks)
        if (cleanValue.length < 6 || cleanValue.length > 19) {
            return Promise.reject(new Error('Số tài khoản phải từ 6-19 chữ số'));
        }

        return Promise.resolve();
    };

    /**
     * Validate account holder name
     * Should only contain Vietnamese characters and spaces
     */
    const validateAccountHolderName = (_: any, value: string) => {
        if (!value) {
            return Promise.resolve();
        }

        // Vietnamese name pattern (letters, spaces, and Vietnamese diacritics)
        const vietnameseNamePattern = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;

        if (!vietnameseNamePattern.test(value)) {
            return Promise.reject(new Error('Tên chủ tài khoản chỉ được chứa chữ cái và khoảng trắng'));
        }

        // Check length
        if (value.length < 2 || value.length > 100) {
            return Promise.reject(new Error('Tên chủ tài khoản phải từ 2-100 ký tự'));
        }

        return Promise.resolve();
    };

    return (
        <Card
            title={isEdit ? "Chỉnh sửa tài khoản ngân hàng" : "Thêm tài khoản ngân hàng"}
            className="bank-account-form"
        >
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="bankSelection"
                        label="Chọn ngân hàng"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngân hàng' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn ngân hàng"
                            loading={banksLoading}
                            onChange={handleBankSelect}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {supportedBanks.map(bank => (
                                <Select.Option key={bank.value} value={bank.value}>
                                    {bank.displayName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {showCustomBankInput && (
                        <Form.Item
                            name="customBankName"
                            label="Tên ngân hàng khác"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên ngân hàng' },
                                { min: 2, message: 'Tên ngân hàng phải có ít nhất 2 ký tự' },
                                { max: 100, message: 'Tên ngân hàng không được quá 100 ký tự' }
                            ]}
                        >
                            <Input
                                prefix={<BankOutlined />}
                                placeholder="Nhập tên ngân hàng"
                                maxLength={100}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="bankName"
                        label="Tên ngân hàng"
                        style={{ display: 'none' }}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="accountNumber"
                        label="Số tài khoản"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tài khoản' },
                            { validator: validateAccountNumber }
                        ]}
                    >
                        <Input
                            prefix={<CreditCardOutlined />}
                            placeholder="Nhập số tài khoản ngân hàng"
                            maxLength={19}
                        />
                    </Form.Item>

                    <Form.Item
                        name="accountHolderName"
                        label="Tên chủ tài khoản"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên chủ tài khoản' },
                            { validator: validateAccountHolderName }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập tên chủ tài khoản (theo CMND/CCCD)"
                            maxLength={100}
                        />
                    </Form.Item>

                    <Form.Item
                        name="isDefault"
                        label="Đặt làm tài khoản mặc định"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item className="form-actions">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            style={{ marginRight: 8 }}
                        >
                            {isEdit ? 'Cập nhật' : 'Thêm tài khoản'}
                        </Button>
                        {onCancel && (
                            <Button
                                onClick={onCancel}
                                size="large"
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                        )}
                    </Form.Item>
                </Form>
            </Spin>
        </Card>
    );
};

export default BankAccountForm;
