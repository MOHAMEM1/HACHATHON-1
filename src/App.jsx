import { useEffect, useSyncExternalStore, useState, useCallback } from 'react';
import { subscribe, getSnapshot, resetCampaign } from './webmcp/campaignStore.js';
import { registerWebMCPTools } from './webmcp/registerTools.js';
import Sidebar from './components/layout/Sidebar.jsx';
import Navbar from './components/layout/Navbar.jsx';
import KPIRow from './components/campaign/KPIRow.jsx';
import CampaignBrief from './components/campaign/CampaignBrief.jsx';
import AudiencePanel from './components/campaign/AudiencePanel.jsx';
import BudgetChart from './components/campaign/BudgetChart.jsx';
import AdCopyPreview from './components/campaign/AdCopyPreview.jsx';
import ScheduleTimeline from './components/campaign/ScheduleTimeline.jsx';
import PerformanceMetrics from './components/campaign/PerformanceMetrics.jsx';
import AgentActivityLog from './components/agent/AgentActivityLog.jsx';
import Toast from './components/ui/Toast.jsx';
import CommandPalette from './components/ui/CommandPalette.jsx';
import { Sparkles, Zap, Globe, Rocket, Terminal, Bot } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const store = useSyncExternalStore(subscribe, getSnapshot);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isWebMCPReady, setIsWebMCPReady] = useState(false);

  useEffect(() => {
    // Register the tools for ChatGPT / Chrome AI to use
    registerWebMCPTools();
    
    // Check if the browser actually supports WebMCP
    if (typeof document !== 'undefined' && document.modelContext) {
      setIsWebMCPReady(true);
    }
  }, []);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Watch agent log for toasts
  useEffect(() => {
    if (store.agentLog.length > 0) {
      const lastLog = store.agentLog[store.agentLog.length - 1];
      setToasts(prev => [...prev, lastLog]);
    }
  }, [store.agentLog]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleReset = useCallback(() => {
    resetCampaign();
    setToasts([]);
  }, []);

  const hasData = !!(store.brief || store.audience || store.budget || store.adCopies.length > 0 || store.schedule);

  /* ================================================================
   *  LANDING PAGE — True WebMCP Explanation
   * ================================================================ */
  if (showLanding) {
    return (
      <div className="landing-minimal">
        <div className="landing-minimal-bg" />
        <motion.div
          className="landing-minimal-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="landing-badge">
            <Zap size={14} /> Built for the WebMCP Challenge
          </div>

          <h1 className="landing-title">
            <Sparkles size={36} className="landing-icon" />
            <span>Agent</span><span className="text-gradient">Campaign</span>
          </h1>

          <p className="landing-desc">
            A WebMCP-powered marketing dashboard where <strong>you and your AI agent</strong> collaborate.
            Instead of navigating complex menus, ask your agent (ChatGPT or Chrome AI) to build the campaign, and watch the dashboard update in real-time.
          </p>

          <div className="landing-how">
            <div className="landing-how-step">
              <div className="landing-how-icon"><Bot size={20} /></div>
              <div>
                <strong>1. Open with Agent</strong>
                <span>Open this page in ChatGPT app or Chrome with WebMCP enabled.</span>
              </div>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-icon"><Terminal size={20} /></div>
              <div>
                <strong>2. Chat & Request</strong>
                <span>Tell the agent: "Launch a skincare campaign in Morocco with 5000 MAD budget."</span>
              </div>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-icon"><Globe size={20} /></div>
              <div>
                <strong>3. Watch & Launch</strong>
                <span>The agent uses our WebMCP tools to build the campaign live on your dashboard.</span>
              </div>
            </div>
          </div>

          <div className="landing-ctas">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowLanding(false)}
            >
              <Rocket size={18} /> Enter Dashboard
            </button>
            <div className="landing-tech-badges">
              <span className="tech-badge"><Globe size={12} /> WebMCP Integration</span>
              <span className="tech-badge">7 Exposed Tools</span>
              <span className="tech-badge">No backend required</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ================================================================
   *  MAIN DASHBOARD
   * ================================================================ */
  return (
    <motion.div
      className="app-layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence>
          {toasts.slice(-4).map(toast => (
            <Toast key={toast.id} log={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>

      <Sidebar active={activeSection} onNavigate={setActiveSection} store={store} />

      <div className="main-area">
        <Navbar
          campaignName={store.brief?.name || 'Waiting for Agent...'}
          onNewCampaign={handleReset}
          onSearch={() => setSearchOpen(true)}
          notifications={store.agentLog.length}
        />

        <main className="main-content">
          
          {/* Connection Status Banner */}
          {!hasData && (
            <div className="webmcp-connection-banner">
              <div className="webmcp-connection-icon">
                <Bot size={24} />
              </div>
              <div className="webmcp-connection-text">
                <h3>{isWebMCPReady ? 'WebMCP Agent Connected' : 'Waiting for WebMCP Agent'}</h3>
                <p>
                  {isWebMCPReady 
                    ? 'Tools are registered. Open your agent chat and ask it to "create a new marketing campaign".' 
                    : 'Open this page in a WebMCP-enabled environment (ChatGPT app or Chrome with flags) to connect your AI agent.'}
                </p>
              </div>
              {/* Fallback demo button for local testing without an agent */}
              {!isWebMCPReady && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => {
                    import('./webmcp/registerTools.js').then(m => m.runFallbackDemoSequence());
                  }}
                >
                  <Terminal size={14} /> Run Test Sequence
                </button>
              )}
            </div>
          )}

          {/* Quick status bar (appears once agent starts working) */}
          {store.brief && (
            <div className="campaign-status-bar">
              <span className="campaign-status-name">
                <Sparkles size={14} /> {store.brief.name}
              </span>
              <div className="campaign-status-actions">
                {store.brief && store.audience && store.adCopies.length > 0 && store.budget && store.schedule && (
                  <button className="btn btn-success btn-sm">
                    <Rocket size={14} /> Launch Campaign
                  </button>
                )}
              </div>
            </div>
          )}

          {/* KPI Row */}
          <div id="section-kpi">
            <KPIRow store={store} />
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            <div className="col-5">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                <div id="section-brief">
                  <CampaignBrief brief={store.brief} />
                </div>
                <div id="section-audience">
                  <AudiencePanel audience={store.audience} />
                </div>
              </div>
            </div>

            <div className="col-7">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                <div id="section-adcopy">
                  <AdCopyPreview copies={store.adCopies} />
                </div>
                <div id="section-budget">
                  <BudgetChart budget={store.budget} />
                </div>
              </div>
            </div>

            <div className="col-12" id="section-schedule">
              <ScheduleTimeline schedule={store.schedule} />
            </div>

            <div className="col-7" id="section-performance">
              <PerformanceMetrics performance={store.performance} campaigns={store.campaigns} />
            </div>
            
            <div className="col-5" id="section-agentlog">
              <AgentActivityLog logs={store.agentLog} />
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
}
