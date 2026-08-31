import { useEffect, useRef, useState } from 'react';
import { Eye, MousePointerClick, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function AnimatedValue({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    const start = display;
    const duration = 1200;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(start + (target - start) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <>{prefix}{formatted}{suffix}</>;
}

const kpis = [
  {
    key: 'reach',
    label: 'Est. Reach',
    icon: Eye,
    getValue: (s) => s.audience?.estimatedReach ?? s.campaigns[0]?.reach ?? 0,
    format: (v) => ({ value: v, suffix: '' }),
    change: '+12.5%',
    positive: true,
    iconBg: 'rgba(139,92,246,0.12)',
    iconColor: 'var(--accent-violet)',
  },
  {
    key: 'engagement',
    label: 'Engagement Rate',
    icon: MousePointerClick,
    getValue: (s) => s.performance?.metrics?.engagementRate ?? s.campaigns[0]?.engagement ?? 0,
    format: (v) => ({ value: v, suffix: '%', decimals: 1 }),
    change: '+0.8%',
    positive: true,
    iconBg: 'rgba(59,130,246,0.12)',
    iconColor: 'var(--accent-blue)',
  },
  {
    key: 'conversions',
    label: 'Conversions',
    icon: ShoppingCart,
    getValue: (s) => s.performance?.metrics?.conversions ?? s.campaigns[0]?.conversions ?? 0,
    format: (v) => ({ value: v }),
    change: '+24',
    positive: true,
    iconBg: 'rgba(6,182,212,0.12)',
    iconColor: 'var(--accent-cyan)',
  },
  {
    key: 'roi',
    label: 'ROI',
    icon: TrendingUp,
    getValue: (s) => s.performance?.metrics?.roi ?? s.campaigns[0]?.roi ?? 0,
    format: (v) => ({ value: v, suffix: 'x', decimals: 1 }),
    change: '+0.3x',
    positive: true,
    iconBg: 'rgba(34,197,94,0.12)',
    iconColor: 'var(--color-success)',
  },
];

export default function KPIRow({ store }) {
  return (
    <div className="kpi-row">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const raw = kpi.getValue(store);
        const { value, prefix, suffix, decimals } = kpi.format(raw);
        const ChangeIcon = kpi.positive ? ArrowUpRight : ArrowDownRight;

        return (
          <div className="kpi-card" key={kpi.key} id={`kpi-${kpi.key}`}>
            <div className="kpi-label">
              <Icon />
              {kpi.label}
            </div>
            <div className="kpi-value gradient-text">
              <AnimatedValue value={value} prefix={prefix ?? ''} suffix={suffix ?? ''} decimals={decimals ?? 0} />
            </div>
            <div className={`kpi-change ${kpi.positive ? 'positive' : 'negative'}`}>
              <ChangeIcon style={{ width: 12, height: 12 }} />
              {kpi.change}
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 4 }}>vs last period</span>
            </div>
            <div className="kpi-icon-wrapper" style={{ background: kpi.iconBg }}>
              <Icon style={{ color: kpi.iconColor }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
