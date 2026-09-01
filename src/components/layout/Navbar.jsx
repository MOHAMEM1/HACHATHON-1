import { Plus, Bell, Search } from 'lucide-react';

export default function Navbar({ campaignName, onNewCampaign, onSearch, notifications }) {
  return (
    <header className="navbar" role="banner">
      <div className="navbar-left">
        <div className="navbar-breadcrumb">
          <span>Workspace</span>
          <span className="navbar-breadcrumb-sep">/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {campaignName ?? 'New Campaign'}
          </span>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="navbar-btn navbar-btn-ghost"
          id="btn-search"
          aria-label="Search"
          onClick={onSearch}
        >
          <Search style={{ width: 15, height: 15 }} />
          <span>Search</span>
          <kbd style={{
            marginLeft: 8,
            padding: '1px 6px',
            fontSize: '11px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            color: 'var(--text-tertiary)',
          }}>⌘K</kbd>
        </button>

        <button
          className="navbar-btn navbar-btn-ghost"
          id="btn-notifications"
          aria-label="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell style={{ width: 15, height: 15 }} />
          {notifications > 0 && (
            <span style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-violet)',
              boxShadow: '0 0 6px rgba(139,92,246,0.6)',
            }} />
          )}
        </button>

        <button
          className="navbar-btn navbar-btn-primary"
          id="btn-new-campaign"
          onClick={onNewCampaign}
        >
          <Plus style={{ width: 15, height: 15 }} />
          <span>New Campaign</span>
        </button>

        <div className="navbar-avatar" id="user-avatar" title="User profile">
          M
        </div>
      </div>
    </header>
  );
}
