import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * MetricCard Component
 * Displays a single metric with value, label, and optional trend
 */
const MetricCard = ({ label, value, trend, color = 'primary', icon: Icon }) => {
    const getTrendIcon = () => {
        if (!trend) return null;

        if (trend > 0) {
            return <TrendingUp size={16} />;
        } else if (trend < 0) {
            return <TrendingDown size={16} />;
        }
        return <Minus size={16} />;
    };

    const getTrendClass = () => {
        if (!trend) return '';
        return trend > 0 ? 'positive' : trend < 0 ? 'negative' : '';
    };

    const getColorClass = () => {
        const colorMap = {
            primary: 'var(--color-primary)',
            success: 'var(--color-success)',
            warning: 'var(--color-warning)',
            danger: 'var(--color-danger)'
        };
        return colorMap[color] || colorMap.primary;
    };

    return (
        <div className="metric-card">
            <div className="metric-label">
                {Icon && <Icon size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />}
                {label}
            </div>
            <div className="metric-value" style={{ color: getColorClass() }}>
                {value}
            </div>
            {trend !== undefined && trend !== null && (
                <div className={`metric-change ${getTrendClass()}`}>
                    {getTrendIcon()}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
    );
};

export default MetricCard;
