import { Input, Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ShopSearchBar.scss';

const { Option } = Select;

interface ShopSearchBarProps {
    onSearch: (searchText: string) => void;
    onCategoryChange: (categories: string[]) => void;
    searchText: string;
}

const ShopSearchBar = ({
    onSearch,
    onCategoryChange,
    searchText
}: ShopSearchBarProps) => {
    const { t } = useTranslation();
    const [localSearchText, setLocalSearchText] = useState(searchText);

    const categories = [
        { value: 'all', label: t('shop.categories.all') },
        { value: 'đồ-lưu-niệm', label: t('shop.categories.souvenirs') },
        { value: 'quần-áo', label: t('shop.categories.clothing') },
        { value: 'phụ-kiện', label: t('shop.categories.accessories') },
        { value: 'đặc-sản', label: t('shop.categories.specialties') },
        { value: 'thủ-công-mỹ-nghệ', label: t('shop.categories.handicraft') }
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
                        placeholder={t('shop.categories.select')}
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

                <Input
                    placeholder={t('shop.searchPlaceholder')}
                    prefix={<SearchOutlined />}
                    className="keyword-input"
                    style={{ height: '42px' }}
                    value={localSearchText}
                    onChange={(e) => setLocalSearchText(e.target.value)}
                    onPressEnter={handleKeyPress}
                />

                <Button type="primary" className="search-button" onClick={handleSearch}>
                    {t('shop.searchButton')}
                </Button>
            </div>
        </div>
    );
};

export default ShopSearchBar;
