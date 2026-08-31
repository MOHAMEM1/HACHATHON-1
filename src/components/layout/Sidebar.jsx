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
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: Target },
  { id: 'audience', label: 'Audience', icon: Users },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'content', label: 'Ad Content', icon: FileText },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ active, onNavigate }) {
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
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`sidebar-link${active === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
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
