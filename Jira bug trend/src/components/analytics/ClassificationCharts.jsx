import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
    // Environment
    PROD: '#ef4444',
    UAT: '#f59e0b',
    QA: '#6366f1',
    Unknown: '#6b7280',
    // Status
    Open: '#3b82f6',
    Resolved: '#10b981',
    Invalid: '#9ca3af',
    Duplicate: '#fcd34d',
    // Source
    Customer: '#ec4899',
    Internal: '#8b5cf6'
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip-custom" style={{
                background: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid var(--color-border)',
                padding: '10px',
                borderRadius: '8px'
            }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
                <p style={{ margin: 0, color: payload[0].payload.fill }}>
                    Count: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const DonutChart = ({ title, data, dataKey }) => (
    <div style={{ flex: 1, minWidth: '250px' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>{title}</h4>
        <div style={{ height: 250 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Unknown} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const ClassificationCharts = ({ metrics }) => {
    // Helper to sort data by value descending
    const sortData = (data) => [...data].sort((a, b) => b.value - a.value);

    const envData = sortData([
        { name: 'PROD', value: metrics.byEnvironment.PROD || 0 },
        { name: 'UAT', value: metrics.byEnvironment.UAT || 0 },
        { name: 'QA', value: metrics.byEnvironment.QA || 0 },
        { name: 'Unknown', value: metrics.byEnvironment.Unknown || 0 }
    ]).filter(d => d.value > 0);

    const priorityData = sortData([
        { name: 'Highest', value: metrics.byPriority.Highest || 0 },
        { name: 'High', value: metrics.byPriority.High || 0 },
        { name: 'Medium', value: metrics.byPriority.Medium || 0 },
        { name: 'Low', value: metrics.byPriority.Low || 0 }
    ]).filter(d => d.value > 0);

    const sourceData = sortData([
        { name: 'Customer', value: metrics.bySource.Customer || 0 },
        { name: 'Internal', value: metrics.bySource.Internal || 0 }
    ]).filter(d => d.value > 0);

    const statusData = sortData([
        { name: 'Open', value: metrics.byStatus.Open || 0 },
        { name: 'Resolved', value: metrics.byStatus.Resolved || 0 },
        { name: 'Invalid', value: metrics.byStatus.Invalid || 0 },
        { name: 'Duplicate', value: metrics.byStatus.Duplicate || 0 }
    ]).filter(d => d.value > 0);

    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem' }}>Classifications</h3>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2rem',
                justifyContent: 'space-between'
            }}>
                <DonutChart title="by Environment" data={envData} />
                <DonutChart title="by Priority" data={priorityData} />
                <DonutChart title="by Source" data={sourceData} />
                <DonutChart title="by Status" data={statusData} />
            </div>
        </div>
    );
};

export default ClassificationCharts;
