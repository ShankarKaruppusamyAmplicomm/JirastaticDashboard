import React from 'react';
import { Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';

/**
 * DateRangePicker Component
 * Allows users to select predefined or custom date ranges
 */
const DateRangePicker = ({ startDate, endDate, onChange }) => {
    const presets = [
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 14 Days', days: 14 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 90 Days', days: 90 }
    ];

    const handlePresetClick = (days) => {
        const end = new Date();
        const start = subDays(end, days - 1);
        onChange({ startDate: start, endDate: end });
    };

    const handleCustomChange = (type, value) => {
        const newDate = new Date(value);
        if (type === 'start') {
            onChange({ startDate: newDate, endDate });
        } else {
            onChange({ startDate, endDate: newDate });
        }
    };

    return (
        <div className="date-range-picker" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', flexWrap: 'nowrap' }}>
            <select 
                className="input" 
                onChange={(e) => handlePresetClick(parseInt(e.target.value))}
                style={{ fontSize: '11px', padding: '2px 4px', minWidth: '100px', height: '24px' }}
                defaultValue=""
            >
                <option value="" disabled>Select Range</option>
                {presets.map(preset => (
                    <option key={preset.days} value={preset.days}>
                        {preset.label}
                    </option>
                ))}
            </select>

            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexWrap: 'nowrap' }}>
                <Calendar size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                    type="date"
                    className="input"
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => handleCustomChange('start', e.target.value)}
                    style={{ fontSize: '10px', padding: '2px 4px', width: '95px', height: '24px' }}
                />
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>to</span>
                <input
                    type="date"
                    className="input"
                    value={format(endDate, 'yyyy-MM-dd')}
                    onChange={(e) => handleCustomChange('end', e.target.value)}
                    style={{ fontSize: '10px', padding: '2px 4px', width: '95px', height: '24px' }}
                />
            </div>
        </div>
    );


};

export default DateRangePicker;
