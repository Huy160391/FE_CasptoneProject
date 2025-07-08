import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircleOutlined } from '@ant-design/icons'

const OrderSuccess = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div style={{ padding: '100px 24px', textAlign: 'center' }}>
            <Result
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                status="success"
                title={t('checkout.orderSuccess')}
                subTitle={t('checkout.orderSuccessDescription')}
                extra={[
                    <Button type="primary" key="shop" onClick={() => navigate('/shop')}>
                        {t('cart.continueShopping')}
                    </Button>,
                    <Button key="home" onClick={() => navigate('/')}>
                        {t('common.backToHome')}
                    </Button>
                ]}
            />
        </div>
    )
}

export default OrderSuccess
