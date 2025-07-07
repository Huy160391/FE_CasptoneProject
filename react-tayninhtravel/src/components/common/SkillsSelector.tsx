import React, { useState, useEffect, useMemo } from 'react';
import {
    Card,
    Checkbox,
    Row,
    Col,
    Tag,
    Space,
    Input,
    Spin,
    Alert,
    Collapse,
    Typography,
    Empty,
    Button
} from 'antd';
import {
    SearchOutlined,
    ClearOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import skillsService from '../../services/skillsService';
import {
    SkillCategoriesDto,
    SkillInfoDto,
    SkillsSelectorProps,
    SKILL_CATEGORIES,
    SKILL_CATEGORY_COLORS,
    SkillCategoryName
} from '../../types/skills';

const { Panel } = Collapse;
const { Text, Title } = Typography;
const { Search } = Input;

/**
 * SkillsSelector Component - Reusable component để chọn skills
 * Hiển thị skills theo categories với checkbox selection
 */
const SkillsSelector: React.FC<SkillsSelectorProps> = ({
    selectedSkills = [],
    onSkillsChange,
    disabled = false,
    required = false,
    placeholder = "Chọn kỹ năng yêu cầu...",
    maxSelections,
    showCategories = true,
    allowMultiple = true,
    size = 'middle',
    className = ''
}) => {
    // States
    const [skillsCategories, setSkillsCategories] = useState<SkillCategoriesDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategories, setActiveCategories] = useState<string[]>(['languages', 'knowledge', 'activities', 'special']);

    // Load skills categories on mount
    useEffect(() => {
        loadSkillsCategories();
    }, []);

    const loadSkillsCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await skillsService.getSkillsCategories();
            
            if (response.success && response.data) {
                setSkillsCategories(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách kỹ năng');
            }
        } catch (err) {
            console.error('❌ Error loading skills categories:', err);
            setError('Có lỗi xảy ra khi tải danh sách kỹ năng');
        } finally {
            setLoading(false);
        }
    };

    // Filter skills based on search term
    const filteredSkills = useMemo(() => {
        if (!skillsCategories) return null;

        const filtered: SkillCategoriesDto = {
            languages: [],
            knowledge: [],
            activities: [],
            special: []
        };

        Object.entries(skillsCategories).forEach(([category, skills]) => {
            const categoryKey = category as SkillCategoryName;
            filtered[categoryKey] = skills.filter(skill =>
                skill.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                skill.englishName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        return filtered;
    }, [skillsCategories, searchTerm]);

    // Handle skill selection
    const handleSkillToggle = (skillEnglishName: string) => {
        if (disabled) return;

        let newSelectedSkills: string[];

        if (allowMultiple) {
            if (selectedSkills.includes(skillEnglishName)) {
                // Remove skill
                newSelectedSkills = selectedSkills.filter(skill => skill !== skillEnglishName);
            } else {
                // Add skill (check max selections)
                if (maxSelections && selectedSkills.length >= maxSelections) {
                    return; // Don't add if max reached
                }
                newSelectedSkills = [...selectedSkills, skillEnglishName];
            }
        } else {
            // Single selection mode
            newSelectedSkills = selectedSkills.includes(skillEnglishName) ? [] : [skillEnglishName];
        }

        onSkillsChange(newSelectedSkills);
    };

    // Handle clear all
    const handleClearAll = () => {
        if (!disabled) {
            onSkillsChange([]);
        }
    };

    // Render skill item
    const renderSkillItem = (skill: SkillInfoDto, categoryKey: SkillCategoryName) => {
        const isSelected = selectedSkills.includes(skill.englishName);
        const isDisabled = disabled || (maxSelections && !isSelected && selectedSkills.length >= maxSelections);

        return (
            <Col span={12} key={skill.englishName}>
                <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleSkillToggle(skill.englishName)}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" size={0}>
                        <Text strong={isSelected}>{skill.displayName}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {skill.englishName}
                        </Text>
                    </Space>
                </Checkbox>
            </Col>
        );
    };

    // Render category
    const renderCategory = (categoryKey: SkillCategoryName, skills: SkillInfoDto[]) => {
        if (skills.length === 0) return null;

        const categoryColor = SKILL_CATEGORY_COLORS[categoryKey];
        const categoryName = SKILL_CATEGORIES[categoryKey];

        return (
            <Panel
                header={
                    <Space>
                        <Tag color={categoryColor}>{categoryName}</Tag>
                        <Text type="secondary">({skills.length} kỹ năng)</Text>
                    </Space>
                }
                key={categoryKey}
            >
                <Row gutter={[16, 8]}>
                    {skills.map(skill => renderSkillItem(skill, categoryKey))}
                </Row>
            </Panel>
        );
    };

    // Loading state
    if (loading) {
        return (
            <Card className={className}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text>Đang tải danh sách kỹ năng...</Text>
                    </div>
                </div>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className={className}>
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={loadSkillsCategories}>
                            Thử lại
                        </Button>
                    }
                />
            </Card>
        );
    }

    // No data state
    if (!filteredSkills) {
        return (
            <Card className={className}>
                <Empty description="Không có dữ liệu kỹ năng" />
            </Card>
        );
    }

    return (
        <Card 
            className={className}
            title={
                <Space>
                    <InfoCircleOutlined />
                    <Text>Chọn kỹ năng yêu cầu</Text>
                    {required && <Text type="danger">*</Text>}
                </Space>
            }
            extra={
                selectedSkills.length > 0 && (
                    <Button 
                        type="link" 
                        icon={<ClearOutlined />} 
                        onClick={handleClearAll}
                        disabled={disabled}
                        size="small"
                    >
                        Xóa tất cả
                    </Button>
                )
            }
            size={size}
        >
            {/* Search */}
            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Tìm kiếm kỹ năng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%' }}
                    allowClear
                />
            </div>

            {/* Selected skills summary */}
            {selectedSkills.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Đã chọn ({selectedSkills.length}):</Text>
                    <div style={{ marginTop: 8 }}>
                        <Space wrap>
                            {selectedSkills.map(skillName => {
                                const displayName = skillsCategories ? 
                                    skillsService.getDisplayName(skillName, skillsCategories) : 
                                    skillName;
                                return (
                                    <Tag
                                        key={skillName}
                                        closable={!disabled}
                                        onClose={() => handleSkillToggle(skillName)}
                                        color="blue"
                                    >
                                        {displayName}
                                    </Tag>
                                );
                            })}
                        </Space>
                    </div>
                </div>
            )}

            {/* Max selections warning */}
            {maxSelections && selectedSkills.length >= maxSelections && (
                <Alert
                    message={`Đã đạt giới hạn tối đa ${maxSelections} kỹ năng`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* Skills categories */}
            {showCategories ? (
                <Collapse 
                    defaultActiveKey={activeCategories}
                    onChange={(keys) => setActiveCategories(keys as string[])}
                >
                    {Object.entries(filteredSkills).map(([categoryKey, skills]) =>
                        renderCategory(categoryKey as SkillCategoryName, skills)
                    )}
                </Collapse>
            ) : (
                <div>
                    {Object.entries(filteredSkills).map(([categoryKey, skills]) => (
                        <div key={categoryKey} style={{ marginBottom: 16 }}>
                            <Title level={5}>{SKILL_CATEGORIES[categoryKey as SkillCategoryName]}</Title>
                            <Row gutter={[16, 8]}>
                                {skills.map(skill => renderSkillItem(skill, categoryKey as SkillCategoryName))}
                            </Row>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty search results */}
            {searchTerm && Object.values(filteredSkills).every(skills => skills.length === 0) && (
                <Empty 
                    description={`Không tìm thấy kỹ năng nào với từ khóa "${searchTerm}"`}
                    style={{ margin: '20px 0' }}
                />
            )}
        </Card>
    );
};

export default SkillsSelector;
