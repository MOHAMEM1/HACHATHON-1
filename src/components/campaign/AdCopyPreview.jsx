import { useState } from 'react';
import { FileText, Camera, ThumbsUp, Globe, Music, Sparkles, Pencil, Linkedin, Twitter } from 'lucide-react';
import { humanUpdateAdCopy } from '../../webmcp/campaignStore.js';

const platformIcons = {
  instagram: Camera,
  facebook: ThumbsUp,
  google: Globe,
  tiktok: Music,
  linkedin: Linkedin,
  twitter: Twitter,
};

const platformColors = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  google: '#4285F4',
  tiktok: '#00F2EA',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  snapchat: '#FFFC00',
};

export default function AdCopyPreview({ copies }) {
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);

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
            The AI agent will call <code>generate_ad_copy</code> for each platform.
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
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button
            className="card-badge"
            style={{
              cursor: 'pointer', border: 'none',
              background: editMode ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.08)',
              color: editMode ? 'var(--accent-violet)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
            }}
            onClick={() => setEditMode(!editMode)}
            title="Edit the AI-generated copy"
          >
            <Pencil style={{ width: 12, height: 12 }} />
            {editMode ? 'Done Editing' : 'Edit Copy'}
          </button>
          <span className="card-badge card-badge-success">{copies.length} Variant{copies.length > 1 ? 's' : ''}</span>
        </div>
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

      <div style={{ display: 'flex', gap: 'var(--sp-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Phone mockup preview */}
        <div className="ad-preview-phone" style={{ flex: '0 0 280px', maxWidth: '100%' }}>
          <div className="ad-preview-header">
            <div className="ad-preview-avatar" style={{ background: color }} />
            <div>
              <div className="ad-preview-name" style={{ textTransform: 'capitalize' }}>{activeCopy.productName}</div>
              <div className="ad-preview-sponsored">Sponsored · <span style={{ textTransform: 'capitalize' }}>{activeCopy.platform}</span></div>
            </div>
          </div>

          <div className="ad-preview-image">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>
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

        {/* Copy details — EDITABLE when editMode is on */}
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
            <span className="brief-field-label">Headline {editMode && <span style={{ color: 'var(--accent-violet)', fontSize: 'var(--fs-xs)' }}>✏️ editable</span>}</span>
            {editMode ? (
              <input
                type="text"
                value={activeCopy.headline}
                onChange={(e) => humanUpdateAdCopy(activeTab, 'headline', e.target.value)}
                style={{
                  width: '100%', padding: 'var(--sp-2) var(--sp-3)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--accent-violet)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: 'var(--fs-sm)', fontWeight: 600,
                }}
              />
            ) : (
              <span className="brief-field-value" style={{ fontWeight: 600 }}>{activeCopy.headline}</span>
            )}
          </div>
          <div className="brief-field">
            <span className="brief-field-label">Body {editMode && <span style={{ color: 'var(--accent-violet)', fontSize: 'var(--fs-xs)' }}>✏️ editable</span>}</span>
            {editMode ? (
              <textarea
                value={activeCopy.body}
                onChange={(e) => humanUpdateAdCopy(activeTab, 'body', e.target.value)}
                rows={4}
                style={{
                  width: '100%', padding: 'var(--sp-2) var(--sp-3)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--accent-violet)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: 'var(--fs-sm)', resize: 'vertical',
                }}
              />
            ) : (
              <span className="brief-field-value" style={{ whiteSpace: 'pre-line', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                {activeCopy.body}
              </span>
            )}
          </div>
          <div className="brief-field">
            <span className="brief-field-label">Call to Action {editMode && <span style={{ color: 'var(--accent-violet)', fontSize: 'var(--fs-xs)' }}>✏️ editable</span>}</span>
            {editMode ? (
              <input
                type="text"
                value={activeCopy.cta}
                onChange={(e) => humanUpdateAdCopy(activeTab, 'cta', e.target.value)}
                style={{
                  width: 'fit-content', padding: 'var(--sp-1) var(--sp-4)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--accent-violet)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: 'var(--fs-sm)', fontWeight: 600,
                }}
              />
            ) : (
              <span
                style={{
                  display: 'inline-block', padding: 'var(--sp-1) var(--sp-4)',
                  borderRadius: 'var(--radius-md)', background: color,
                  color: 'white', fontWeight: 600, fontSize: 'var(--fs-sm)', width: 'fit-content',
                }}
              >
                {activeCopy.cta}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
