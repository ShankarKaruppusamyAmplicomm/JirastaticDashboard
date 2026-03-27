import React from 'react';
import { Users } from 'lucide-react';

/**
 * TabNavigation Component
 * Modern tab-based navigation for switching between different teams
 */
const TabNavigation = ({ teams, activeTeam, onTabChange, loading }) => {
    if (loading) {
        return (
            <div className="tab-navigation-skeleton">
                {[1, 2, 3].map(i => (
                    <div key={i} className="tab-skeleton pulse"></div>
                ))}
            </div>
        );
    }

    if (!teams || teams.length === 0) {
        return null;
    }

    return (
        <div className="tab-navigation-container">
            <div className="tab-navigation">
                {teams.map((team) => (
                    <button
                        key={team}
                        className={`tab-item ${activeTeam === team ? 'active' : ''}`}
                        onClick={() => onTabChange(team)}
                    >
                        <Users size={16} className="tab-icon" />
                        <span className="tab-text">{team}</span>
                        {activeTeam === team && <div className="tab-active-indicator" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabNavigation;
