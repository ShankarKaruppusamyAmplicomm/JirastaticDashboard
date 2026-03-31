import React, { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { BarChart2, LayoutDashboard, Upload } from 'lucide-react';
import TeamDashboard from './components/TeamDashboard';
import DateRangePicker from './components/DateRangePicker';
import CSVUploader from './components/CSVUploader';
import TrendChart from './components/TrendChart';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import { processProjectData } from './services/dataProcessor';
import './index.css';

function App() {
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    label: 'Last 30 Days'
  });

  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [csvModalOpen, setCSVModalOpen] = useState(false);
  const [csvIssues, setCSVIssues] = useState(null); // Store raw CSV issues for re-filtering
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('All Tenants');


  // Load CSV data from localStorage on mount
  useEffect(() => {
    const savedIssues = localStorage.getItem('jira_csv_issues');
    if (savedIssues) {
      try {
        const issues = JSON.parse(savedIssues);
        if (Array.isArray(issues) && issues.length > 0) {
          setCSVIssues(issues);
        }
      } catch (err) {
        console.error('Error loading saved CSV data:', err);
        localStorage.removeItem('jira_csv_issues'); // Clear corrupted data
      }
    }
  }, []);

  // Filter and process data
  const filteredIssues = React.useMemo(() => {
    if (!csvIssues) return [];
    return csvIssues.filter(issue => {
      const matchesSearch = !searchTerm || issue.key.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTenant = selectedTenant === 'All Tenants' || (issue.fields.tenant || 'Global') === selectedTenant;
      return matchesSearch && matchesTenant;
    });
  }, [csvIssues, searchTerm, selectedTenant]);

  const tenants = React.useMemo(() => {
    if (!csvIssues) return ['All Tenants'];
    const uniqueTenants = Array.from(new Set(csvIssues.map(i => i.fields.tenant || 'Global')));
    return ['All Tenants', ...uniqueTenants.sort()];
  }, [csvIssues]);

  useEffect(() => {
    if (csvIssues) {
      setLoading(true);
      try {
        const processedData = processProjectData(filteredIssues, dateRange);
        setProjectData(processedData);
      } finally {
        setLoading(false);
      }
    }
  }, [filteredIssues, dateRange]);

  const handleCSVDataLoaded = (issues) => {
    setCSVIssues(issues);
    localStorage.setItem('jira_csv_issues', JSON.stringify(issues));
    setCSVModalOpen(false);
  };

  const handleCSVError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div className="header-brand">
            <BarChart2 size={24} style={{ color: 'var(--color-primary-light)' }} />
            <h1 className="header-title">Jira Analytics</h1>
          </div>
          
          <div className="header-main-controls">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={setDateRange}
            />

            <div className="view-toggle desktop-only">
              <button
                className={`btn ${viewMode === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('overview')}
              >
                Overview
              </button>
              <button
                className={`btn ${viewMode === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('analytics')}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        <div className="header-row bottom-row">
          <div className="controls-group">
            <input 
              className="input" 
              placeholder="ID prefix..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100px' }}
            />
            <select 
              className="input"
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              style={{ maxWidth: '120px' }}
            >
              {tenants.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            
            <button className="btn btn-primary btn-sm" onClick={() => setCSVModalOpen(true)}>
              <Upload size={14} /> Upload
            </button>
          </div>
        </div>

        <div className="header-row mobile-only-row">
          <div className="view-toggle mobile-only">
            <button
              className={`btn ${viewMode === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </button>
            <button
              className={`btn ${viewMode === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('analytics')}
            >
              Analytics
            </button>
          </div>
        </div>
      </header>






      {!csvIssues && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: 'var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-light)', fontSize: '13px' }}>
          💡 Click "Upload" in the header to import your Jira CSV.
        </div>
      )}

      {csvIssues && !searchTerm && selectedTenant === 'All Tenants' && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)', background: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', color: 'var(--color-success)', fontSize: '12px' }}>
          ✅ Displaying data from uploaded CSV file ({csvIssues.length} issues).
        </div>
      )}

      {csvIssues && (searchTerm || selectedTenant !== 'All Tenants') && filteredIssues.length > 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)', background: 'rgba(10, 132, 255, 0.1)', border: '1px solid rgba(10, 132, 255, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', color: 'var(--color-primary)', fontSize: '12px' }}>
          🔍 Showing {filteredIssues.length} of {csvIssues.length} issues matching filters.
        </div>
      )}

      {csvIssues && filteredIssues.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', background: 'rgba(255, 69, 58, 0.1)', border: '1px solid rgba(255, 69, 58, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)', fontSize: '12px' }}>
          ⚠️ No issues match your current filters.
        </div>
      )}


      {error && (
        <div className="error" style={{ marginBottom: 'var(--spacing-md)' }}>
          ⚠️ {error}
        </div>
      )}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Processing CSV data...</p>
        </div>
      ) : projectData ? (

        viewMode === 'overview' ? (
          <>
            {/* Project Dashboard */}
            <TeamDashboard
              teamName="Project Overview"
              metrics={projectData}
              index={0}
            />

            {/* Project Trend Chart */}
            <TrendChart
              data={projectData.openTrend.map((item, idx) => ({
                date: item.date,
                Open: item.count,
                Resolved: projectData.resolvedTrend[idx]?.count || 0
              }))}
              title="Daily Bug Trends"
              subtitle="Compare open vs. closed bugs over time"
              lines={[
                { dataKey: 'Open', name: 'Open Bugs', color: 'var(--color-warning)' },
                { dataKey: 'Resolved', name: 'Resolved Bugs', color: 'var(--color-success)' }
              ]}
            />
          </>
        ) : (
          <AnalyticsDashboard
            teamName="Project"
            metrics={projectData}
          />
        )
      ) : null}

      {/* CSV Upload Modal */}
      {csvModalOpen && (
        <div className="modal-overlay" onClick={() => {
          setCSVModalOpen(false);
          setError(null); // Clear any previous errors
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload CSV File</h2>
              <button className="modal-close" onClick={() => {
                setCSVModalOpen(false);
                setError(null); // Clear any previous errors
              }}>×</button>
            </div>
            <div className="modal-body">
              <CSVUploader
                onDataLoaded={handleCSVDataLoaded}
                onError={handleCSVError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
