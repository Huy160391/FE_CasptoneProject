// import { useTranslation } from 'react-i18next'
import HeroSection from "../components/home/HeroSection";
import TourismHighlights from "../components/home/TourismHighlights";
import FeaturedTours from "../components/home/FeaturedTours";
import WhyChooseUs from "../components/home/WhyChooseUs";
import FeaturedGuides from "../components/home/FeaturedGuides";
import BestSellers from "../components/home/BestSellers";
import BlogPosts from "../components/home/BlogPosts";
import "./Home.scss";

// const { t } = useTranslation()

const Home = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <div className="container">
        <TourismHighlights />
        <FeaturedTours />
        <FeaturedGuides />

        <BlogPosts />
        <BestSellers />
        <WhyChooseUs />
      </div>
    </div>
  );
};

export default Home;
