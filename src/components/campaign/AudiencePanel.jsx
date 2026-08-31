import { Users, MapPin, Globe, Sparkles } from 'lucide-react';

export default function AudiencePanel({ audience }) {
  if (!audience) {
    return (
      <div className="card" id="audience-panel">
        <div className="card-header">
          <h2 className="card-title"><Users /> Target Audience</h2>
          <span className="card-badge card-badge-warning">Awaiting Agent</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon"><Sparkles /></div>
          <p className="empty-state-title">No audience defined</p>
          <p className="empty-state-desc">
            The agent can set demographics, interests, and location targeting for your campaign.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card agent-updated" id="audience-panel">
      <div className="card-header">
        <h2 className="card-title"><Users /> Target Audience</h2>
        <span className="card-badge card-badge-success">Configured</span>
      </div>

      <div className="audience-stats">
        <div className="audience-stat">
          <span className="audience-stat-label">Age Range</span>
          <span className="audience-stat-value">{audience.ageRange}</span>
        </div>
        <div className="audience-stat">
          <span className="audience-stat-label">Gender</span>
          <span className="audience-stat-value" style={{ textTransform: 'capitalize' }}>{audience.gender}</span>
        </div>
        <div className="audience-stat">
          <span className="audience-stat-label"><MapPin style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} /> Location</span>
          <span className="audience-stat-value">{audience.location}</span>
        </div>
        <div className="audience-stat">
          <span className="audience-stat-label"><Globe style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} /> Language</span>
          <span className="audience-stat-value" style={{ textTransform: 'capitalize' }}>{audience.language}</span>
        </div>
      </div>

      {/* Estimated reach */}
      <div style={{
        marginTop: 'var(--sp-4)',
        padding: 'var(--sp-3) var(--sp-4)',
        background: 'var(--accent-gradient-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Estimated Reach
        </span>
        <div style={{
          fontSize: 'var(--fs-xl)',
          fontWeight: 800,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {audience.estimatedReach?.toLocaleString() ?? '—'}
        </div>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>people</span>
      </div>

      {/* Interests */}
      <div className="audience-interests">
        {audience.interests.map((interest, i) => (
          <span className="audience-interest-chip" key={i}>
            {interest}
          </span>
        ))}
      </div>
    </div>
  );
}
