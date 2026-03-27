import React from 'react';
import { Users, ChevronDown } from 'lucide-react';

/**
 * TeamSelector Component
 * A premium dropdown component for selecting teams
 */
const TeamSelector = ({ teams, activeTeam, onTeamChange, loading }) => {
    if (loading) {
        return (
            <div className="team-selector-skeleton pulse"></div>
        );
    }

    if (!teams || teams.length === 0) {
        return null;
    }

    return (
        <div className="team-selector-container">
            <div className="team-selector-label">
                <Users size={18} />
                <span>Select Team:</span>
            </div>
            <div className="team-selector-wrapper">
                <select
                    className="team-selector-select"
                    value={activeTeam || ''}
                    onChange={(e) => onTeamChange(e.target.value)}
                >
                    {teams.map((team) => (
                        <option key={team} value={team}>
                            {team}
                        </option>
                    ))}
                </select>
                <div className="team-selector-arrow">
                    <ChevronDown size={18} />
                </div>
            </div>
        </div>
    );
};

export default TeamSelector;
