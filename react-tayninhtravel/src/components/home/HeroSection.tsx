import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import './HeroSection.scss'

const HeroSection = () => {
  const { t } = useTranslation()
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  const backgrounds = [
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="hero-section"
      style={{
        backgroundImage: `url(${backgrounds[currentBgIndex]})`,
      }}
    >
      <div className="hero-content">
        <h1>{t('home.hero.title')}</h1>
        <p>{t('home.hero.subtitle')}</p>
        <Button type="primary" size="large">
          {t('home.hero.cta')}
        </Button>
      </div>
    </div>
  )
}

export default HeroSection
