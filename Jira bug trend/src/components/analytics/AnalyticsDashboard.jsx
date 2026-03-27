import React from 'react';
import MonthlyTrendChart from './MonthlyTrendChart';
import ClassificationCharts from './ClassificationCharts';
import PriorityAgingChart from './PriorityAgingChart';
import ShortTermAgingChart from './ShortTermAgingChart';
import ShortTermTrendChart from './ShortTermTrendChart';
import DetailedBugTable from './DetailedBugTable';

const AnalyticsDashboard = ({ teamName, metrics }) => {
    if (!metrics) return null;

    return (
        <div className="analytics-dashboard fade-in">
            <h2 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--color-primary)' }}>{teamName}</span>
                Advanced Analytics
            </h2>

            {/* Top Row: Monthly Trend & Priority Aging */}
            <div className="grid-2-col" style={{ marginBottom: '2rem' }}>
                <MonthlyTrendChart data={metrics.monthlyTrends || []} />
                <PriorityAgingChart bugs={metrics.detailedBugs || []} />
            </div>

            {/* Middle Row: Short-Term Aging (Current & Trends) */}
            <div className="grid-2-col" style={{ marginBottom: '2rem' }}>
                <ShortTermAgingChart bugs={metrics.detailedBugs || []} />
                <ShortTermTrendChart 
                    data={metrics.shortTermTrends || []} 
                    title="Short-Term Aging Trends"
                    subtitle="Day-wise volume by hour buckets"
                />
            </div>

            {/* Middle Row: Classifications */}
            <div style={{ marginBottom: '2rem' }}>
                <ClassificationCharts metrics={{ ...metrics, detailedBugs: metrics.detailedBugs || [] }} />
            </div>

            {/* Bottom Row: Detailed Table */}
            <div>
                <DetailedBugTable bugs={metrics.detailedBugs || []} />
            </div>

            <style>{`
                .grid-2-col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                @media (max-width: 1024px) {
                    .grid-2-col {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AnalyticsDashboard;
