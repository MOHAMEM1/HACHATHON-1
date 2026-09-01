import { Eye, MousePointerClick, ShoppingCart, TrendingUp, ArrowUpRight } from 'lucide-react';

const kpis = [
  {
    key: 'reach',
    label: 'Est. Reach',
    icon: Eye,
    getValue: (s) => s.audience?.estimatedReach ?? 0,
    suffix: '',
    iconBg: 'rgba(139,92,246,0.12)',
    iconColor: 'var(--accent-violet)',
  },
  {
    key: 'engagement',
    label: 'Engagement Rate',
    icon: MousePointerClick,
    getValue: (s) => s.performance?.metrics?.engagementRate ?? 0,
    suffix: '%',
    decimals: 1,
    iconBg: 'rgba(59,130,246,0.12)',
    iconColor: 'var(--accent-blue)',
  },
  {
    key: 'conversions',
    label: 'Conversions',
    icon: ShoppingCart,
    getValue: (s) => s.performance?.metrics?.conversions ?? 0,
    suffix: '',
    iconBg: 'rgba(6,182,212,0.12)',
    iconColor: 'var(--accent-cyan)',
  },
  {
    key: 'roi',
    label: 'ROI',
    icon: TrendingUp,
    getValue: (s) => s.performance?.metrics?.roi ?? 0,
    suffix: 'x',
    decimals: 1,
    iconBg: 'rgba(34,197,94,0.12)',
    iconColor: 'var(--color-success)',
  },
];

export default function KPIRow({ store }) {
  const hasData = !!(store.audience || store.performance);

  // Don't show KPI row at all if there's no data
  if (!hasData) return null;

  return (
    <div className="kpi-row">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const value = kpi.getValue(store);
        const formatted = kpi.decimals
          ? value.toFixed(kpi.decimals)
          : Math.round(value).toLocaleString();

        return (
          <div className="kpi-card" key={kpi.key} id={`kpi-${kpi.key}`}>
            <div className="kpi-label">
              <Icon />
              {kpi.label}
            </div>
            <div className="kpi-value gradient-text">
              {formatted}{kpi.suffix}
            </div>
            {value > 0 && (
              <div className="kpi-change positive">
                <ArrowUpRight style={{ width: 12, height: 12 }} />
                Live data
              </div>
            )}
            <div className="kpi-icon-wrapper" style={{ background: kpi.iconBg }}>
              <Icon style={{ color: kpi.iconColor }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
