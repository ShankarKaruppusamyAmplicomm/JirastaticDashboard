import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, fontSize: '12px', margin: '4px 0' }}>
            {entry.name}: {entry.value}{entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const HealthAnalytics = ({ healthData }) => {
  if (!healthData) return null;

  const { platformHealth, velocityTrend, clientHealth, teamHealth, teamVelocityTrend } = healthData;

  // Use a fixed set of bright, distinct colors for teams
  const COLORS = ['#0A84FF', '#30D158', '#BF5AF2', '#FF9F0A', '#FF375F', '#64D2FF', '#FFD60A', '#5E5CE6'];

  return (
    <div className="analytics-section">
      <div className="chart-row">
        {/* Platform Health */}
        <div className="glass-card chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Platform Health (P0-P2)</h3>
            <p className="chart-subtitle">Daily Tickets Opened vs Resolved</p>
          </div>
          <div style={{ height: 'var(--chart-height)', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={platformHealth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10} 
                  tickFormatter={(str) => str.split('-').slice(1).join('/')}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="opened" 
                  name="Opened" 
                  stroke="var(--color-warning)" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  name="Resolved" 
                  stroke="var(--color-success)" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Velocity */}
        <div className="glass-card chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Platform Velocity Index</h3>
            <p className="chart-subtitle">Resolved / Opened Ratio (%)</p>
          </div>
          <div style={{ height: 'var(--chart-height)', width: '100%' }}>
            <ResponsiveContainer>
              <AreaChart data={velocityTrend}>
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-light)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary-light)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10}
                  tickFormatter={(str) => str.split('-').slice(1).join('/')}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="velocity" 
                  name="Velocity" 
                  unit="%" 
                  stroke="var(--color-primary-light)" 
                  fillOpacity={1} 
                  fill="url(#colorVelocity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-row">
        {/* Team Velocity Index */}
        <div className="glass-card chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Team Velocity Index Comparison</h3>
            <p className="chart-subtitle">Resolved / Opened Ratio (%) per Team</p>
          </div>
          <div style={{ height: 'var(--chart-height)', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={teamVelocityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10}
                  tickFormatter={(str) => str.split('-').slice(1).join('/')}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                {teamHealth.map((th, index) => (
                  <Line 
                    key={th.team}
                    type="monotone" 
                    dataKey={th.team} 
                    name={th.team} 
                    stroke={COLORS[index % COLORS.length]} 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 4 }} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Health */}
        <div className="glass-card chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Client Health Disruption</h3>
            <p className="chart-subtitle">% Tenants Impacted by P0-P2 Issues</p>
          </div>
          <div style={{ height: 'var(--chart-height)', width: '100%' }}>
            <ResponsiveContainer>
              <AreaChart data={clientHealth}>
                <defs>
                  <linearGradient id="colorDisruption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10}
                  tickFormatter={(str) => str.split('-').slice(1).join('/')}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="disruption" 
                  name="Disruption" 
                  unit="%" 
                  stroke="var(--color-danger)" 
                  fillOpacity={1} 
                  fill="url(#colorDisruption)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-row">
        {/* Team Health Cards */}
        <div className="glass-card chart-container w-full" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3 className="chart-title">Team Performance Health Details</h3>
            <p className="chart-subtitle">Creation vs Resolution Trends per Team (Found in Data)</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '800px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', padding: '15px 0' }}>
              {teamHealth.map(team => (
                <div key={team.team} className="team-mini-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', textAlign: 'center', marginBottom: '10px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{team.team}</p>
                  <div style={{ height: '100px', width: '100%' }}>
                    <ResponsiveContainer>
                      <LineChart data={team.data}>
                        <Line type="monotone" dataKey="opened" name="Opened" stroke="var(--color-warning)" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="resolved" name="Resolved" stroke="var(--color-success)" dot={false} strokeWidth={2} />
                        <Tooltip content={<CustomTooltip />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>
                    <span>Opened: {team.data.reduce((sum, d) => sum + d.opened, 0)}</span>
                    <span>Resolved: {team.data.reduce((sum, d) => sum + d.resolved, 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthAnalytics;
