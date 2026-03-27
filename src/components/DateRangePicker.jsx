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
        <div className="date-range-picker">
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    {presets.map(preset => (
                        <button
                            key={preset.days}
                            className="btn btn-secondary"
                            onClick={() => handlePresetClick(preset.days)}
                            style={{ fontSize: 'var(--font-size-sm)' }}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <Calendar size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                    <input
                        type="date"
                        className="input"
                        value={format(startDate, 'yyyy-MM-dd')}
                        onChange={(e) => handleCustomChange('start', e.target.value)}
                        style={{ fontSize: 'var(--font-size-sm)' }}
                    />
                    <span style={{ color: 'var(--color-text-tertiary)' }}>to</span>
                    <input
                        type="date"
                        className="input"
                        value={format(endDate, 'yyyy-MM-dd')}
                        onChange={(e) => handleCustomChange('end', e.target.value)}
                        style={{ fontSize: 'var(--font-size-sm)' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;
