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
            if (res && res.data) setSkillCategories(res.data);
        });
    }, []);

    // Tạo options động từ API
    const SKILL_CATEGORIES = skillCategories
        ? [
            {
                label: t('skills.category.languages'),
                options: skillCategories.languages.map(skill => ({ value: skill.englishName, label: t(`skills.${skill.englishName}`) })),
            },
            {
                label: t('skills.category.knowledge'),
                options: skillCategories.knowledge.map(skill => ({ value: skill.englishName, label: t(`skills.${skill.englishName}`) })),
            },
            {
                label: t('skills.category.activity'),
                options: skillCategories.activities.map(skill => ({ value: skill.englishName, label: t(`skills.${skill.englishName}`) })),
            },
            {
                label: t('skills.category.special'),
                options: skillCategories.special.map(skill => ({ value: skill.englishName, label: t(`skills.${skill.englishName}`) })),
            },
        ]
        : [];

    // Tạo mapping englishName -> skillId
    const englishNameToId: Record<string, number> = React.useMemo(() => {
        if (!skillCategories) return {};
        const allSkills = [
            ...skillCategories.languages,
            ...skillCategories.knowledge,
            ...skillCategories.activities,
            ...skillCategories.special,
        ];
        const map: Record<string, number> = {};
        allSkills.forEach(skill => {
            map[skill.englishName] = skill.skill;
        });
        return map;
    }, [skillCategories]);

    // Xử lý submit: chuyển skills (englishName) thành đúng array id và truyền cả hai
    const handleFinish = (values: any) => {
        const { skills, ...rest } = values;
        const skillsEnumNames = (skills || []).filter((name: string) => {
            const id = englishNameToId[name];
            return typeof id === 'number' && !isNaN(id);
        });
        const skillsIds = skillsEnumNames.map((name: string) => englishNameToId[name]);
        onFinish({ ...rest, skills: skillsIds, skillsEnumNames });
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
                    >
                        {SKILL_CATEGORIES.map(cat => (
                            <OptGroup key={cat.label} label={cat.label}>
                                {cat.options.map(opt => (
                                    <Option key={opt.value} value={opt.value} label={opt.label}>
                                        {opt.label}
                                    </Option>
                                ))}
                            </OptGroup>
                        ))}
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
