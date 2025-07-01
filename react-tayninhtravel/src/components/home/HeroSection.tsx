import { useTranslation } from 'react-i18next'
import SearchBar from './SearchBar'
import './HeroSection.scss'

const HeroSection = () => {
  const { t } = useTranslation()

  // Chỉ sử dụng một ảnh cố định làm background
  const mainBackground = 'https://toptayninh.vn/wp-content/uploads/2023/10/Nui-ba-den-Tay-Ninh.jpg'
  const heroTitle = t('home.hero.title')

  return (
    <div
      className="hero-section"
      style={{
        backgroundImage: `url(${mainBackground})`,
      }}
    >
      <div className="hero-content">
        <h1 data-text={heroTitle}>{heroTitle}</h1>
        <p>{t('home.hero.subtitle')}</p>
        <SearchBar />
      </div>
    </div>
  )
}

export default HeroSection
