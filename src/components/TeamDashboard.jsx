import React from 'react';
import MetricCard from './MetricCard';
import TrendChart from './TrendChart';
import { Bug, CheckCircle, Clock, Users } from 'lucide-react';

/**
 * TeamDashboard Component
 * Displays all metrics and trends for a single team
 */
const TeamDashboard = ({ teamName, metrics, index }) => {
    const teamIcons = {
        'Automation Team': '🤖',
        'UAT Team': '✅',
        'System Testing Team': '🔬'
    };

    const teamColors = {
        'Automation Team': '#6366f1',
        'UAT Team': '#8b5cf6',
        'System Testing Team': '#ec4899'
    };

    // Prepare chart data combining open and closed trends
    const combinedTrendData = metrics.openTrend.map((openItem, idx) => ({
        date: openItem.date,
        open: openItem.count,
        resolved: metrics.resolvedTrend[idx]?.count || 0
    }));

    return (
        <div className="team-dashboard" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="team-header">
                <div
                    className="team-icon"
                    style={{ background: `linear-gradient(135deg, ${teamColors[teamName]}, ${teamColors[teamName]}dd)` }}
                >
                    {teamIcons[teamName]}
                </div>
                <div className="team-info">
                    <h3>{teamName}</h3>
                    <p className="team-stats">
                        <Users size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        Total Bugs: {metrics.totalBugs}
                    </p>
                </div>
            </div>

            <div className="metrics-grid">
                <MetricCard
                    label="Open"
                    value={metrics.openCount}
                    color="warning"
                    icon={Bug}
                />
                <MetricCard
                    label="Closed / Fixed"
                    value={metrics.closedCount}
                    color="success"
                    icon={CheckCircle}
                />
                <MetricCard
                    label="Avg. Time to Close"
                    value={metrics.avgTimeToCloseFormatted}
                    color="primary"
                    icon={Clock}
                />
            </div>

            <TrendChart
                data={combinedTrendData}
                title={`${teamName} - Daily Bug Trends`}
                subtitle="Open vs Resolved bugs over time"
                lines={[
                    { dataKey: 'open', name: 'Open' },
                    { dataKey: 'resolved', name: 'Resolved' }
                ]}
            />
        </div>
    );
};

export default TeamDashboard;
