import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

/**
 * TrendChart Component
 * Displays line chart for bug trends over time
 */
const TrendChart = ({ data, title, subtitle, lines }) => {
    // Transform data for recharts
    const chartData = data.map(item => ({
        ...item,
        dateFormatted: format(parseISO(item.date), 'MMM dd')
    }));

    const colors = {
        open: '#f59e0b',
        Resolved: '#10b981',
        'Automation Team': '#6366f1',
        'UAT Team': '#8b5cf6',
        'System Testing Team': '#ec4899'
    };

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">{title}</h3>
                {subtitle && <p className="chart-subtitle">{subtitle}</p>}
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis
                        dataKey="dateFormatted"
                        stroke="var(--color-text-tertiary)"
                        style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis
                        stroke="var(--color-text-tertiary)"
                        style={{ fontSize: '0.875rem' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                    <Legend
                        wrapperStyle={{
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.875rem'
                        }}
                    />
                    {lines.map((line, index) => (
                        <Line
                            key={line.dataKey}
                            type="monotone"
                            dataKey={line.dataKey}
                            name={line.name}
                            stroke={colors[line.dataKey] || colors[line.name] || '#6366f1'}
                            strokeWidth={2}
                            dot={{ fill: colors[line.dataKey] || colors[line.name] || '#6366f1', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
