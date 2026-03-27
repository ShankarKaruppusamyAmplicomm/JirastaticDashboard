import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList
} from 'recharts';

/**
 * ShortTermTrendChart Component
 * Displays the day-wise trend for short-term aging buckets
 */
const ShortTermTrendChart = ({ data, title, subtitle }) => {
    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '0.5rem' }}>{title || 'Short-Term Aging Trends'}</h3>
            {subtitle && (
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {subtitle}
                </p>
            )}

            <div style={{ height: 350, width: '100%' }}>
                <ResponsiveContainer>
                    <LineChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Increased top margin for labels
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="var(--color-text-tertiary)"
                            tick={{ fill: 'var(--color-text-secondary)', fontSize: '0.8rem' }}
                        />
                        <YAxis 
                            stroke="var(--color-text-tertiary)"
                            tick={{ fill: 'var(--color-text-secondary)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(30, 35, 48, 0.95)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                color: 'var(--color-text-primary)'
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        
                        <Line type="monotone" dataKey="0-4 Hrs" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                            <LabelList dataKey="0-4 Hrs" position="top" fill="var(--color-text-secondary)" style={{ fontSize: '0.8rem' }} />
                        </Line>
                        <Line type="monotone" dataKey="4-8 Hrs" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                            <LabelList dataKey="4-8 Hrs" position="top" fill="var(--color-text-secondary)" style={{ fontSize: '0.8rem' }} />
                        </Line>
                        <Line type="monotone" dataKey="8-12 Hrs" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                            <LabelList dataKey="8-12 Hrs" position="top" fill="var(--color-text-secondary)" style={{ fontSize: '0.8rem' }} />
                        </Line>
                        <Line type="monotone" dataKey="12-24 Hrs" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                            <LabelList dataKey="12-24 Hrs" position="top" fill="var(--color-text-secondary)" style={{ fontSize: '0.8rem' }} />
                        </Line>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ShortTermTrendChart;
