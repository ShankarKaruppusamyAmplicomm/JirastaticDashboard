import React, { useState, useMemo } from 'react';
import { ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const DetailedBugTable = ({ bugs }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });

    const sortedBugs = useMemo(() => {
        let sortableBugs = [...bugs];
        if (sortConfig !== null) {
            sortableBugs.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Special handling for priority (use original numeric value if available)
                if (sortConfig.key === 'priority') {
                    // Try to find the numeric priority value from the original bug object if possible
                    // However, processAnalyticsData already maps priorityVal
                    aVal = a.priorityVal || 0;
                    bVal = b.priorityVal || 0;
                }

                // Null checks
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (aVal < bVal) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableBugs;
    }, [bugs, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronsUpDown size={14} style={{ marginLeft: '4px', opacity: 0.3 }} />;
        }
        return sortConfig.direction === 'asc' 
            ? <ChevronUp size={14} style={{ marginLeft: '4px', color: 'var(--color-primary)' }} />
            : <ChevronDown size={14} style={{ marginLeft: '4px', color: 'var(--color-primary)' }} />;
    };

    const Th = ({ label, sortKey, style = {} }) => (
        <th 
            style={{ 
                padding: '1rem', 
                borderBottom: '1px solid var(--color-border)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background 0.2s',
                ...style 
            }}
            onClick={() => requestSort(sortKey)}
            className="sortable-header"
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {label}
                {getSortIcon(sortKey)}
            </div>
        </th>
    );

    return (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
            <h3 style={{ marginBottom: '1rem' }}>Detailed Bug List</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left' }}>
                            <Th label="Ticket Number" sortKey="key" />
                            <Th label="Priority" sortKey="priority" />
                            <Th label="Status" sortKey="status" />
                            <Th label="Assignee" sortKey="assignee" />
                            <Th label="Environment" sortKey="environment" />
                            <Th label="Age (Days)" sortKey="age" />
                            <Th label="Age (Hrs)" sortKey="ageInHours" />
                            <Th label="Resolved On" sortKey="resolutiondate" />
                            <Th label="Summary" sortKey="summary" />
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBugs.map((bug) => (
                            <tr key={bug.key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--color-primary-light)' }}>{bug.key}</span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                    <span className={`priority-badge priority-${bug.priority.toLowerCase()}`}>
                                        {bug.priority}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                    <span className={`status-badge status-${bug.status.toLowerCase()}`}>
                                        {bug.status}
                                    </span>
                                    {bug.rawStatus && (
                                        <span style={{ fontSize: '0.7em', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                                            ({bug.rawStatus})
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                            {bug.assignee.charAt(0).toUpperCase()}
                                        </div>
                                        {bug.assignee}
                                    </div>
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: bug.environment === 'PROD' ? 'rgba(239, 68, 68, 0.2)' : bug.environment === 'UAT' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                        color: bug.environment === 'PROD' ? 'var(--color-danger-light)' : bug.environment === 'UAT' ? 'var(--color-warning-light)' : 'var(--color-primary-light)',
                                        fontSize: '0.8rem'
                                    }}>
                                        {bug.environment}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>{bug.age} d</td>
                                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                                    <span style={{
                                        fontWeight: 600,
                                        color: bug.ageInHours > 720 ? 'var(--color-danger-light)' : bug.ageInHours > 168 ? 'var(--color-warning-light)' : 'var(--color-success-light)'
                                    }}>
                                        {(bug.ageInHours || 0).toLocaleString()} hrs
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                    {bug.resolutiondate || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>—</span>}
                                </td>
                                <td style={{ padding: '0.75rem 1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {bug.summary}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`
        .sortable-header:hover {
            background: rgba(255, 255, 255, 0.1) !important;
        }
        .priority-badge { padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; }
        .priority-highest { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        .priority-high { background: rgba(249, 115, 22, 0.2); color: #fdba74; }
        .priority-medium { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
        .priority-low { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
        
        .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
        .status-open { background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
        .status-resolved { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
        .status-invalid { background: rgba(107, 114, 128, 0.15); color: #d1d5db; border: 1px solid rgba(107, 114, 128, 0.3); }
        .status-duplicate { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
      `}</style>
        </div>
    );
};

export default DetailedBugTable;
