import { Select, DatePicker, Input } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './SearchBar.scss';

const { Option } = Select;

const SearchBar = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState<string | undefined>(undefined);
    const [date, setDate] = useState<any>(null);
    const [keyword, setKeyword] = useState<string>('');

    const locations = [
        { value: 'nui-ba-den', label: 'Núi Bà Đen' },
        { value: 'toa-thanh', label: 'Tòa Thánh Tây Ninh' },
        { value: 'ho-dau-tieng', label: 'Hồ Dầu Tiếng' },
        { value: 'thac-giang-dien', label: 'Thác Giang Điền' },
        { value: 'vuon-quoc-gia-lo-go', label: 'Vườn Quốc Gia Lò Gò - Xa Mát' }
    ];

    const handleSearch = () => {
        // Build query params
        const params = new URLSearchParams();

        if (location) params.append('location', location);
        if (date) params.append('date', date.format('YYYY-MM-DD'));
        if (keyword) params.append('keyword', keyword);

        // Navigate to things-to-do page with search params
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

                <button className="search-button" onClick={handleSearch} type="button">
                    Tìm kiếm
                </button>
            </div>
        </div>
    );
};

export default SearchBar;
