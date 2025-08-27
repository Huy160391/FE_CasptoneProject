import { Button, Select, AutoComplete } from 'antd';
import { tourDetailsService, TourDetail } from '../services/tourDetailsService';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './TourSearchBar.scss';

interface TourSearchBarProps {
    onSearchTermChange?: (term: string, fromDate?: string, toDate?: string) => void;
    searchTerm?: string;
    scheduleDay?: string;
}

const { Option } = Select;

const TourSearchBar = ({ onSearchTermChange, searchTerm, scheduleDay }: TourSearchBarProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [keyword, setKeyword] = useState<string>(searchTerm || '');
    const [scheduleDayState, setScheduleDayState] = useState<string>(scheduleDay || '');
    const [options, setOptions] = useState<{ value: string }[]>([]);
    const [suggestionTours, setSuggestionTours] = useState<TourDetail[]>([]);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        setKeyword(searchTerm || '');
    }, [searchTerm]);

    useEffect(() => {
        setScheduleDayState(scheduleDay || '');
    }, [scheduleDay]);

    useEffect(() => {
        if (!keyword && !scheduleDayState) {
            setOptions([]);
            return;
        }
        setFetching(true);
        tourDetailsService.getPublicTourDetailsList({
            searchTerm: keyword,
            scheduleDay: scheduleDayState,
            pageSize: 5
        }).then(res => {
            if (res.success && res.data) {
                setOptions(res.data.map(tour => ({ value: tour.title })));
                setSuggestionTours(res.data);
            } else {
                setOptions([]);
                setSuggestionTours([]);
            }
        }).finally(() => setFetching(false));
    }, [keyword, scheduleDayState]);

    const handleSearch = () => {
        if (onSearchTermChange) {
            onSearchTermChange(keyword, scheduleDayState);
        }
        if (window.location.pathname === '/' || window.location.pathname === '/home') {
            navigate('/tours', { state: { searchTerm: keyword, scheduleDay: scheduleDayState } });
        }
    };

    return (
        <div className="tour-search-bar">
            <div className="search-container">
                <div className="search-item date-range" style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                    <Select
                        value={scheduleDayState}
                        onChange={setScheduleDayState}
                        style={{ width: 140 }}
                        placeholder={t('tour.search.scheduleDayPlaceholder')}
                    >
                        <Option value="">{t('tour.search.scheduleDayAll')}</Option>
                        <Option value="Sunday">{t('tour.search.scheduleDaySunday')}</Option>
                        <Option value="Saturday">{t('tour.search.scheduleDaySaturday')}</Option>
                    </Select>
                    <AutoComplete
                        options={options}
                        value={keyword}
                        onSelect={value => {
                            setKeyword(value);
                            const found = suggestionTours.find(tour => tour.title === value);
                            if (found) {
                                navigate(`/tour-details/${found.id}`);
                            } else {
                                if (onSearchTermChange) onSearchTermChange(value, scheduleDayState);
                            }
                        }}
                        onSearch={setKeyword}
                        style={{ height: '42px', flexGrow: 1, marginLeft: 0, display: 'flex', alignItems: 'center', padding: 0, lineHeight: '42px' }}
                        placeholder={t('tour.search.keywordPlaceholder')}
                        notFoundContent={fetching ? <span>{t('tour.search.loadingSuggestion')}</span> : <span>{t('tour.search.noSuggestion')}</span>}
                        allowClear
                    />
                    <Button type="primary" className="search-button" onClick={handleSearch}>
                        {t('tour.search.searchButton')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TourSearchBar;
