import { Select, DatePicker, Input, Button } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import './TourSearchBar.scss';

const { Option } = Select;

const TourSearchBar = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const locationParam = searchParams.get('location');
    const dateParam = searchParams.get('date');
    const keywordParam = searchParams.get('keyword');

    const [location, setLocation] = useState<string | undefined>(locationParam || undefined);
    const [date, setDate] = useState<any>(dateParam ? dayjs(dateParam) : null);
    const [keyword, setKeyword] = useState<string>(keywordParam || '');

    const locations = [
        { value: 'nui-ba-den', label: 'Núi Bà Đen' },
        { value: 'toa-thanh', label: 'Tòa Thánh Tây Ninh' },
        { value: 'ho-dau-tieng', label: 'Hồ Dầu Tiếng' },
        { value: 'thac-giang-dien', label: 'Thác Giang Điền' },
        { value: 'vuon-quoc-gia-lo-go', label: 'Vườn Quốc Gia Lò Gò - Xa Mát' }
    ];

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
                <div className="search-item location">
                    <Select
                        placeholder="Chọn điểm đến"
                        className="location-select"
                        suffixIcon={<EnvironmentOutlined />}
                        onChange={(value) => setLocation(value)}
                        value={location}
                    >
                        <Option value="all">Tất cả địa điểm</Option>
                        {locations.map(location => (
                            <Option key={location.value} value={location.value}>
                                {location.label}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div className="search-item date">
                    <DatePicker
                        className="date-picker"
                        placeholder="Chọn ngày khởi hành"
                        format="DD/MM/YYYY"
                        onChange={(value) => setDate(value)}
                        value={date}
                    />
                </div>

                <Input
                    placeholder="Tìm kiếm tour..."
                    prefix={<SearchOutlined />}
                    className="keyword-input"
                    style={{ height: '42px' }}
                    onChange={(e) => setKeyword(e.target.value)}
                    value={keyword}
                    onPressEnter={handleSearch}
                />

                <Button type="primary" className="search-button" onClick={handleSearch}>
                    Tìm kiếm
                </Button>
            </div>
        </div>
    );
};

export default TourSearchBar;
