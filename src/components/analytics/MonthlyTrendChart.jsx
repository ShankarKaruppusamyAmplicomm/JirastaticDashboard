import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LabelList,
    ResponsiveContainer
} from 'recharts';

const MonthlyTrendChart = ({ data }) => {
    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '0.5rem' }}>Monthly Bug Trends</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Total bugs raised vs resolved per month
            </p>

            <div style={{ height: 'var(--chart-height)', minHeight: '180px', width: '100%' }}>

                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{ top: 25, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="var(--color-text-tertiary)"
                            tick={{ fill: 'var(--color-text-secondary)' }}
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
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="raised" name="Raised" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="raised" position="top" fill="var(--color-text-secondary)" style={{ fontSize: '0.8rem' }} />
                        </Bar>
                        <Bar dataKey="resolved" name="Resolved" fill="var(--color-success)" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="resolved" position="top" fill="var(--color-text-secondary)" style={{ fontSize: '0.8rem' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlyTrendChart;
