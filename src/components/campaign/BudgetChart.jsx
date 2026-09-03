import { useState } from 'react';
import { Wallet, Sparkles, SlidersHorizontal } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { humanUpdateBudget, humanUpdatePlatformPct } from '../../webmcp/campaignStore.js';

const PLATFORM_COLORS = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  google: '#4285F4',
  tiktok: '#00F2EA',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  snapchat: '#FFFC00',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--sp-3) var(--sp-4)',
      fontSize: 'var(--fs-sm)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: 4 }}>{d.platform}</div>
      <div style={{ color: 'var(--text-secondary)' }}>
        {d.amount?.toLocaleString()} ({d.pct}%)
      </div>
      <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)', marginTop: 2 }}>
        Est. CPC: ${d.estCPC} · Reach: {d.estReach?.toLocaleString()}
      </div>
    </div>
  );
};

export default function BudgetChart({ budget }) {
  const [showSliders, setShowSliders] = useState(false);

  if (!budget) {
    return (
      <div className="card" id="budget-chart">
        <div className="card-header">
          <h2 className="card-title"><Wallet /> Budget Allocation</h2>
          <span className="card-badge card-badge-warning">Awaiting Agent</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon"><Sparkles /></div>
          <p className="empty-state-title">No budget set</p>
          <p className="empty-state-desc">
            The AI agent will call <code>allocate_budget</code> to distribute funds across platforms.
          </p>
        </div>
      </div>
    );
  }

  const data = budget.allocations.map((a) => ({
    ...a,
    fill: PLATFORM_COLORS[a.platform] ?? '#8B5CF6',
  }));

  return (
    <div className="card agent-updated" id="budget-chart">
      <div className="card-header">
        <h2 className="card-title"><Wallet /> Budget Allocation</h2>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button
            className="card-badge"
            style={{
              cursor: 'pointer', border: 'none',
              background: showSliders ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.08)',
              color: showSliders ? 'var(--accent-violet)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
            }}
            onClick={() => setShowSliders(!showSliders)}
            title="Toggle interactive sliders — adjust the AI's budget allocation"
          >
            <SlidersHorizontal style={{ width: 12, height: 12 }} />
            {showSliders ? 'Hide Controls' : 'Human Override'}
          </button>
          <span className="card-badge card-badge-success">Allocated</span>
        </div>
      </div>

      <div className="budget-summary">
        {/* Donut chart */}
        <div style={{ width: 140, height: 140, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={3}
                dataKey="amount"
                stroke="none"
                animationDuration={1000}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>Total</span>
            <span style={{
              fontSize: 'var(--fs-md)', fontWeight: 800,
              background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {budget.total.toLocaleString()}
            </span>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{budget.currency}</span>
          </div>
        </div>

        {/* Breakdown list */}
        <div className="budget-breakdown">
          {budget.allocations.map((a, i) => (
            <div className="budget-item" key={i}>
              <span className="budget-item-color" style={{ background: PLATFORM_COLORS[a.platform] ?? '#8B5CF6' }} />
              <span className="budget-item-name" style={{ textTransform: 'capitalize' }}>{a.platform}</span>
              <span className="budget-item-value">{a.amount.toLocaleString()} {budget.currency}</span>
              <span className="budget-item-pct">{a.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── HUMAN-IN-THE-LOOP: Interactive Budget Controls ─── */}
      {showSliders && (
        <div className="budget-sliders" style={{
          marginTop: 'var(--sp-4)',
          padding: 'var(--sp-4)',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(139,92,246,0.15)',
        }}>
          <div style={{
            fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--accent-violet)',
            marginBottom: 'var(--sp-3)', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            🧑 Human Override — Adjust Agent's Suggestions
          </div>

          {/* Total budget slider */}
          <div style={{ marginBottom: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Total Budget</span>
              <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {budget.total.toLocaleString()} {budget.currency}
              </span>
            </div>
            <input
              type="range"
              className="budget-range-slider"
              min={Math.round(budget.total * 0.2)}
              max={Math.round(budget.total * 3)}
              step={Math.round(budget.total * 0.05)}
              value={budget.total}
              onChange={(e) => humanUpdateBudget(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                {Math.round(budget.total * 0.2).toLocaleString()}
              </span>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                {Math.round(budget.total * 3).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Per-platform sliders */}
          {budget.allocations.map((a, i) => (
            <div key={i} style={{ marginBottom: 'var(--sp-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-1)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: PLATFORM_COLORS[a.platform] ?? '#8B5CF6',
                    display: 'inline-block',
                  }} />
                  <span style={{ fontSize: 'var(--fs-sm)', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                    {a.platform}
                  </span>
                </div>
                <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {a.pct}% — {a.amount.toLocaleString()} {budget.currency}
                </span>
              </div>
              <input
                type="range"
                className="budget-range-slider"
                min={0}
                max={100}
                step={1}
                value={a.pct}
                onChange={(e) => humanUpdatePlatformPct(a.platform, Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: PLATFORM_COLORS[a.platform] ?? '#8B5CF6',
                }}
              />
            </div>
          ))}

          <div style={{
            fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)',
            marginTop: 'var(--sp-2)', textAlign: 'center',
          }}>
            Performance projections auto-update as you adjust
          </div>
        </div>
      )}

      {/* Optimization goal */}
      <div style={{
        padding: 'var(--sp-2) var(--sp-4)',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--fs-sm)',
        color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
        marginTop: 'var(--sp-3)',
      }}>
        <span style={{ color: 'var(--text-tertiary)' }}>Optimizing for:</span>
        <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--accent-violet)' }}>
          {budget.goal}
        </span>
      </div>
    </div>
  );
}
