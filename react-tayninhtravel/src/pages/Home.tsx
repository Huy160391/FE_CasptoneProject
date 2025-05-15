// import { useTranslation } from 'react-i18next'
import HeroSection from '../components/home/HeroSection'
import FeaturedTours from '../components/home/FeaturedTours'
import WhyChooseUs from '../components/home/WhyChooseUs'
import FeaturedGuides from '../components/home/FeaturedGuides'
import './Home.scss'

// const { t } = useTranslation()

const Home = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <div className="container">
        <FeaturedTours />
        <FeaturedGuides />
        <WhyChooseUs />
      </div>
    </div>
  )
}

export default Home
