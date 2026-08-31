import { Plus, Bell, Search } from 'lucide-react';

export default function Navbar({ campaignName }) {
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
        <button className="navbar-btn navbar-btn-ghost" id="btn-search" aria-label="Search">
          <Search style={{ width: 15, height: 15 }} />
          <span>Search</span>
        </button>

        <button className="navbar-btn navbar-btn-ghost" id="btn-notifications" aria-label="Notifications">
          <Bell style={{ width: 15, height: 15 }} />
        </button>

        <button className="navbar-btn navbar-btn-primary" id="btn-new-campaign">
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
