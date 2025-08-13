import { Input, Button } from 'antd';
import { useState } from 'react';
import './SearchBarCommon.scss';

interface SearchBarCommonProps {
    onSearch: (keyword: string) => void;
    loading?: boolean;
    placeholder?: string;
    className?: string;
    buttonText?: string;
}

const SearchBarCommon = ({ onSearch, loading, placeholder, className, buttonText }: SearchBarCommonProps) => {
    const [keyword, setKeyword] = useState('');

    const handleSearch = () => {
        onSearch(keyword);
    };

    return (
        <div className={`search-bar-common${className ? ` ${className}` : ''}`}>
            <Input
                className="keyword-input"
                placeholder={placeholder || "Tìm kiếm..."}
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
            />
            <Button
                type="primary"
                onClick={handleSearch}
                loading={loading}
                style={{ marginLeft: 8, height: 40, fontSize: '16px', fontWeight: 600, padding: '0 24px' }}
            >
                {buttonText || "Tìm kiếm"}
            </Button>
        </div>
    );
};

export default SearchBarCommon;
