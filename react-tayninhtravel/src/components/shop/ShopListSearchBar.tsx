import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './ShopListSearchBar.scss';

interface ShopListSearchBarProps {
    onSearch: (searchTerm: string) => void;
}

const ShopListSearchBar: React.FC<ShopListSearchBarProps> = ({ onSearch }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    return (
        <div className="shop-search-bar">
            <div className="search-container">
                <div className="search-item search">
                    <Input
                        size="large"
                        placeholder={t('shopList.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onPressEnter={handleSearch}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                </div>
                <div className="search-item button">
                    <Button
                        type="primary"
                        size="large"
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                    >
                        {t('common.search')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ShopListSearchBar;
