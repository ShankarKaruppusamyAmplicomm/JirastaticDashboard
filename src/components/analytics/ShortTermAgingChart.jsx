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

/**
 * ShortTermAgingChart Component
 * Displays aging of bugs in 0-24 hour buckets on the Y-axis, stacked by priority
 */
const ShortTermAgingChart = ({ bugs }) => {
    // Process Method: Group by Hour Range, then by Priority
    const processData = () => {
        const buckets = [
            { name: '0-4 Hrs', min: 0, max: 4, Highest: 0, High: 0, Medium: 0, Low: 0, total: 0 },
            { name: '4-8 Hrs', min: 4, max: 8, Highest: 0, High: 0, Medium: 0, Low: 0, total: 0 },
            { name: '8-12 Hrs', min: 8, max: 12, Highest: 0, High: 0, Medium: 0, Low: 0, total: 0 },
            { name: '12-24 Hrs', min: 12, max: 24, Highest: 0, High: 0, Medium: 0, Low: 0, total: 0 },
            { name: '24+ Hrs', min: 24, max: Infinity, Highest: 0, High: 0, Medium: 0, Low: 0, total: 0 }
        ];

        bugs.forEach(bug => {
            const ageHrs = bug.ageInHours ?? (bug.age * 24);
            const priority = bug.priority || 'Medium';
            const bucket = buckets.find(b => ageHrs > b.min && ageHrs <= b.max) || 
                          (ageHrs <= 0 ? buckets[0] : null); // Handle edge case

            if (bucket && bucket[priority] !== undefined) {
                bucket[priority]++;
                bucket.total++;
            }
        });

        return buckets.map(b => ({ ...b })); // Simple clone
    };

    const data = processData();

    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '0.5rem' }}>Short-Term Aging (Hours)</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Bug volume by hour intervals and priority
            </p>

            <div style={{ height: 350, width: '100%' }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 40, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                        <XAxis type="number" stroke="var(--color-text-tertiary)" tick={{ fill: 'var(--color-text-secondary)' }} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke="var(--color-text-tertiary)"
                            tick={{ fill: 'var(--color-text-secondary)', fontWeight: 600 }}
                            width={100}
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
                        {/* Stacked by Priority */}
                        <Bar dataKey="Highest" stackId="a" fill="#ef4444" barSize={32} name="Highest Priority" />
                        <Bar dataKey="High" stackId="a" fill="#f59e0b" name="High Priority" />
                        <Bar dataKey="Medium" stackId="a" fill="#3b82f6" name="Medium Priority" />
                        <Bar dataKey="Low" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} name="Low Priority">
                            <LabelList dataKey="total" position="right" fill="var(--color-text-secondary)" style={{ fontSize: '0.85rem', fontWeight: 600 }} offset={10} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ShortTermAgingChart;
