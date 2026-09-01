import { useEffect, useSyncExternalStore, useState, useCallback } from 'react';
import { subscribe, getSnapshot, setBrief, setAudience, addAdCopy, setBudget, setSchedule, setPerformance, pushLog, resetCampaign } from './webmcp/campaignStore.js';
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
import HeroSection from './components/landing/HeroSection.jsx';
import Toast from './components/ui/Toast.jsx';
import ProgressBar from './components/ui/ProgressBar.jsx';
import CommandPalette from './components/ui/CommandPalette.jsx';
import { Play, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Smooth-scroll to a section by id */
function scrollToSection(sectionId) {
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('section-highlight');
      setTimeout(() => el.classList.remove('section-highlight'), 2000);
    }
  }, 200);
}

export default function App() {
  const store = useSyncExternalStore(subscribe, getSnapshot);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [demoRunning, setDemoRunning] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [demoStep, setDemoStep] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    registerWebMCPTools();
  }, []);

  // ⌘K shortcut for Command Palette
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

  // Watch agent log for new toasts
  useEffect(() => {
    if (store.agentLog.length > 0) {
      const lastLog = store.agentLog[store.agentLog.length - 1];
      setToasts(prev => [...prev, lastLog]);
    }
  }, [store.agentLog]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  /* ================================================================
   *  DEMO RUNNER — with auto-scroll to each section
   * ================================================================ */
  const runDemo = useCallback(async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    resetCampaign();
    setDemoStep(0);
    setActiveSection('dashboard');
    await wait(500);

    // Step 1: Generate brief
    setDemoStep(1);
    pushLog('tool-call', 'generate_campaign_brief', '"Launch a premium skincare line targeting women in Morocco"');
    await wait(900);
    setBrief({
      name: 'Premium Skincare Launch Campaign',
      industry: 'cosmetics',
      description: 'Launch a premium skincare line targeting women 25-40 in Morocco with a focus on natural ingredients and dermatologist-approved formulas.',
      objectives: [
        'Increase brand awareness in Moroccan beauty market',
        'Drive website traffic and product discovery',
        'Generate qualified leads and first-time purchases',
        'Build engaged community on social platforms',
      ],
      keyMessages: [
        'Premium quality meets accessible luxury',
        'Formulated with Moroccan argan oil and natural ingredients',
        'Trusted by dermatologists, loved by women',
      ],
      timeline: '4 weeks',
    });
    scrollToSection('section-brief');
    await wait(1400);

    // Step 2: Set audience
    setDemoStep(2);
    pushLog('tool-call', 'set_target_audience', '25-40, Casablanca, Morocco');
    await wait(700);
    setAudience({
      ageRange: '25-40',
      gender: 'female',
      location: 'Casablanca, Morocco',
      interests: ['skincare', 'beauty', 'natural products', 'wellness', 'fashion'],
      language: 'french',
      estimatedReach: 387500,
    });
    scrollToSection('section-audience');
    await wait(1200);

    // Step 3: Generate Instagram ad
    setDemoStep(3);
    pushLog('tool-call', 'generate_ad_copy', 'instagram — Argan Glow Serum');
    await wait(800);
    addAdCopy({
      platform: 'instagram',
      tone: 'luxury',
      headline: 'Discover Argan Glow Serum — Where Elegance Meets Innovation',
      body: '✨ Natural Argan Oil • Dermatologist-Approved • Visible Results in 7 Days.\n\nJoin thousands who already made the switch. Limited availability — tap the link to explore.',
      cta: 'Shop Now',
      productName: 'Argan Glow Serum',
    });
    scrollToSection('section-adcopy');
    await wait(1000);

    // Step 4: Generate Facebook ad
    setDemoStep(4);
    pushLog('tool-call', 'generate_ad_copy', 'facebook — Argan Glow Serum');
    await wait(600);
    addAdCopy({
      platform: 'facebook',
      tone: 'professional',
      headline: 'Argan Glow Serum: Built for Those Who Demand More',
      body: 'Looking for premium skincare? We\'ve got you covered.\n\n✓ 100% Natural Argan Oil\n✓ Dermatologist-Approved Formula\n✓ Visible Results in 7 Days\n✓ Free Shipping Across Morocco\n\nClick below to learn more.',
      cta: 'Learn More',
      productName: 'Argan Glow Serum',
    });
    await wait(1200);

    // Step 5: Allocate budget
    setDemoStep(5);
    pushLog('tool-call', 'allocate_budget', '5,000 MAD');
    await wait(800);
    setBudget({
      total: 5000,
      currency: 'MAD',
      allocations: [
        { platform: 'instagram', amount: 2250, pct: 45, estReach: 28400, estCPC: 0.22 },
        { platform: 'facebook', amount: 1500, pct: 30, estReach: 18200, estCPC: 0.31 },
        { platform: 'google', amount: 750, pct: 15, estReach: 9800, estCPC: 0.38 },
        { platform: 'tiktok', amount: 500, pct: 10, estReach: 12600, estCPC: 0.18 },
      ],
      goal: 'engagement',
    });
    scrollToSection('section-budget');
    await wait(1200);

    // Step 6: Schedule
    setDemoStep(6);
    pushLog('tool-call', 'schedule_campaign', '2026-09-15 → 2026-10-13');
    await wait(600);
    setSchedule({
      startDate: '2026-09-15',
      endDate: '2026-10-13',
      frequency: 'daily',
      peakHours: ['09:00', '18:00', '21:00'],
      totalDays: 28,
      phases: [
        { name: 'Pre-launch Teasers', duration: '4 days', status: 'upcoming' },
        { name: 'Campaign Launch', duration: '1 day', status: 'upcoming' },
        { name: 'Active Promotion', duration: '17 days', status: 'upcoming' },
        { name: 'Performance Review & Adjust', duration: '4 days', status: 'upcoming' },
        { name: 'Campaign Wrap-up', duration: '2 days', status: 'upcoming' },
      ],
    });
    scrollToSection('section-schedule');
    await wait(1400);

    // Step 7: Analyze performance
    setDemoStep(7);
    pushLog('tool-call', 'analyze_performance', 'Campaign: demo-1');
    await wait(900);
    setPerformance({
      campaignId: 'demo-1',
      campaignName: 'Summer Collection Launch',
      metrics: {
        reach: 45200,
        impressions: 135600,
        engagementRate: 3.8,
        clicks: 1446,
        conversions: 127,
        costPerConversion: 39.37,
        roi: 2.4,
      },
      trends: [
        { week: 'Week 1', reach: 8400, engagement: 2.1, conversions: 15 },
        { week: 'Week 2', reach: 12800, engagement: 3.4, conversions: 34 },
        { week: 'Week 3', reach: 14200, engagement: 4.6, conversions: 45 },
        { week: 'Week 4', reach: 9800, engagement: 4.2, conversions: 33 },
      ],
      recommendations: [
        'Increase Instagram budget allocation by 15% — highest engagement rates',
        'Shift posting times to 18:00-21:00 for better reach in Morocco',
        'A/B test playful vs. luxury tone — engagement data suggests playful outperforms',
        'Consider adding TikTok to the media mix for the 25-30 segment',
      ],
      comparedTo: 'industry_average',
      industryBenchmark: { avgEngagement: 2.1, avgROI: 1.6, avgCPC: 0.42 },
    });
    scrollToSection('section-performance');

    pushLog('result', 'Demo complete', 'All 7 WebMCP tools executed successfully. The dashboard is now fully populated.');
    setDemoRunning(false);
  }, [demoRunning]);

  const handleReset = useCallback(() => {
    resetCampaign();
    setToasts([]);
    setDemoStep(0);
    scrollToSection('section-demo');
  }, []);

  const handleNewCampaign = useCallback(() => {
    handleReset();
    setTimeout(() => runDemo(), 300);
  }, [handleReset, runDemo]);

  /* ================================================================
   *  RENDER
   * ================================================================ */

  // Landing page with smooth exit
  if (showLanding) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
        >
          <HeroSection onLaunch={() => setShowLanding(false)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      className="app-layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Command Palette (Search) */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Toast Notification Container */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence>
          {toasts.slice(-4).map(toast => (
            <Toast key={toast.id} log={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>

      <Sidebar
        active={activeSection}
        onNavigate={setActiveSection}
        store={store}
      />

      <div className="main-area">
        <Navbar
          campaignName={store.brief?.name}
          onNewCampaign={handleNewCampaign}
          onSearch={() => setSearchOpen(true)}
          notifications={store.agentLog.length}
        />

        {demoRunning && (
          <div style={{ position: 'sticky', top: 'var(--navbar-height)', zIndex: 20 }}>
            <ProgressBar currentStep={demoStep} totalSteps={7} />
          </div>
        )}

        <main className="main-content">

          {/* Demo controls */}
          <div className="demo-controls card" id="section-demo">
            <div>
              <h1 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>
                <span className="text-gradient">AgentCampaign</span>
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 'var(--fs-sm)', marginLeft: 8 }}>
                  Agentic Marketing Dashboard
                </span>
              </h1>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', maxWidth: 600 }}>
                Open this page in ChatGPT's browser or Chrome with WebMCP enabled — the AI agent can use 7
                registered tools to build your campaign. Or click <strong>Run Demo</strong> to see it in action.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', flexShrink: 0 }}>
              {store.brief && (
                <button className="btn btn-secondary btn-md" onClick={handleReset} id="btn-reset">
                  <RotateCcw /> Reset
                </button>
              )}
              <button
                className="btn btn-primary btn-md"
                onClick={runDemo}
                disabled={demoRunning}
                id="btn-run-demo"
                style={demoRunning ? { opacity: 0.7, cursor: 'wait' } : {}}
              >
                <Play /> {demoRunning ? 'Running…' : 'Run Demo'}
              </button>
            </div>
          </div>

          {/* KPI overview row */}
          <div id="section-kpi">
            <KPIRow store={store} />
          </div>

          {/* Main grid */}
          <div className="dashboard-grid">
            {/* Left column — Brief + Audience */}
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

            {/* Right column — Ad Copy + Budget */}
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

            {/* Full width — Schedule */}
            <div className="col-12" id="section-schedule">
              <ScheduleTimeline schedule={store.schedule} />
            </div>

            {/* Performance + Agent Log */}
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
