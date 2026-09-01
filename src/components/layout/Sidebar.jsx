import {
  LayoutDashboard,
  Target,
  Users,
  Wallet,
  FileText,
  CalendarDays,
  BarChart3,
  Zap,
  Sparkles,
  Check,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', sectionId: 'section-demo', label: 'Dashboard', icon: LayoutDashboard, storeKey: null },
  { id: 'campaigns', sectionId: 'section-kpi', label: 'Campaigns', icon: Target, storeKey: null },
  { id: 'audience', sectionId: 'section-audience', label: 'Audience', icon: Users, storeKey: 'audience' },
  { id: 'budget', sectionId: 'section-budget', label: 'Budget', icon: Wallet, storeKey: 'budget' },
  { id: 'content', sectionId: 'section-adcopy', label: 'Ad Content', icon: FileText, storeKey: 'adCopies' },
  { id: 'schedule', sectionId: 'section-schedule', label: 'Schedule', icon: CalendarDays, storeKey: 'schedule' },
  { id: 'analytics', sectionId: 'section-performance', label: 'Analytics', icon: BarChart3, storeKey: 'performance' },
];

function isComplete(store, key) {
  if (!key || !store) return false;
  const val = store[key];
  if (Array.isArray(val)) return val.length > 0;
  return val != null;
}

export default function Sidebar({ active, onNavigate, store }) {
  const handleClick = (item) => {
    onNavigate(item.id);
    // Scroll to the corresponding section
    const el = document.getElementById(item.sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('section-highlight');
      setTimeout(() => el.classList.remove('section-highlight'), 2000);
    }
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Sparkles />
        </div>
        <span className="sidebar-brand-text">AgentCampaign</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Workspace</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const completed = isComplete(store, item.storeKey);
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`sidebar-link${active === item.id ? ' active' : ''}`}
              onClick={() => handleClick(item)}
            >
              <Icon />
              <span>{item.label}</span>
              {item.storeKey && (
                <span className={`sidebar-status ${completed ? 'completed' : 'pending'}`}>
                  {completed ? <Check size={12} /> : null}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer — WebMCP badge */}
      <div className="sidebar-footer">
        <div className="sidebar-webmcp-badge">
          <div className="webmcp-dot" />
          <Zap style={{ width: 14, height: 14, color: 'var(--color-success)' }} />
          <span>WebMCP Active</span>
        </div>
      </div>
    </aside>
  );
}
