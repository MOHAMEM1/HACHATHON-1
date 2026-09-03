import { BarChart3, Sparkles, Lightbulb } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

export default function PerformanceMetrics({ performance }) {
  if (!performance) {
    return (
      <div className="card" id="performance-metrics">
        <div className="card-header">
          <h2 className="card-title"><BarChart3 /> Performance Analytics</h2>
          <span className="card-badge card-badge-warning">Awaiting Agent</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon"><Sparkles /></div>
          <p className="empty-state-title">No analytics yet</p>
          <p className="empty-state-desc">
            The AI agent will call <code>analyze_performance</code> to generate projections and recommendations.
          </p>
        </div>
      </div>
    );
  }

  const trends = performance.trends ?? [];
  const m = performance.metrics ?? {};

  return (
    <div className="card agent-updated" id="performance-metrics">
      <div className="card-header">
        <h2 className="card-title"><BarChart3 /> Performance Analytics</h2>
        <span className="card-badge card-badge-success">Analyzed</span>
      </div>

      {/* KPI summary row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-3)',
        marginBottom: 'var(--sp-4)',
      }}>
        {[
          { label: 'Reach', value: m.reach, color: '#8B5CF6' },
          { label: 'Engagement', value: `${m.engagementRate}%`, color: '#3B82F6' },
          { label: 'Conversions', value: m.conversions, color: '#22C55E' },
          { label: 'ROI', value: `${m.roi}x`, color: '#F59E0B' },
        ].map((kpi, i) => (
          <div key={i} style={{
            padding: 'var(--sp-3)', background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)', textAlign: 'center',
            borderTop: `2px solid ${kpi.color}`,
          }}>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>{kpi.label}</div>
            <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: kpi.color }}>
              {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Animated area chart */}
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
            <Area type="monotone" dataKey="reach" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradReach)" name="Reach" animationDuration={1200} />
            <Area type="monotone" dataKey="conversions" stroke="#22C55E" strokeWidth={2} fill="url(#gradConv)" name="Conversions" animationDuration={1500} />
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

      {/* Industry benchmark */}
      {performance.industryBenchmark && (
        <div style={{
          display: 'flex', gap: 'var(--sp-4)', padding: 'var(--sp-3)',
          background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
          marginTop: 'var(--sp-3)', fontSize: 'var(--fs-xs)',
        }}>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Industry Avg Engagement: </span>
            <span style={{ color: m.engagementRate > performance.industryBenchmark.avgEngagement ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
              {performance.industryBenchmark.avgEngagement}%
              {m.engagementRate > performance.industryBenchmark.avgEngagement ? ' ▲ above' : ' ▼ below'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Industry Avg ROI: </span>
            <span style={{ color: m.roi > performance.industryBenchmark.avgROI ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
              {performance.industryBenchmark.avgROI}x
              {m.roi > performance.industryBenchmark.avgROI ? ' ▲ above' : ' ▼ below'}
            </span>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {performance.recommendations?.length > 0 && (
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <div style={{
            fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-primary)',
            marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
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
