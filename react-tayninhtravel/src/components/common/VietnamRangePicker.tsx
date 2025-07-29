import React from 'react';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { getVietnamNow, toVietnamTime } from '../../utils/vietnamTimezone';

const { RangePicker } = DatePicker;

interface VietnamRangePickerProps {
    value?: [Date | null, Date | null] | null;
    onChange?: (dates: [Date | null, Date | null] | null, dateStrings: [string, string]) => void;
    format?: string;
    placeholder?: [string, string];
    showTime?: boolean;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    allowClear?: boolean;
}

/**
 * RangePicker component that handles Vietnam timezone automatically
 */
const VietnamRangePicker: React.FC<VietnamRangePickerProps> = ({
    value,
    onChange,
    format,
    placeholder,
    showTime = false,
    className,
    style,
    disabled,
    allowClear = true,
    ...props
}) => {
    // Convert value to dayjs objects in Vietnam timezone
    const dayjsValue = React.useMemo((): [Dayjs | null, Dayjs | null] | null => {
        if (!value || !value[0] || !value[1]) return null;
        
        const startDate = toVietnamTime(value[0]);
        const endDate = toVietnamTime(value[1]);
        
        return [dayjs(startDate), dayjs(endDate)];
    }, [value]);

    // Handle date range change
    const handleChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
        if (!dates || !dates[0] || !dates[1]) {
            onChange?.(null, ['', '']);
            return;
        }

        // Convert dayjs objects to Date objects in Vietnam timezone
        const startDate = dates[0].toDate();
        const endDate = dates[1].toDate();
        
        onChange?.([startDate, endDate], dateStrings);
    };

    // Default format based on showTime
    const defaultFormat = showTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY';
    const dateFormat = format || defaultFormat;

    // Default placeholder
    const defaultPlaceholder: [string, string] = showTime 
        ? ['Từ ngày giờ', 'Đến ngày giờ'] 
        : ['Từ ngày', 'Đến ngày'];
    const pickerPlaceholder = placeholder || defaultPlaceholder;

    return (
        <RangePicker
            {...props}
            value={dayjsValue}
            onChange={handleChange}
            format={dateFormat}
            placeholder={pickerPlaceholder}
            showTime={showTime}
            className={className}
            style={style}
            disabled={disabled}
            allowClear={allowClear}
            // Disable past dates by default
            disabledDate={(current) => {
                if (!current) return false;
                const today = dayjs(getVietnamNow()).startOf('day');
                return current.isBefore(today);
            }}
        />
    );
};

export default VietnamRangePicker;
