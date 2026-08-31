import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Zap, Loader } from 'lucide-react';

export default function Toast({ log, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    'tool-call': { icon: Zap, color: 'var(--accent-violet)', bg: 'rgba(139,92,246,0.1)' },
    'result': { icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(34,197,94,0.1)' },
    'thinking': { icon: Loader, color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)' }
  }[log.type] || { icon: Zap, color: 'white', bg: 'var(--bg-elevated)' };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="toast glass"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
        marginBottom: '8px',
        width: '320px',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: `3px solid ${config.color}`
      }}
    >
      <div style={{ background: config.bg, color: config.color, padding: '8px', borderRadius: '8px' }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
          {log.action}
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {log.detail}
        </p>
      </div>
      <button onClick={onClose} style={{ color: 'var(--text-tertiary)', padding: '4px' }}>
        <X size={14} />
      </button>
    </motion.div>
  );
}
