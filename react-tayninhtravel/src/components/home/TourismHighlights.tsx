import { useTranslation } from 'react-i18next';
import { Carousel } from 'antd';
import './TourismHighlights.scss';

const highlights = [
    {
        id: 1,
        image: 'https://badenmountain.sunworld.vn/wp-content/uploads/2024/04/1-tuong-phat-di-lac-nui-ba-den.png',
        titleKey: 'home.highlights.blackLady.title',
        descKey: 'home.highlights.blackLady.description',
    },
    {
        id: 2,
        image: 'https://thanhnien.mediacdn.vn/Uploaded/phuongcg/2022_11_27/cuoc-thi-anh-dep-du-lich-tay-ninh-2022-3-6191.jpg',
        titleKey: 'home.highlights.location.title',
        descKey: 'home.highlights.location.description',
    },
    {
        id: 3,
        image: 'https://badenmountain.sunworld.vn/wp-content/uploads/2024/01/1-tong-hop-28-mon-an-ngon-nuc-tieng-tai-tay-ninh.jpg',
        titleKey: 'home.highlights.cuisine.title',
        descKey: 'home.highlights.cuisine.description',
    },
];

const TourismHighlights = () => {
    const { t } = useTranslation();

    const carouselSettings = {
        autoplay: true,
        autoplaySpeed: 5000,
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
    };

    return (
        <section className="tourism-highlights">
            <div className="container">
                <Carousel {...carouselSettings}>
                    {highlights.map((highlight) => (
                        <div key={highlight.id} className="highlight-item">
                            <div className="highlight-content">
                                <div className="text-content">
                                    <h2>{t(highlight.titleKey)}</h2>
                                    <p>{t(highlight.descKey)}</p>
                                </div>
                                <div
                                    className="image-content"
                                    style={{ backgroundImage: `url(${highlight.image})` }}
                                />
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>
        </section>
    );
};

export default TourismHighlights;
