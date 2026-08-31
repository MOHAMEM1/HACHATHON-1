import { Wallet, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PLATFORM_COLORS = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  google: '#4285F4',
  tiktok: '#00F2EA',
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
        Est. CPC: ${d.estCPC}
      </div>
    </div>
  );
};

export default function BudgetChart({ budget }) {
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
            The agent will allocate your budget across platforms and show estimated reach and CPC.
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
        <span className="card-badge card-badge-success">Allocated</span>
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
          {/* Center label */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>Total</span>
            <span style={{
              fontSize: 'var(--fs-md)',
              fontWeight: 800,
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
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

      {/* Optimization goal */}
      <div style={{
        padding: 'var(--sp-2) var(--sp-4)',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--fs-sm)',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-2)',
      }}>
        <span style={{ color: 'var(--text-tertiary)' }}>Optimizing for:</span>
        <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--accent-violet)' }}>
          {budget.goal}
        </span>
      </div>
    </div>
  );
}
