import { useEffect, useRef } from 'react';
import { Activity, Zap, CheckCircle2, Loader, Bot } from 'lucide-react';

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

const typeConfig = {
  'tool-call': {
    icon: Zap,
    iconBg: 'rgba(139,92,246,0.15)',
    iconColor: 'var(--accent-violet)',
    borderClass: 'tool-call',
  },
  result: {
    icon: CheckCircle2,
    iconBg: 'rgba(34,197,94,0.15)',
    iconColor: 'var(--color-success)',
    borderClass: 'result',
  },
  thinking: {
    icon: Loader,
    iconBg: 'rgba(245,158,11,0.15)',
    iconColor: 'var(--color-warning)',
    borderClass: 'thinking',
  },
};

export default function AgentActivityLog({ logs }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="card" id="agent-activity-log" style={{ height: '100%' }}>
      <div className="card-header">
        <h2 className="card-title">
          <Bot style={{ color: 'var(--accent-violet)' }} /> Agent Activity
        </h2>
        {logs.length > 0 && (
          <span className="card-badge card-badge-accent">{logs.length} actions</span>
        )}
      </div>

      {logs.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--sp-8) var(--sp-4)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-gradient-subtle)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--sp-4)',
          }}>
            <Activity style={{ width: 22, height: 22, color: 'var(--accent-violet)' }} />
          </div>
          <p style={{ fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Waiting for agent</p>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.5 }}>
            Open this page in ChatGPT's browser or Chrome with WebMCP enabled. The agent's actions will appear here in real-time.
          </p>

          {/* Decorative pulse rings */}
          <div style={{
            marginTop: 'var(--sp-4)',
            position: 'relative',
            width: 60,
            height: 60,
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(139,92,246,0.2)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              inset: 8,
              borderRadius: '50%',
              border: '2px solid rgba(139,92,246,0.15)',
              animation: 'pulse-dot 2s ease-in-out infinite 0.3s',
            }} />
            <div style={{
              position: 'absolute',
              inset: 16,
              borderRadius: '50%',
              border: '2px solid rgba(139,92,246,0.1)',
              animation: 'pulse-dot 2s ease-in-out infinite 0.6s',
            }} />
            <div style={{
              position: 'absolute',
              inset: 22,
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              opacity: 0.4,
            }} />
          </div>
        </div>
      ) : (
        <div className="agent-log" ref={scrollRef}>
          {logs.map((entry, i) => {
            const config = typeConfig[entry.type] ?? typeConfig['tool-call'];
            const Icon = config.icon;

            return (
              <div
                className={`agent-log-entry ${config.borderClass}`}
                key={entry.id}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="agent-log-icon" style={{ background: config.iconBg }}>
                  <Icon style={{ color: config.iconColor }} />
                </div>
                <div className="agent-log-content">
                  <div className="agent-log-action">{entry.action}</div>
                  <div className="agent-log-detail">{entry.detail}</div>
                </div>
                <div className="agent-log-time">{formatTime(entry.time)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
