import { CalendarDays, Sparkles, Clock } from 'lucide-react';

export default function ScheduleTimeline({ schedule }) {
  if (!schedule) {
    return (
      <div className="card" id="schedule-timeline">
        <div className="card-header">
          <h2 className="card-title"><CalendarDays /> Campaign Schedule</h2>
          <span className="card-badge card-badge-warning">Awaiting Agent</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon"><Sparkles /></div>
          <p className="empty-state-title">No schedule set</p>
          <p className="empty-state-desc">
            The agent can set start/end dates, posting frequency, and create a phased timeline for your campaign.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card agent-updated" id="schedule-timeline">
      <div className="card-header">
        <h2 className="card-title"><CalendarDays /> Campaign Schedule</h2>
        <span className="card-badge card-badge-success">{schedule.totalDays} Days</span>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'flex',
        gap: 'var(--sp-6)',
        marginBottom: 'var(--sp-5)',
        padding: 'var(--sp-3) var(--sp-4)',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        flexWrap: 'wrap',
      }}>
        <div>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', display: 'block' }}>Start</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{schedule.startDate}</span>
        </div>
        <div>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', display: 'block' }}>End</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{schedule.endDate}</span>
        </div>
        <div>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', display: 'block' }}>Frequency</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'capitalize' }}>
            {schedule.frequency.replace(/_/g, ' ')}
          </span>
        </div>
        <div>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', display: 'block' }}>Peak Hours</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock style={{ width: 12, height: 12, color: 'var(--accent-violet)' }} />
            {schedule.peakHours.join(', ')}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {schedule.phases.map((phase, i) => (
          <div className={`timeline-item ${phase.status}`} key={i}>
            <div className="timeline-dot" />
            <div className="timeline-date">{phase.duration}</div>
            <div className="timeline-title">{phase.name}</div>
            <div className="timeline-desc">
              Phase {i + 1} of {schedule.phases.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
