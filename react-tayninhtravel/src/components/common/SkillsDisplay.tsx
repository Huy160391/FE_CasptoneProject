import React, { useState, useEffect } from 'react';
import { Tag, Space, Tooltip, Typography } from 'antd';
import skillsService from '../../services/skillsService';
import { SkillCategoriesDto } from '../../types/skills';

const { Text } = Typography;

interface SkillsDisplayProps {
    skillsString: string;
    maxDisplay?: number;
    showCategory?: boolean;
    size?: 'small' | 'default';
    color?: string;
    className?: string;
}

/**
 * SkillsDisplay Component - Hiển thị skills từ skills string
 * Chuyển đổi skills string thành display names và hiển thị dưới dạng tags
 */
const SkillsDisplay: React.FC<SkillsDisplayProps> = ({
    skillsString,
    maxDisplay = 3,
    showCategory = false,
    size = 'small',
    color,
    className = ''
}) => {
    const [skillsCategories, setSkillsCategories] = useState<SkillCategoriesDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSkillsCategories = async () => {
            try {
                setLoading(true);
                const response = await skillsService.getSkillsCategories();
                if (response.success && response.data) {
                    setSkillsCategories(response.data);
                }
            } catch (error) {
                console.error('Error fetching skills categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSkillsCategories();
    }, []);

    // Parse skills string thành array
    const parseSkills = (skillsStr: string): string[] => {
        if (!skillsStr || skillsStr.trim() === '') {
            return [];
        }
        return skillsStr.split(',').map(skill => skill.trim()).filter(skill => skill);
    };

    // Lấy display name của skill
    const getSkillDisplayName = (skillEnglishName: string): string => {
        if (!skillsCategories) return skillEnglishName;

        // Tìm skill trong tất cả categories
        const allSkills = [
            ...(skillsCategories.languages || []),
            ...(skillsCategories.knowledge || []),
            ...(skillsCategories.activities || []),
            ...(skillsCategories.special || [])
        ];

        const skill = allSkills.find(s => s.englishName === skillEnglishName);
        return skill ? skill.displayName : skillEnglishName;
    };

    // Lấy category của skill
    const getSkillCategory = (skillEnglishName: string): string => {
        if (!skillsCategories) return '';

        if (skillsCategories.languages?.some(s => s.englishName === skillEnglishName)) {
            return 'Ngôn ngữ';
        }
        if (skillsCategories.knowledge?.some(s => s.englishName === skillEnglishName)) {
            return 'Kiến thức chuyên môn';
        }
        if (skillsCategories.activities?.some(s => s.englishName === skillEnglishName)) {
            return 'Kỹ năng hoạt động';
        }
        if (skillsCategories.special?.some(s => s.englishName === skillEnglishName)) {
            return 'Kỹ năng đặc biệt';
        }
        return '';
    };

    // Lấy màu tag theo category
    const getTagColor = (skillEnglishName: string): string => {
        if (color) return color;

        if (!skillsCategories) return 'blue';

        if (skillsCategories.languages?.some(s => s.englishName === skillEnglishName)) {
            return 'blue';
        }
        if (skillsCategories.knowledge?.some(s => s.englishName === skillEnglishName)) {
            return 'green';
        }
        if (skillsCategories.activities?.some(s => s.englishName === skillEnglishName)) {
            return 'orange';
        }
        if (skillsCategories.special?.some(s => s.englishName === skillEnglishName)) {
            return 'purple';
        }
        return 'blue';
    };

    if (loading) {
        return <Text type="secondary" style={{ fontSize: '12px' }}>Đang tải...</Text>;
    }

    if (!skillsString || skillsString.trim() === '') {
        return <Text type="secondary" style={{ fontSize: '12px' }}>Chưa có kỹ năng</Text>;
    }

    const skills = parseSkills(skillsString);
    
    if (skills.length === 0) {
        return <Text type="secondary" style={{ fontSize: '12px' }}>Chưa có kỹ năng</Text>;
    }

    const displaySkills = skills.slice(0, maxDisplay);
    const remainingCount = skills.length - maxDisplay;

    return (
        <div className={className}>
            <Space wrap size={4}>
                {displaySkills.map((skill, index) => {
                    const displayName = getSkillDisplayName(skill);
                    const category = getSkillCategory(skill);
                    const tagColor = getTagColor(skill);
                    
                    const tagContent = showCategory && category ? `${displayName} (${category})` : displayName;
                    
                    return (
                        <Tooltip key={index} title={category ? `${displayName} - ${category}` : displayName}>
                            <Tag 
                                color={tagColor} 
                                style={{ 
                                    fontSize: size === 'small' ? '11px' : '12px',
                                    margin: '1px'
                                }}
                            >
                                {tagContent}
                            </Tag>
                        </Tooltip>
                    );
                })}
                
                {remainingCount > 0 && (
                    <Tooltip 
                        title={
                            <div>
                                <div style={{ marginBottom: 4 }}>Các kỹ năng khác:</div>
                                {skills.slice(maxDisplay).map((skill, index) => (
                                    <div key={index}>• {getSkillDisplayName(skill)}</div>
                                ))}
                            </div>
                        }
                    >
                        <Tag 
                            color="default" 
                            style={{ 
                                fontSize: size === 'small' ? '11px' : '12px',
                                margin: '1px'
                            }}
                        >
                            +{remainingCount}
                        </Tag>
                    </Tooltip>
                )}
            </Space>
        </div>
    );
};

export default SkillsDisplay;
