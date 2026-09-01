import { useState, useEffect, useRef } from 'react';
import { Search, X, LayoutDashboard, Target, Users, Wallet, FileText, CalendarDays, BarChart3, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  { id: 'section-demo', label: 'Dashboard Controls', desc: 'Run Demo, Reset Campaign', icon: LayoutDashboard, keywords: ['dashboard', 'demo', 'run', 'reset', 'home'] },
  { id: 'section-kpi', label: 'KPI Overview', desc: 'Reach, Engagement, Conversions, ROI', icon: Target, keywords: ['kpi', 'metrics', 'reach', 'engagement', 'conversions', 'roi', 'overview'] },
  { id: 'section-brief', label: 'Campaign Brief', desc: 'Name, Industry, Objectives, Key Messages', icon: FileText, keywords: ['brief', 'campaign', 'name', 'objectives', 'messages', 'description'] },
  { id: 'section-audience', label: 'Target Audience', desc: 'Demographics, Interests, Location', icon: Users, keywords: ['audience', 'target', 'demographics', 'age', 'gender', 'location', 'interests'] },
  { id: 'section-adcopy', label: 'Ad Copy', desc: 'Instagram, Facebook, Google, TikTok', icon: FileText, keywords: ['ad', 'copy', 'creative', 'instagram', 'facebook', 'google', 'tiktok', 'headline'] },
  { id: 'section-budget', label: 'Budget Allocation', desc: 'Platform budget split, CPC estimates', icon: Wallet, keywords: ['budget', 'money', 'allocation', 'cost', 'cpc', 'spending'] },
  { id: 'section-schedule', label: 'Campaign Schedule', desc: 'Timeline, Phases, Peak Hours', icon: CalendarDays, keywords: ['schedule', 'timeline', 'dates', 'phases', 'calendar', 'frequency'] },
  { id: 'section-performance', label: 'Performance Analytics', desc: 'Charts, Trends, AI Recommendations', icon: BarChart3, keywords: ['performance', 'analytics', 'charts', 'trends', 'recommendations'] },
  { id: 'section-agentlog', label: 'Agent Activity Log', desc: 'Real-time agent action feed', icon: Bot, keywords: ['agent', 'activity', 'log', 'actions', 'webmcp', 'tools'] },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) setQuery('');
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const filtered = query.trim() === ''
    ? sections
    : sections.filter(s =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.desc.toLowerCase().includes(query.toLowerCase()) ||
        s.keywords.some(k => k.includes(query.toLowerCase()))
      );

  const handleSelect = (sectionId) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add a brief highlight
        el.classList.add('section-highlight');
        setTimeout(() => el.classList.remove('section-highlight'), 2000);
      }
    }, 150);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="command-backdrop"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="command-palette"
          >
            {/* Search input */}
            <div className="command-input-wrapper">
              <Search size={18} className="command-search-icon" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search sections... (brief, audience, budget...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="command-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filtered.length > 0) {
                    handleSelect(filtered[0].id);
                  }
                }}
              />
              <kbd className="command-kbd">ESC</kbd>
            </div>

            {/* Results */}
            <div className="command-results">
              {filtered.length === 0 ? (
                <div className="command-empty">No sections match "{query}"</div>
              ) : (
                filtered.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      className="command-result-item"
                      onClick={() => handleSelect(section.id)}
                    >
                      <div className="command-result-icon">
                        <Icon size={16} />
                      </div>
                      <div className="command-result-text">
                        <span className="command-result-label">{section.label}</span>
                        <span className="command-result-desc">{section.desc}</span>
                      </div>
                      <span className="command-result-hint">↵ Jump</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="command-footer">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
