import { Row, Col, Card } from 'antd'
import { useTranslation } from 'react-i18next'
import { 
  CompassOutlined, 
  ClockCircleOutlined, 
  StarOutlined 
} from '@ant-design/icons'
import './WhyChooseUs.scss'

const WhyChooseUs = () => {
  const { t } = useTranslation()
  
  const features = [
    {
      id: 1,
      icon: <CompassOutlined />,
      title: t('home.features.diverseDestinations.title'),
      description: t('home.features.diverseDestinations.description'),
    },
    {
      id: 2,
      icon: <ClockCircleOutlined />,
      title: t('home.features.timeSaving.title'),
      description: t('home.features.timeSaving.description'),
    },
    {
      id: 3,
      icon: <StarOutlined />,
      title: t('home.features.qualityService.title'),
      description: t('home.features.qualityService.description'),
    },
  ]
  
  return (
    <section className="why-choose-us">
      <h2>{t('home.whyChooseUs')}</h2>
      
      <Row gutter={[24, 24]}>
        {features.map(feature => (
          <Col xs={24} sm={8} key={feature.id}>
            <Card className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}

export default WhyChooseUs
