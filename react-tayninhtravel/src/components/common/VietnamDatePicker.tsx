import React from 'react';
import { DatePicker, DatePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { getVietnamNow, toVietnamTime } from '../../utils/vietnamTimezone';

interface VietnamDatePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
    value?: Date | string | null;
    onChange?: (date: Date | null, dateString: string) => void;
    showTime?: boolean;
}

/**
 * DatePicker component that handles Vietnam timezone automatically
 */
const VietnamDatePicker: React.FC<VietnamDatePickerProps> = ({
    value,
    onChange,
    showTime = false,
    format,
    placeholder,
    ...props
}) => {
    // Convert value to dayjs object in Vietnam timezone
    const dayjsValue = React.useMemo(() => {
        if (!value) return null;

        const date = typeof value === 'string' ? new Date(value) : value;
        const vietnamTime = toVietnamTime(date);
        return dayjs(vietnamTime);
    }, [value]);

    // Handle date change
    const handleChange = (date: Dayjs | null, dateString: string | string[]) => {
    const handleChange = (date: Dayjs | null, dateString: string | string[]) => {
        if (!date) {
            onChange?.(null, '');
            return;
        }

        // Convert dayjs to Date in Vietnam timezone
        const vietnamDate = date.toDate();
        const stringValue = Array.isArray(dateString) ? dateString[0] || '' : dateString;
        onChange?.(vietnamDate, stringValue);
    };

    // Default format based on showTime
    const defaultFormat = showTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY';
    const dateFormat = format || defaultFormat;

    // Default placeholder
    const defaultPlaceholder = showTime ? 'Chọn ngày và giờ' : 'Chọn ngày';
    const pickerPlaceholder = placeholder || defaultPlaceholder;

    return (
        <DatePicker
            {...props}
            value={dayjsValue}
            onChange={handleChange}
            format={dateFormat}
            placeholder={pickerPlaceholder}
            showTime={showTime}
            // Disable past dates by default for tour booking
            disabledDate={(current) => {
                if (!current) return false;
                const today = dayjs(getVietnamNow()).startOf('day');
                return current.isBefore(today);
            }}
        />
    );
};

export default VietnamDatePicker;
