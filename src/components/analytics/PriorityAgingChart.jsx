import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList
} from 'recharts';

const PriorityAgingChart = ({ bugs }) => {
    // Process Method: Group by Priority, then by Age Range
    const processData = () => {
        const isMobile = window.innerWidth < 400;
        const priorities = ['Highest', 'High', 'Medium', 'Low'];

        const dataRows = priorities.map(p => {
            const row = {
                name: p,
                displayName: isMobile ? p.substring(0, 4) : p,
                '0-7 Days (0-168 Hrs)': 0,
                '8-30 Days (169-720 Hrs)': 0,
                '30+ Days (>720 Hrs)': 0,
                total: 0
            };
            return row;
        });

        bugs.forEach(bug => {
            const ageHrs = bug.ageInHours ?? (bug.age * 24);
            const priority = bug.priority || 'Medium';
            const row = dataRows.find(d => d.name === priority);

            if (row) {
                if (ageHrs <= 168) row['0-7 Days (0-168 Hrs)']++;
                else if (ageHrs <= 720) row['8-30 Days (169-720 Hrs)']++;
                else row['30+ Days (>720 Hrs)']++;
                row.total++;
            }
        });

        return dataRows;
    };


    const data = processData();

    // Map labels for mobile
    const getMobileLabel = (label) => {
        if (label === '0-7 Days (0-168 Hrs)') return '0-7d';
        if (label === '8-30 Days (169-720 Hrs)') return '8-30d';
        if (label === '30+ Days (>720 Hrs)') return '30d+';
        return label;
    };

    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '0.5rem' }}>Priority Aging</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Age of open bugs by priority
            </p>

            <div style={{ height: 'var(--chart-height)', minHeight: '180px', width: '100%' }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                        <XAxis type="number" stroke="var(--color-text-tertiary)" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} />
                        <YAxis
                            dataKey="displayName"
                            type="category"
                            stroke="var(--color-text-tertiary)"
                            tick={{ fill: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 10 }}
                            width={50}
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
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="0-7 Days (0-168 Hrs)" stackId="a" fill="#10b981" barSize={32} />
                        <Bar dataKey="8-30 Days (169-720 Hrs)" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="30+ Days (>720 Hrs)" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]}>
                            <LabelList dataKey="total" position="right" fill="var(--color-text-secondary)" style={{ fontSize: '0.85rem', fontWeight: 600 }} offset={10} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PriorityAgingChart;
