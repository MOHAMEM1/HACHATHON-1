import { BarChart3, Sparkles, TrendingUp, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--sp-3) var(--sp-4)',
      fontSize: 'var(--fs-sm)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          {p.name}: {p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

export default function PerformanceMetrics({ performance, campaigns }) {
  if (!performance) {
    return (
      <div className="card" id="performance-metrics">
        <div className="card-header">
          <h2 className="card-title"><BarChart3 /> Performance Analytics</h2>
          <span className="card-badge card-badge-info">Demo Data</span>
        </div>

        {/* Show some demo data from existing campaigns */}
        {campaigns?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' }}>
              Active campaigns overview — ask the agent to run <code style={{ color: 'var(--accent-violet)', background: 'rgba(139,92,246,0.1)', padding: '2px 6px', borderRadius: 4 }}>analyze_performance</code> for deep insights.
            </p>
            {campaigns.map((c) => (
              <div key={c.id} style={{
                padding: 'var(--sp-3) var(--sp-4)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{c.name}</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                    {c.platform} · {c.status}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>
                    {c.budget.toLocaleString()} {c.currency}
                  </div>
                  <div style={{
                    fontSize: 'var(--fs-xs)',
                    color: c.roi > 0 ? 'var(--color-success)' : 'var(--text-tertiary)',
                  }}>
                    {c.roi > 0 ? `${c.roi}x ROI` : 'Not launched'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><Sparkles /></div>
            <p className="empty-state-title">No analytics data</p>
            <p className="empty-state-desc">Ask the agent to analyze campaign performance for insights and recommendations.</p>
          </div>
        )}
      </div>
    );
  }

  const trends = performance.trends ?? [];

  return (
    <div className="card agent-updated" id="performance-metrics">
      <div className="card-header">
        <h2 className="card-title"><BarChart3 /> Performance Analytics</h2>
        <span className="card-badge card-badge-success">Analyzed</span>
      </div>

      {/* Chart */}
      <div className="perf-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="gradReach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" />
            <XAxis dataKey="week" tick={{ fill: '#5c5678', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#5c5678', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="reach" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradReach)" name="Reach" />
            <Area type="monotone" dataKey="conversions" stroke="#22C55E" strokeWidth={2} fill="url(#gradConv)" name="Conversions" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="perf-legend">
        <div className="perf-legend-item">
          <span className="perf-legend-dot" style={{ background: '#8B5CF6' }} /> Reach
        </div>
        <div className="perf-legend-item">
          <span className="perf-legend-dot" style={{ background: '#22C55E' }} /> Conversions
        </div>
      </div>

      {/* Recommendations */}
      {performance.recommendations?.length > 0 && (
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <div style={{
            fontSize: 'var(--fs-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 'var(--sp-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
          }}>
            <Lightbulb style={{ width: 14, height: 14, color: 'var(--color-warning)' }} />
            AI Recommendations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {performance.recommendations.map((rec, i) => (
              <div key={i} style={{
                padding: 'var(--sp-2) var(--sp-3)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--fs-sm)',
                color: 'var(--text-secondary)',
                borderLeft: '2px solid var(--accent-violet)',
              }}>
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
