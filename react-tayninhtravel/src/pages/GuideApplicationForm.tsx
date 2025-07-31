import { Form, Input, Button, Upload, Typography, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import skillsService, { SkillCategoriesDto } from '@/services/skillsService';

const { Title, Paragraph } = Typography;
const { Option, OptGroup } = Select;

interface GuideApplicationFormProps {
    form: any;
    submitting: boolean;
    cvFile: any[];
    beforeCvUpload: (file: any) => boolean;
    handleCvChange: (info: any) => void;
    onFinish: (values: any) => void;
}

const GuideApplicationForm: React.FC<GuideApplicationFormProps> = ({
    form,
    submitting,
    cvFile,
    beforeCvUpload,
    handleCvChange,
    onFinish,
}) => {
    const { t } = useTranslation();
    const [skillCategories, setSkillCategories] = useState<SkillCategoriesDto | null>(null);

    useEffect(() => {
        // Lấy danh sách kỹ năng từ service
        skillsService.getSkillsCategories().then(res => {
            if (res && res.data) {
                setSkillCategories(res.data);
            }
        }).catch(error => {
            console.error('GuideApplicationForm - Error loading skills:', error);
            // Fallback skills for testing
            const fallbackSkills = {
                languages: [
                    { skill: 1, englishName: 'Vietnamese', displayName: 'Tiếng Việt', category: 'languages' },
                    { skill: 2, englishName: 'English', displayName: 'Tiếng Anh', category: 'languages' }
                ],
                knowledge: [
                    { skill: 3, englishName: 'History', displayName: 'Lịch sử', category: 'knowledge' },
                    { skill: 4, englishName: 'Culture', displayName: 'Văn hóa', category: 'knowledge' }
                ],
                activities: [
                    { skill: 5, englishName: 'Hiking', displayName: 'Leo núi', category: 'activities' },
                    { skill: 6, englishName: 'Swimming', displayName: 'Bơi lội', category: 'activities' }
                ],
                special: [
                    { skill: 7, englishName: 'Photography', displayName: 'Chụp ảnh', category: 'special' },
                    { skill: 8, englishName: 'FirstAid', displayName: 'Sơ cứu', category: 'special' }
                ]
            };
            setSkillCategories(fallbackSkills);
        });
    }, []);

    // Tạo options động từ API
    const SKILL_CATEGORIES = skillCategories
        ? [
            {
                label: t('skills.category.languages') || 'Languages',
                options: skillCategories.languages.map(skill => ({
                    value: skill.englishName,
                    label: skill.displayName || skill.englishName // Use displayName instead of translation
                })),
            },
            {
                label: t('skills.category.knowledge') || 'Knowledge',
                options: skillCategories.knowledge.map(skill => ({
                    value: skill.englishName,
                    label: skill.displayName || skill.englishName
                })),
            },
            {
                label: t('skills.category.activity') || 'Activities',
                options: skillCategories.activities.map(skill => ({
                    value: skill.englishName,
                    label: skill.displayName || skill.englishName
                })),
            },
            {
                label: t('skills.category.special') || 'Special',
                options: skillCategories.special.map(skill => ({
                    value: skill.englishName,
                    label: skill.displayName || skill.englishName
                })),
            },
        ]
        : [];

    // Xử lý submit: skills sẽ là mảng english names
    const handleFinish = (values: any) => {
        const { skills: selectedSkills, ...rest } = values;

        const skillsEnumNames = (selectedSkills || []).filter((name: string) => {
            return typeof name === 'string' && name.trim();
        });
        const skillsString = skillsEnumNames.join(',');

        // Tạo object với skills là mảng string (english names)
        const finalData = {
            ...rest,
            skills: skillsEnumNames, // Array of skill english names
            skillsString: skillsString, // Comma-separated string
        };

        onFinish(finalData);
    };

    return (
        <div className="job-application-form">
            <Title level={2}>{t('jobs.applicationForm.title')}</Title>
            <Paragraph>{t('jobs.applicationForm.description')}</Paragraph>

            <Form
                key="guide-form"
                form={form}
                layout="vertical"
                name="job_application_form"
                onFinish={handleFinish}
                className="form"
                validateTrigger="onSubmit"
            >
                <Form.Item
                    name="fullName"
                    label={t('jobs.applicationForm.fullName')}
                    rules={[{ required: true, message: t('jobs.applicationForm.fullNameRequired') }]}
                >
                    <Input placeholder={t('jobs.applicationForm.fullNamePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label={t('jobs.applicationForm.phone')}
                    rules={[
                        { required: true, message: t('jobs.applicationForm.phoneRequired') },
                        { pattern: /^0[0-9]{9,10}$/, message: t('jobs.applicationForm.phoneInvalid') }
                    ]}
                >
                    <Input placeholder={t('jobs.applicationForm.phonePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="email"
                    label={t('jobs.applicationForm.email')}
                    rules={[
                        { required: true, message: t('jobs.applicationForm.emailRequired') },
                        { type: 'email', message: t('jobs.applicationForm.emailInvalid') }
                    ]}
                >
                    <Input placeholder={t('jobs.applicationForm.emailPlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="experience"
                    label={t('jobs.applicationForm.experience')}
                    rules={[
                        { required: true, message: t('jobs.applicationForm.experienceRequired') },
                        { min: 10, message: t('jobs.applicationForm.experienceMinLength') }
                    ]}
                >
                    <Input placeholder={t('jobs.applicationForm.experiencePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="skills"
                    label={t('jobs.applicationForm.skills')}
                    rules={[{ required: true, message: t('jobs.applicationForm.skillsRequired') }]}
                >
                    <Select
                        mode="multiple"
                        placeholder={t('jobs.applicationForm.skillsPlaceholder')}
                        optionLabelProp="label"
                        showSearch
                        filterOption={(input, option) => {
                            const label = typeof option?.label === 'string' ? option.label : '';
                            return label.toLowerCase().includes(input.toLowerCase());
                        }}
                        notFoundContent={skillCategories ? "Không tìm thấy kỹ năng" : "Đang tải..."}
                    >
                        {SKILL_CATEGORIES.length > 0 ? (
                            SKILL_CATEGORIES.map(cat => (
                                <OptGroup key={cat.label} label={cat.label}>
                                    {cat.options.map(opt => (
                                        <Option key={opt.value} value={opt.value} label={opt.label}>
                                            {opt.label}
                                        </Option>
                                    ))}
                                </OptGroup>
                            ))
                        ) : (
                            <>
                                <Option value="test1">Test Skill 1</Option>
                                <Option value="test2">Test Skill 2</Option>
                            </>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="cvFile"
                    label={t('jobs.applicationForm.cv')}
                    rules={[{ required: true, message: t('jobs.applicationForm.cvRequired') }]}
                >
                    <Upload
                        name="cv"
                        listType="picture"
                        fileList={cvFile}
                        beforeUpload={beforeCvUpload}
                        onChange={handleCvChange}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>{t('jobs.applicationForm.selectFile')}</Button>
                        <span className="upload-hint">{t('jobs.applicationForm.fileHint')}</span>
                    </Upload>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                        {t('jobs.applicationForm.submit')}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default GuideApplicationForm;
