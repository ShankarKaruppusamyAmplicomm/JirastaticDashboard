import React, { useState, useEffect } from 'react';
import { X, Settings, Save } from 'lucide-react';

/**
 * ConfigModal Component
 * Modal for configuring Jira API settings
 */
const ConfigModal = ({ isOpen, onClose, onSave }) => {
    const [config, setConfig] = useState({
        domain: '',
        email: '',
        apiToken: '',
        projectKey: '',
        teamFieldId: 'labels'
    });

    useEffect(() => {
        // Load saved config from localStorage
        const savedConfig = localStorage.getItem('jiraConfig');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, []);

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem('jiraConfig', JSON.stringify(config));
        onSave(config);
        onClose();
    };

    const handleUseMockData = () => {
        localStorage.removeItem('jiraConfig');
        onSave(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        <Settings size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Jira Configuration
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Jira Domain</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="yourcompany.atlassian.net"
                            value={config.domain}
                            onChange={(e) => handleChange('domain', e.target.value)}
                            style={{ width: '100%' }}
                        />
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                            Your Jira instance domain (without https://)
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="your-email@example.com"
                            value={config.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">API Token</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Your Jira API token"
                            value={config.apiToken}
                            onChange={(e) => handleChange('apiToken', e.target.value)}
                            style={{ width: '100%' }}
                        />
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                            Generate at: <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Atlassian API Tokens</a>
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Project Key</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="PROJ"
                            value={config.projectKey}
                            onChange={(e) => handleChange('projectKey', e.target.value)}
                            style={{ width: '100%' }}
                        />
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                            The project key to filter bugs from
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Team Field (Optional)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder='labels (default) or custom field name'
                            value={config.teamFieldId}
                            onChange={(e) => handleChange('teamFieldId', e.target.value)}
                            style={{ width: '100%' }}
                        />
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                            Optional: This field is not used in the current version. The dashboard shows project-wide bug analytics.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            style={{ flex: 1 }}
                        >
                            <Save size={18} />
                            Save Configuration
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleUseMockData}
                            style={{ flex: 1 }}
                        >
                            Use Mock Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigModal;
