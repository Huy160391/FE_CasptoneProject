import { Input, Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useState } from 'react';
import './ShopSearchBar.scss';

const { Option } = Select;

interface ShopSearchBarProps {
    onSearch: (searchText: string) => void;
    onCategoryChange: (categories: string[]) => void;
    onSortChange: (sortBy: string) => void;
    searchText: string;
    sortBy: string;
}

const ShopSearchBar = ({
    onSearch,
    onCategoryChange,
    onSortChange,
    searchText,
    sortBy
}: ShopSearchBarProps) => {
    const [localSearchText, setLocalSearchText] = useState(searchText);

    const categories = [
        { value: 'all', label: 'Tất cả danh mục' },
        { value: 'đồ-lưu-niệm', label: 'Đồ lưu niệm' },
        { value: 'quần-áo', label: 'Quần áo' },
        { value: 'phụ-kiện', label: 'Phụ kiện' },
        { value: 'đặc-sản', label: 'Đặc sản' },
        { value: 'thủ-công-mỹ-nghệ', label: 'Thủ công mỹ nghệ' }
    ];

    const sortOptions = [
        { value: 'popularity', label: 'Phổ biến nhất' },
        { value: 'price-low-high', label: 'Giá: Thấp đến cao' },
        { value: 'price-high-low', label: 'Giá: Cao đến thấp' },
        { value: 'rating', label: 'Đánh giá cao nhất' },
        { value: 'newest', label: 'Mới nhất' }
    ];

    const handleSearch = () => {
        onSearch(localSearchText);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="shop-search-bar">
            <div className="search-container">
                <div className="search-item category">
                    <Select
                        placeholder="Chọn danh mục"
                        className="category-select"
                        suffixIcon={<FilterOutlined />}
                        defaultValue="all"
                        onChange={(value) => onCategoryChange(value === 'all' ? [] : [value])}
                    >
                        {categories.map(category => (
                            <Option key={category.value} value={category.value}>
                                {category.label}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div className="search-item sort">
                    <Select
                        placeholder="Sắp xếp theo"
                        className="sort-select"
                        value={sortBy}
                        onChange={onSortChange}
                    >
                        {sortOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </div>

                <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    prefix={<SearchOutlined />}
                    className="keyword-input"
                    style={{ height: '42px' }}
                    value={localSearchText}
                    onChange={(e) => setLocalSearchText(e.target.value)}
                    onPressEnter={handleKeyPress}
                />

                <Button type="primary" className="search-button" onClick={handleSearch}>
                    Tìm kiếm
                </Button>
            </div>
        </div>
    );
};

export default ShopSearchBar;
