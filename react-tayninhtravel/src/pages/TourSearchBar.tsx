import { DatePicker, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import './TourSearchBar.scss';

// const { Option } = Select;

const TourSearchBar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const locationParam = searchParams.get('location');
    const dateParam = searchParams.get('date');
    const keywordParam = searchParams.get('keyword');

    const [location, setLocation] = useState<string | undefined>(locationParam || undefined);
    const [date, setDate] = useState<any>(dateParam ? dayjs(dateParam) : null);
    const [keyword, setKeyword] = useState<string>(keywordParam || '');

    // const locations = [
    //     { value: 'nui-ba-den', label: t('tour.location.nuiBaDen') },
    //     { value: 'toa-thanh', label: t('tour.location.toaThanh') },
    //     { value: 'ho-dau-tieng', label: t('tour.location.hoDauTieng') },
    //     { value: 'thac-giang-dien', label: t('tour.location.thacGiangDien') },
    //     { value: 'vuon-quoc-gia-lo-go', label: t('tour.location.vuonQuocGiaLoGo') }
    // ];

    // Load search values from URL parameters on component mount
    useEffect(() => {
        if (locationParam) {
            setLocation(locationParam);
        }

        if (keywordParam) {
            setKeyword(keywordParam);
        }

        if (dateParam) {
            setDate(dayjs(dateParam));
        }
    }, [locationParam, dateParam, keywordParam]);

    const handleSearch = () => {
        // Build query params
        const params = new URLSearchParams();

        if (location) params.append('location', location);
        if (date) params.append('date', date.format('YYYY-MM-DD'));
        if (keyword) params.append('keyword', keyword);

        // Update URL with search params
        navigate({
            pathname: '/things-to-do',
            search: params.toString()
        });
    };

    return (
        <div className="tour-search-bar">
            <div className="search-container">
                {/* <div className="search-item location">
                    <Select
                        placeholder={t('tour.search.destinationPlaceholder')}
                        className="location-select"
                        suffixIcon={<EnvironmentOutlined />}
                        onChange={(value) => setLocation(value)}
                        value={location}
                    >
                        <Option value="all">Tất cả địa điểm</Option>
                        <Option value="all">{t('tour.search.allLocations')}</Option>
                        {locations.map(location => (
                            <Option key={location.value} value={location.value}>
                                {location.label}
                            </Option>
                        ))}
                    </Select>
                </div> */}

                <div className="search-item date">
                    <DatePicker
                        className="date-picker"
                        placeholder={t('tour.search.datePlaceholder')}
                        format="DD/MM/YYYY"
                        onChange={(value) => setDate(value)}
                        value={date}
                    />
                </div>

                <Input
                    placeholder={t('tour.search.keywordPlaceholder')}
                    prefix={<SearchOutlined />}
                    className="keyword-input"
                    style={{ height: '42px' }}
                    onChange={(e) => setKeyword(e.target.value)}
                    value={keyword}
                    onPressEnter={handleSearch}
                />

                <Button type="primary" className="search-button" onClick={handleSearch}>
                    {t('tour.search.searchButton')}
                </Button>
            </div>
        </div>
    );
};

export default TourSearchBar;
