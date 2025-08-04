import React, { useEffect, useState } from 'react';
import { Button, Typography, Card } from 'antd';
import skillsService from '@/services/skillsService';

const { Title, Paragraph } = Typography;

const SkillsDebug: React.FC = () => {
    const [skillCategories, setSkillCategories] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadSkills = async () => {
        setLoading(true);
        try {
            const response = await skillsService.getSkillsCategories();
            console.log('SkillsDebug - Full API response:', response);
            setSkillCategories(response.data);
        } catch (error) {
            console.error('SkillsDebug - Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSkills();
    }, []);

    return (
        <Card title="Skills Debug Info" style={{ margin: '20px' }}>
            <Button onClick={loadSkills} loading={loading}>
                Reload Skills
            </Button>

            <Title level={4}>Raw Skills Data:</Title>
            <Paragraph>
                <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                    {JSON.stringify(skillCategories, null, 2)}
                </pre>
            </Paragraph>

            {skillCategories && (
                <>
                    <Title level={4}>Skills Mapping:</Title>
                    {Object.entries(skillCategories).map(([category, skills]: [string, any]) => (
                        <div key={category}>
                            <Title level={5}>{category}:</Title>
                            <ul>
                                {skills.map((skill: any) => (
                                    <li key={skill.skill}>
                                        ID: {skill.skill}, Name: {skill.englishName}, Display: {skill.displayName}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </>
            )}
        </Card>
    );
};

export default SkillsDebug;
