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

  // Load CSV data from localStorage on mount
  useEffect(() => {
    const savedIssues = localStorage.getItem('jira_csv_issues');
    if (savedIssues) {
      try {
        const issues = JSON.parse(savedIssues);
        if (Array.isArray(issues) && issues.length > 0) {
          setCSVIssues(issues);
          const processedData = processProjectData(issues, dateRange);
          setProjectData(processedData);
        }
      } catch (err) {
        console.error('Error loading saved CSV data:', err);
        localStorage.removeItem('jira_csv_issues'); // Clear corrupted data
      }
    }
  }, []);

  // Re-process CSV data when date range changes
  useEffect(() => {
    if (csvIssues) {
      reprocessCSVData();
    }
  }, [dateRange]);

  const reprocessCSVData = () => {
    if (!csvIssues) return;

    setLoading(true);
    try {
      const processedData = processProjectData(csvIssues, dateRange);
      setProjectData(processedData);
    } catch (err) {
      console.error('Error re-processing CSV data:', err);
      setError('Failed to process CSV data with new date range');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVDataLoaded = (issues) => {
    setLoading(true);
    setError(null);

    try {
      // Store raw CSV issues in state and localStorage
      setCSVIssues(issues);
      localStorage.setItem('jira_csv_issues', JSON.stringify(issues));

      const processedData = processProjectData(issues, dateRange);
      setProjectData(processedData);
      setCSVModalOpen(false);
    } catch (err) {
      console.error('Error processing CSV data:', err);
      setError('Failed to process CSV data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">
          <BarChart2 size={48} style={{ display: 'inline', marginRight: '1rem', verticalAlign: 'middle' }} />
          Jira Bug Trend Dashboard
        </h1>
        <p className="header-subtitle">
          Track and analyze bug metrics from CSV data
        </p>
      </header>

      <div className="controls">
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />

        <button
          className="btn btn-primary"
          onClick={() => setCSVModalOpen(true)}
        >
          <Upload size={18} />
          Upload CSV
        </button>
      </div>

      {!csvIssues && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-xl)',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-xl)',
          color: 'var(--color-primary-light)'
        }}>
          � Upload a CSV file to get started. Click "Upload CSV" to import your bug data.
        </div>
      )}

      {csvIssues && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-md)',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-xl)',
          color: '#22c55e'
        }}>
          ✅ Displaying data from uploaded CSV file ({csvIssues.length} issues). Upload a new file to update.
        </div>
      )}

      {error && (
        <div className="error">
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <button
          className={`btn ${viewMode === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('overview')}
        >
          <LayoutDashboard size={18} /> Overview
        </button>
        <button
          className={`btn ${viewMode === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('analytics')}
        >
          <BarChart2 size={18} /> Advanced Analytics
        </button>
      </div>

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
