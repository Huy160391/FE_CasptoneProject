/**
 * Skills Types - Định nghĩa types cho skills system
 */

// Enum cho TourGuideSkill (sync với backend)
export enum TourGuideSkill {
    // Languages
    Vietnamese = 1,
    English = 2,
    Chinese = 3,
    Japanese = 4,
    Korean = 5,
    French = 6,
    German = 7,
    Russian = 8,

    // Knowledge
    History = 9,
    Culture = 10,
    Religion = 11,
    Cuisine = 12,
    Geography = 13,
    Nature = 14,
    Arts = 15,
    Architecture = 16,

    // Activities
    MountainClimbing = 17,
    Trekking = 18,
    Photography = 19,
    WaterSports = 20,
    Cycling = 21,
    Camping = 22,
    BirdWatching = 23,
    AdventureSports = 24,

    // Special
    FirstAid = 25,
    Driving = 26,
    Cooking = 27,
    Meditation = 28,
    TraditionalMassage = 29
}

// DTO cho thông tin skill
export interface SkillInfoDto {
    skill: TourGuideSkill;
    displayName: string;
    englishName: string;
    category: string;
}

// DTO cho skills được phân loại theo categories
export interface SkillCategoriesDto {
    languages: SkillInfoDto[];
    knowledge: SkillInfoDto[];
    activities: SkillInfoDto[];
    special: SkillInfoDto[];
}

// DTO cho skill selection trong forms
export interface SkillSelectionDto {
    skills: TourGuideSkill[];
    skillsString?: string;
}

// Props cho SkillsSelector component
export interface SkillsSelectorProps {
    selectedSkills: string[];
    onSkillsChange: (skills: string[]) => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    maxSelections?: number;
    categories?: SkillCategoriesDto;
    showCategories?: boolean;
    allowMultiple?: boolean;
    size?: 'small' | 'middle' | 'large';
    className?: string;
}

// Skills validation result
export interface SkillsValidationResult {
    isValid: boolean;
    invalidSkills: string[];
    validSkills: string[];
    message?: string;
}

// Skills category mapping
export interface SkillCategoryMapping {
    [key: string]: {
        displayName: string;
        skills: SkillInfoDto[];
    };
}

// Skills filter options
export interface SkillsFilterOptions {
    categories?: string[];
    searchTerm?: string;
    includeInactive?: boolean;
}

// Skills display options
export interface SkillsDisplayOptions {
    showEnglishName?: boolean;
    showCategory?: boolean;
    groupByCategory?: boolean;
    sortBy?: 'displayName' | 'englishName' | 'category';
    sortOrder?: 'asc' | 'desc';
}

// Export utility types
export type SkillEnglishName = keyof typeof TourGuideSkill;
export type SkillCategoryName = 'languages' | 'knowledge' | 'activities' | 'special';

// Constants
export const SKILL_CATEGORIES: Record<SkillCategoryName, string> = {
    languages: 'Ngôn ngữ',
    knowledge: 'Kiến thức chuyên môn', 
    activities: 'Kỹ năng hoạt động',
    special: 'Kỹ năng đặc biệt'
} as const;

export const SKILL_CATEGORY_COLORS: Record<SkillCategoryName, string> = {
    languages: '#1890ff',
    knowledge: '#52c41a',
    activities: '#fa8c16',
    special: '#eb2f96'
} as const;
