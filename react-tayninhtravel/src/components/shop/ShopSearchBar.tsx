import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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
        <div className={className || "search-bar-common"}>
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
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
                style={{ marginLeft: 8 }}
            >
                {buttonText || "Tìm kiếm"}
            </Button>
        </div>
    );
};

export default SearchBarCommon;
