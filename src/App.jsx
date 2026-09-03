import { useEffect, useSyncExternalStore, useState, useCallback } from 'react';
import {
  subscribe, getSnapshot, pushLog, resetCampaign,
} from './webmcp/campaignStore.js';
import { registerWebMCPTools } from './webmcp/registerTools.js';
import Sidebar from './components/layout/Sidebar.jsx';
import KPIRow from './components/campaign/KPIRow.jsx';
import CampaignBrief from './components/campaign/CampaignBrief.jsx';
import AudiencePanel from './components/campaign/AudiencePanel.jsx';
import BudgetChart from './components/campaign/BudgetChart.jsx';
import AdCopyPreview from './components/campaign/AdCopyPreview.jsx';
import ScheduleTimeline from './components/campaign/ScheduleTimeline.jsx';
import PerformanceMetrics from './components/campaign/PerformanceMetrics.jsx';
import AgentActivityLog from './components/agent/AgentActivityLog.jsx';
import Toast from './components/ui/Toast.jsx';
import {
  Sparkles, Zap, Globe, Rocket, Bot, Terminal, RotateCcw,
  Wifi, WifiOff, Users, SlidersHorizontal,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* =====================================================================
 * APP — Agent-Native Architecture
 *
 * There is NO local AI/parser. The app waits passively for an
 * external WebMCP agent (ChatGPT, Chrome AI) to call the tools.
 * When a tool fires, the campaignStore updates and React re-renders.
 * =================================================================== */
export default function App() {
  const store = useSyncExternalStore(subscribe, getSnapshot);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [webmcpReady, setWebmcpReady] = useState(false);

  // Register WebMCP tools on mount
  useEffect(() => {
    const registered = registerWebMCPTools();
    setWebmcpReady(!!registered);

    // Check periodically if WebMCP becomes available (agent connects)
    if (!registered) {
      const interval = setInterval(() => {
        if (window.document?.modelContext) {
          const ok = registerWebMCPTools();
          if (ok) {
            setWebmcpReady(true);
            clearInterval(interval);
          }
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  // Toasts from agent log
  useEffect(() => {
    if (store.agentLog.length > 0) {
      const last = store.agentLog[store.agentLog.length - 1];
      setToasts(prev => [...prev, last]);
    }
  }, [store.agentLog]);

  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  const handleNewCampaign = useCallback(() => {
    resetCampaign();
    setToasts([]);
  }, []);

  const hasData = !!(store.brief || store.audience || store.adCopies.length > 0);
  const isComplete = !!(store.brief && store.audience && store.adCopies.length > 0 && store.budget && store.schedule);

  const completedSections = [store.brief, store.audience, store.adCopies.length > 0, store.budget, store.schedule, store.performance]
    .filter(Boolean).length;

  /* ================================================================
   *  LANDING PAGE — Explains WebMCP to judges
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
            <Zap size={14} /> The WebMCP Challenge — Devpost 2026
          </div>

          <h1 className="landing-title">
            <Sparkles size={36} className="landing-icon" />
            <span>Agent</span><span className="text-gradient">Campaign</span>
          </h1>

          <p className="landing-desc">
            The first <strong>agent-native</strong> marketing dashboard.
            No buttons to click — your AI agent connects via <code>document.modelContext</code> and
            builds complete ad campaigns using <strong>7 registered WebMCP tools</strong>.
            You review, override, and collaborate.
          </p>

          <div className="landing-how">
            <div className="landing-how-step">
              <div className="landing-how-icon"><Bot size={20} /></div>
              <div>
                <strong>1. Agent Connects</strong>
                <span>Open this page in ChatGPT's browser or with a WebMCP Chrome extension. The agent discovers 7 tools automatically.</span>
              </div>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-icon"><Terminal size={20} /></div>
              <div>
                <strong>2. Agent Builds</strong>
                <span>Tell the agent: "Build a campaign for my fashion brand in NYC." It calls generate_brief → set_audience → ad_copy → budget → schedule → analytics.</span>
              </div>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-icon"><SlidersHorizontal size={20} /></div>
              <div>
                <strong>3. Human Collaborates</strong>
                <span>Adjust the AI's budget with sliders. Edit ad copy inline. Your changes auto-update performance projections. True human-AI collaboration.</span>
              </div>
            </div>
          </div>

          <div className="landing-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => setShowLanding(false)}>
              <Rocket size={18} /> Open Dashboard
            </button>
            <div className="landing-tech-badges">
              <span className="tech-badge"><Globe size={12} /> WebMCP Standard</span>
              <span className="tech-badge">document.modelContext.registerTool</span>
              <span className="tech-badge">Human-in-the-Loop</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ================================================================
   *  MAIN DASHBOARD — Agent-Native, No Local Simulation
   * ================================================================ */
  return (
    <motion.div className="app-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
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
        {/* Simplified navbar — no fake buttons */}
        <header className="navbar" role="banner">
          <div className="navbar-left">
            <div className="navbar-breadcrumb">
              <span>Dashboard</span>
              {store.brief && (
                <>
                  <span className="navbar-breadcrumb-sep">/</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{store.brief.name}</span>
                </>
              )}
            </div>
          </div>
          <div className="navbar-right">
            {hasData && (
              <button className="navbar-btn navbar-btn-ghost" onClick={handleNewCampaign}>
                <RotateCcw style={{ width: 15, height: 15 }} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </header>

        <main className="main-content">

          {/* ─── WebMCP Connection Status ─── */}
          <div className={`webmcp-status-banner ${webmcpReady ? 'connected' : 'waiting'}`}>
            <div className="webmcp-status-icon">
              {webmcpReady ? <Wifi size={20} /> : <WifiOff size={20} />}
            </div>
            <div className="webmcp-status-text">
              <strong>{webmcpReady ? '✅ WebMCP Connected — 7 Tools Registered' : '⏳ Waiting for AI Agent...'}</strong>
              <span>
                {webmcpReady
                  ? 'Your AI agent can now invoke tools. Tell it: "Build a campaign for my brand."'
                  : 'Open this page in ChatGPT\'s browser or use a WebMCP Chrome extension. The agent will discover tools via document.modelContext.'}
              </span>
            </div>
            {!hasData && !webmcpReady && (
              <div className="webmcp-status-tools">
                <span className="tool-chip">generate_campaign_brief</span>
                <span className="tool-chip">set_target_audience</span>
                <span className="tool-chip">generate_ad_copy</span>
                <span className="tool-chip">allocate_budget</span>
                <span className="tool-chip">schedule_campaign</span>
                <span className="tool-chip">preview_campaign</span>
                <span className="tool-chip">analyze_performance</span>
              </div>
            )}
          </div>

          {/* Progress indicator when agent is working */}
          {hasData && !isComplete && (
            <div className="build-progress-bar">
              <div className="build-progress-label">
                <Sparkles size={14} />
                <span>Agent building campaign… {completedSections}/6 sections complete</span>
              </div>
              <div className="build-progress-track">
                <motion.div
                  className="build-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSections / 6) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Campaign status bar */}
          {store.brief && (
            <div className="campaign-status-bar">
              <span className="campaign-status-name">
                <Sparkles size={14} /> {store.brief.name}
              </span>
              <div className="campaign-status-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleNewCampaign}>
                  <RotateCcw size={14} /> Reset
                </button>
                {isComplete && (
                  <button className="btn btn-success btn-sm" onClick={() => pushLog('result', '🚀 Campaign Launched', 'All channels are now live!')}>
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

          {/* Dashboard Grid — appears as agent fills sections */}
          {hasData && (
            <div className="dashboard-grid">
              <div className="col-5">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                  <div id="section-brief"><CampaignBrief brief={store.brief} /></div>
                  <div id="section-audience"><AudiencePanel audience={store.audience} /></div>
                </div>
              </div>
              <div className="col-7">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                  <div id="section-adcopy"><AdCopyPreview copies={store.adCopies} /></div>
                  <div id="section-budget"><BudgetChart budget={store.budget} /></div>
                </div>
              </div>
              <div className="col-12" id="section-schedule">
                <ScheduleTimeline schedule={store.schedule} />
              </div>
              <div className="col-7" id="section-performance">
                <PerformanceMetrics performance={store.performance} />
              </div>
              <div className="col-5" id="section-agentlog">
                <AgentActivityLog logs={store.agentLog} />
              </div>
            </div>
          )}

          {/* Empty state — only when no data and no agent */}
          {!hasData && (
            <div className="empty-dashboard">
              <div className="empty-dashboard-content">
                <Users size={48} style={{ color: 'var(--accent-violet)', opacity: 0.4, marginBottom: 'var(--sp-4)' }} />
                <h3>Your dashboard is ready</h3>
                <p>
                  Connect an AI agent to start building campaigns.
                  The agent will use WebMCP tools to populate each section of this dashboard in real-time.
                </p>
                <div className="empty-dashboard-steps">
                  <div className="empty-step">
                    <span className="empty-step-num">1</span>
                    <span>Open this URL in ChatGPT or use a WebMCP Chrome extension</span>
                  </div>
                  <div className="empty-step">
                    <span className="empty-step-num">2</span>
                    <span>Tell the agent: "Build a marketing campaign for [your brand]"</span>
                  </div>
                  <div className="empty-step">
                    <span className="empty-step-num">3</span>
                    <span>Watch the dashboard populate, then adjust with sliders and edit fields</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
