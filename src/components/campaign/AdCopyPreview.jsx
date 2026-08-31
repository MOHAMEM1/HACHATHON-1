import { useState } from 'react';
import { FileText, Camera, ThumbsUp, Globe, Music, Sparkles } from 'lucide-react';

const platformIcons = {
  instagram: Camera,
  facebook: ThumbsUp,
  google: Globe,
  tiktok: Music,
};

const platformColors = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  google: '#4285F4',
  tiktok: '#00F2EA',
};

export default function AdCopyPreview({ copies }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!copies || copies.length === 0) {
    return (
      <div className="card" id="ad-copy-preview">
        <div className="card-header">
          <h2 className="card-title"><FileText /> Ad Copy</h2>
          <span className="card-badge card-badge-warning">Awaiting Agent</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon"><Sparkles /></div>
          <p className="empty-state-title">No ad copy yet</p>
          <p className="empty-state-desc">
            The agent can generate ad copy for Instagram, Facebook, Google, and TikTok with different tones.
          </p>
        </div>
      </div>
    );
  }

  const activeCopy = copies[activeTab] ?? copies[0];
  const PlatformIcon = platformIcons[activeCopy.platform] ?? FileText;
  const color = platformColors[activeCopy.platform] ?? '#8B5CF6';

  return (
    <div className="card agent-updated" id="ad-copy-preview">
      <div className="card-header">
        <h2 className="card-title"><FileText /> Ad Copy</h2>
        <span className="card-badge card-badge-success">{copies.length} Variant{copies.length > 1 ? 's' : ''}</span>
      </div>

      {/* Platform tabs */}
      {copies.length > 1 && (
        <div className="ad-tabs">
          {copies.map((c, i) => {
            const Icon = platformIcons[c.platform] ?? FileText;
            return (
              <button
                key={i}
                className={`ad-tab${activeTab === i ? ' active' : ''}`}
                onClick={() => setActiveTab(i)}
                style={activeTab === i ? { borderBottom: `2px solid ${platformColors[c.platform]}` } : {}}
              >
                <Icon style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {c.platform}
              </button>
            );
          })}
        </div>
      )}

      {/* Phone mockup preview */}
      <div style={{ display: 'flex', gap: 'var(--sp-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="ad-preview-phone" style={{ flex: '0 0 280px', maxWidth: '100%' }}>
          <div className="ad-preview-header">
            <div className="ad-preview-avatar" style={{ background: color }} />
            <div>
              <div className="ad-preview-name" style={{ textTransform: 'capitalize' }}>{activeCopy.productName}</div>
              <div className="ad-preview-sponsored">Sponsored · <span style={{ textTransform: 'capitalize' }}>{activeCopy.platform}</span></div>
            </div>
          </div>

          <div className="ad-preview-image">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-tertiary)',
              fontSize: 'var(--fs-sm)',
            }}>
              <PlatformIcon style={{ width: 32, height: 32, color }} />
              <span>Ad Creative</span>
            </div>
          </div>

          <div className="ad-preview-headline">{activeCopy.headline}</div>
          <div className="ad-preview-body">{activeCopy.body}</div>
          <button className="ad-preview-cta" style={{ background: color }}>
            {activeCopy.cta}
          </button>
        </div>

        {/* Copy details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="brief-field">
            <span className="brief-field-label">Platform</span>
            <span className="brief-field-value" style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <PlatformIcon style={{ width: 16, height: 16, color }} />
              {activeCopy.platform}
            </span>
          </div>
          <div className="brief-field">
            <span className="brief-field-label">Tone</span>
            <span className="brief-field-value" style={{ textTransform: 'capitalize' }}>{activeCopy.tone}</span>
          </div>
          <div className="brief-field">
            <span className="brief-field-label">Headline</span>
            <span className="brief-field-value" style={{ fontWeight: 600 }}>{activeCopy.headline}</span>
          </div>
          <div className="brief-field">
            <span className="brief-field-label">Body</span>
            <span className="brief-field-value" style={{ whiteSpace: 'pre-line', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
              {activeCopy.body}
            </span>
          </div>
          <div className="brief-field">
            <span className="brief-field-label">Call to Action</span>
            <span
              style={{
                display: 'inline-block',
                padding: 'var(--sp-1) var(--sp-4)',
                borderRadius: 'var(--radius-md)',
                background: color,
                color: 'white',
                fontWeight: 600,
                fontSize: 'var(--fs-sm)',
                width: 'fit-content',
              }}
            >
              {activeCopy.cta}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
