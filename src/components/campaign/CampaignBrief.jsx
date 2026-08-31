import { FileText, Sparkles } from 'lucide-react';

export default function CampaignBrief({ brief }) {
  if (!brief) {
    return (
      <div className="card" id="campaign-brief-card">
        <div className="card-header">
          <h2 className="card-title"><FileText /> Campaign Brief</h2>
          <span className="card-badge card-badge-warning">Awaiting Agent</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Sparkles />
          </div>
          <p className="empty-state-title">No brief yet</p>
          <p className="empty-state-desc">
            Ask your AI agent to generate a campaign brief. It will appear here in real-time as the agent works.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card agent-updated" id="campaign-brief-card">
      <div className="card-header">
        <h2 className="card-title"><FileText /> Campaign Brief</h2>
        <span className="card-badge card-badge-success">Generated</span>
      </div>
      <div className="brief-content">
        <div className="brief-field">
          <span className="brief-field-label">Campaign Name</span>
          <span className="brief-field-value" style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>
            {brief.name}
          </span>
        </div>

        <div className="brief-field">
          <span className="brief-field-label">Industry</span>
          <span className="brief-field-value" style={{ textTransform: 'capitalize' }}>{brief.industry}</span>
        </div>

        <div className="brief-field">
          <span className="brief-field-label">Description</span>
          <span className="brief-field-value">{brief.description}</span>
        </div>

        <div className="brief-field">
          <span className="brief-field-label">Objectives</span>
          <div className="brief-objectives">
            {brief.objectives.map((obj, i) => (
              <span className="brief-objective-tag" key={i}>
                <span style={{ color: 'var(--color-success)', fontSize: 10 }}>●</span>
                {obj}
              </span>
            ))}
          </div>
        </div>

        <div className="brief-field">
          <span className="brief-field-label">Key Messages</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {brief.keyMessages.map((msg, i) => (
              <span key={i} className="brief-field-value" style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                "{msg}"
              </span>
            ))}
          </div>
        </div>

        <div className="brief-field">
          <span className="brief-field-label">Timeline</span>
          <span className="brief-field-value">{brief.timeline}</span>
        </div>
      </div>
    </div>
  );
}
