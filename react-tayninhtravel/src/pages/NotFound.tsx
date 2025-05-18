import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotFound.scss';

const NotFound = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="not-found-page">
            <Result
                status="404"
                title="404"
                subTitle={t('common.pageNotFound')}
                extra={
                    <Button type="primary" onClick={() => navigate('/')}>
                        {t('common.backToHome')}
                    </Button>
                }
            />
        </div>
    );
};

export default NotFound; 