import axios from '../config/axios';
import { ApiResponse } from '../types/common';

// Skills Types
export interface SkillInfoDto {
    skill: number;
    displayName: string;
    englishName: string;
    category: string;
}

export interface SkillCategoriesDto {
    languages: SkillInfoDto[];
    knowledge: SkillInfoDto[];
    activities: SkillInfoDto[];
    special: SkillInfoDto[];
}

/**
 * Skills Service - Quản lý API calls cho skills system
 */
class SkillsService {
    private readonly baseUrl = '/skill';

    /**
     * Lấy danh sách tất cả skills được phân loại theo categories
     * @returns Promise<ApiResponse<SkillCategoriesDto>>
     */
    async getSkillsCategories(): Promise<ApiResponse<SkillCategoriesDto>> {
        try {
            const response = await axios.get(`${this.baseUrl}/categories`);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching skills categories:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách tất cả skills dưới dạng flat list
     * @returns Promise<ApiResponse<SkillInfoDto[]>>
     */
    async getAllSkills(): Promise<ApiResponse<SkillInfoDto[]>> {
        try {
            const response = await axios.get(`${this.baseUrl}/all`);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching all skills:', error);
            throw error;
        }
    }

    /**
     * Validate skills string format
     * @param skillsString - Comma-separated skills string (e.g., "Vietnamese,English,History")
     * @returns Promise<ApiResponse<boolean>>
     */
    async validateSkillsString(skillsString: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await axios.post(`${this.baseUrl}/validate`, JSON.stringify(skillsString), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error validating skills string:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách skill names đơn giản
     * @returns Promise<ApiResponse<string[]>>
     */
    async getSkillNames(): Promise<ApiResponse<string[]>> {
        try {
            const response = await axios.get(`${this.baseUrl}/names`);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching skill names:', error);
            throw error;
        }
    }

    /**
     * Utility: Chuyển đổi array skills thành comma-separated string
     * @param skills - Array of skill english names
     * @returns Comma-separated string
     */
    createSkillsString(skills: string[]): string {
        return skills.filter(skill => skill.trim()).join(',');
    }

    /**
     * Utility: Parse skills string thành array
     * @param skillsString - Comma-separated skills string
     * @returns Array of skill names
     */
    parseSkillsString(skillsString: string): string[] {
        if (!skillsString || skillsString.trim() === '') {
            return [];
        }
        return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill);
    }

    /**
     * Utility: Lấy display name từ skills categories
     * @param englishName - English name của skill
     * @param categories - Skills categories data
     * @returns Display name (Vietnamese) hoặc english name nếu không tìm thấy
     */
    getDisplayName(englishName: string, categories: SkillCategoriesDto): string {
        const allSkills = [
            ...categories.languages,
            ...categories.knowledge,
            ...categories.activities,
            ...categories.special
        ];
        
        const skill = allSkills.find(s => s.englishName === englishName);
        return skill?.displayName || englishName;
    }

    /**
     * Utility: Validate selected skills against available skills
     * @param selectedSkills - Array of selected skill names
     * @param categories - Available skills categories
     * @returns Object with validation result and invalid skills
     */
    validateSelectedSkills(selectedSkills: string[], categories: SkillCategoriesDto): {
        isValid: boolean;
        invalidSkills: string[];
        validSkills: string[];
    } {
        const allValidSkills = [
            ...categories.languages,
            ...categories.knowledge,
            ...categories.activities,
            ...categories.special
        ].map(skill => skill.englishName);

        const validSkills = selectedSkills.filter(skill => allValidSkills.includes(skill));
        const invalidSkills = selectedSkills.filter(skill => !allValidSkills.includes(skill));

        return {
            isValid: invalidSkills.length === 0,
            invalidSkills,
            validSkills
        };
    }
}

// Export singleton instance
const skillsService = new SkillsService();
export default skillsService;

// Export individual functions for convenience
export const {
    getSkillsCategories,
    getAllSkills,
    validateSkillsString,
    getSkillNames,
    createSkillsString,
    parseSkillsString,
    getDisplayName,
    validateSelectedSkills
} = skillsService;
