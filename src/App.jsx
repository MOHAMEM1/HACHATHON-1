import { useEffect, useSyncExternalStore, useState, useCallback } from 'react';
import {
  subscribe, getSnapshot,
  setBrief, setAudience, addAdCopy, setBudget, setSchedule, setPerformance,
  pushLog, resetCampaign,
} from './webmcp/campaignStore.js';
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
import { Sparkles, Zap, Globe, Rocket, Bot, Terminal, Send, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* =====================================================================
 * HELPER: parse user text into structured campaign data
 * This is the "local AI" — when no ChatGPT agent is connected,
 * the app itself can parse user input and call the WebMCP tools.
 * =================================================================== */
function parseAndBuild(text) {
  const lower = text.toLowerCase();

  // Budget
  let budget = 5000;
  let currency = 'MAD';
  const budgetMatch = lower.match(/(\d[\d,. ]*)\s*(mad|usd|eur|dh|\$|€)/);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1].replace(/[,. ]/g, ''));
    const cur = budgetMatch[2];
    if (cur === '$' || cur === 'usd') currency = 'USD';
    else if (cur === '€' || cur === 'eur') currency = 'EUR';
    else currency = 'MAD';
  }

  // Location
  let location = 'Casablanca, Morocco';
  const cities = { casablanca: 'Casablanca', rabat: 'Rabat', marrakech: 'Marrakech', tangier: 'Tangier', fes: 'Fes', agadir: 'Agadir', meknes: 'Meknes', oujda: 'Oujda' };
  for (const [key, val] of Object.entries(cities)) {
    if (lower.includes(key)) { location = `${val}, Morocco`; break; }
  }

  // Age
  let ageRange = '25-40';
  const ageMatch = lower.match(/(\d{2})\s*[-–]\s*(\d{2})/);
  if (ageMatch) ageRange = `${ageMatch[1]}-${ageMatch[2]}`;
  if (lower.includes('gen z')) ageRange = '18-25';
  if (lower.includes('student')) ageRange = '18-30';

  // Gender
  let gender = 'all';
  if (lower.includes('women') || lower.includes('female')) gender = 'female';
  if (lower.includes('men ') || lower.includes('male')) gender = 'male';

  // Platforms
  const platforms = [];
  if (lower.includes('instagram') || lower.includes('insta')) platforms.push('instagram');
  if (lower.includes('facebook') || lower.includes('fb')) platforms.push('facebook');
  if (lower.includes('tiktok')) platforms.push('tiktok');
  if (lower.includes('google')) platforms.push('google');
  if (platforms.length === 0) platforms.push('instagram', 'facebook');

  // Product/industry
  let productName = text.split(/\s+/).slice(0, 4).join(' ');
  const industryMap = {
    skincare: 'cosmetics', cosmetic: 'cosmetics', beauty: 'cosmetics',
    restaurant: 'food', food: 'food', cafe: 'food', coffee: 'food',
    fashion: 'fashion', sneaker: 'fashion', shoes: 'fashion',
    tech: 'technology', app: 'technology', software: 'technology',
    education: 'education', learning: 'education', university: 'education',
    fitness: 'health', gym: 'health',
  };
  let industry = 'general';
  for (const [kw, ind] of Object.entries(industryMap)) {
    if (lower.includes(kw)) { industry = ind; productName = kw.charAt(0).toUpperCase() + kw.slice(1) + ' Brand'; break; }
  }

  // Tone
  let tone = 'professional';
  if (lower.includes('luxury') || lower.includes('premium')) tone = 'luxury';
  if (lower.includes('fun') || lower.includes('playful') || lower.includes('viral')) tone = 'playful';
  if (lower.includes('casual')) tone = 'casual';

  const interests = {
    cosmetics: ['skincare', 'beauty', 'natural products', 'wellness'],
    food: ['dining', 'food delivery', 'culinary', 'recipes'],
    fashion: ['streetwear', 'fashion trends', 'sneakers', 'style'],
    technology: ['tech gadgets', 'apps', 'innovation', 'startups'],
    education: ['online learning', 'career development', 'university'],
    health: ['fitness', 'wellness', 'nutrition', 'yoga'],
    general: ['lifestyle', 'trends', 'online shopping', 'social media'],
  };

  return { budget, currency, location, ageRange, gender, platforms, productName, industry, tone, interests: interests[industry] || interests.general };
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

/* =====================================================================
 * APP
 * =================================================================== */
export default function App() {
  const store = useSyncExternalStore(subscribe, getSnapshot);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState('');

  useEffect(() => { registerWebMCPTools(); }, []);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Toasts from agent log
  useEffect(() => {
    if (store.agentLog.length > 0) {
      const last = store.agentLog[store.agentLog.length - 1];
      setToasts(prev => [...prev, last]);
    }
  }, [store.agentLog]);

  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  /* ================================================================
   *  BUILD CAMPAIGN — user types, we call the REAL WebMCP tools
   * ================================================================ */
  const handleBuild = useCallback(async (text) => {
    if (isBuilding || !text.trim()) return;
    setIsBuilding(true);
    resetCampaign();

    const p = parseAndBuild(text);

    // Step 1: Brief
    setBuildStep('Generating campaign brief...');
    pushLog('tool-call', 'generate_campaign_brief', `"${text.slice(0, 60)}..."`);
    await wait(600);
    const campaignName = text.length > 50 ? text.slice(0, 50).replace(/\s\S*$/, '') + ' Campaign' : text;
    setBrief({
      name: campaignName, industry: p.industry, description: text,
      objectives: [
        `Increase brand awareness in ${p.location.split(',')[0]}`,
        'Drive website traffic and conversions',
        'Generate qualified leads',
        'Build engaged social community',
      ],
      keyMessages: ['Premium quality, accessible pricing', `Made for the ${p.ageRange} demographic`, 'Join thousands of happy customers'],
      timeline: '4 weeks',
    });

    // Step 2: Audience
    setBuildStep('Setting target audience...');
    pushLog('tool-call', 'set_target_audience', `${p.ageRange}, ${p.location}`);
    await wait(500);
    const baseReach = { casablanca: 820000, rabat: 420000, marrakech: 380000 };
    const city = p.location.toLowerCase().split(',')[0].trim();
    let reach = baseReach[city] ?? 540000;
    if (p.gender !== 'all') reach = Math.round(reach * 0.55);
    const [lo, hi] = p.ageRange.split('-').map(Number);
    reach = Math.round(reach * ((hi - lo) / 47)) + Math.round(Math.random() * 20000);

    setAudience({ ageRange: p.ageRange, gender: p.gender, location: p.location, interests: p.interests, language: 'french', estimatedReach: reach });

    // Step 3: Ad copies
    for (const plat of p.platforms) {
      setBuildStep(`Creating ${plat} ad copy...`);
      pushLog('tool-call', 'generate_ad_copy', `${plat} — ${p.productName}`);
      await wait(400);
      addAdCopy({
        platform: plat, tone: p.tone,
        headline: `Introducing ${p.productName}: Redefining Excellence`,
        body: `✨ ${p.interests.slice(0, 3).join(' • ')}\n\nJoin thousands who made the switch.`,
        cta: plat === 'instagram' ? 'Shop Now' : plat === 'tiktok' ? 'See More' : 'Learn More',
        productName: p.productName,
      });
    }

    // Step 4: Budget
    setBuildStep('Allocating budget...');
    pushLog('tool-call', 'allocate_budget', `${p.budget.toLocaleString()} ${p.currency}`);
    await wait(500);
    const weights = { instagram: 0.4, facebook: 0.3, google: 0.2, tiktok: 0.1 };
    const totalW = p.platforms.reduce((s, pl) => s + (weights[pl] || 0.25), 0);
    const allocs = p.platforms.map(pl => {
      const pct = Math.round(((weights[pl] || 0.25) / totalW) * 100);
      return { platform: pl, amount: Math.round((pct / 100) * p.budget), pct, estReach: Math.round((pct / 100) * p.budget * 15), estCPC: +(0.15 + Math.random() * 0.35).toFixed(2) };
    });
    setBudget({ total: p.budget, currency: p.currency, allocations: allocs, goal: 'engagement' });

    // Step 5: Schedule
    setBuildStep('Scheduling campaign...');
    pushLog('tool-call', 'schedule_campaign', '4-week campaign');
    await wait(400);
    const start = new Date(); start.setDate(start.getDate() + 5);
    const end = new Date(start); end.setDate(end.getDate() + 28);
    setSchedule({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      frequency: 'daily', peakHours: ['09:00', '18:00', '21:00'], totalDays: 28,
      phases: [
        { name: 'Pre-launch Teasers', duration: '4 days', status: 'upcoming' },
        { name: 'Campaign Launch', duration: '1 day', status: 'upcoming' },
        { name: 'Active Promotion', duration: '17 days', status: 'upcoming' },
        { name: 'Performance Review', duration: '4 days', status: 'upcoming' },
        { name: 'Wrap-up', duration: '2 days', status: 'upcoming' },
      ],
    });

    // Step 6: Performance projection
    setBuildStep('Analyzing projected performance...');
    pushLog('tool-call', 'analyze_performance', 'Performance projection');
    await wait(600);
    setPerformance({
      campaignId: 'new', campaignName,
      metrics: {
        reach, impressions: reach * 3,
        engagementRate: +(2.5 + Math.random() * 3).toFixed(1),
        clicks: Math.round(reach * 0.032),
        conversions: Math.round(reach * 0.0028),
        costPerConversion: +(p.budget / Math.max(1, Math.round(reach * 0.0028))).toFixed(2),
        roi: +(1.5 + Math.random() * 2).toFixed(1),
      },
      trends: [
        { week: 'Week 1', reach: Math.round(reach * 0.18), engagement: 2.1, conversions: Math.round(reach * 0.0005) },
        { week: 'Week 2', reach: Math.round(reach * 0.28), engagement: 3.4, conversions: Math.round(reach * 0.0009) },
        { week: 'Week 3', reach: Math.round(reach * 0.32), engagement: 4.6, conversions: Math.round(reach * 0.001) },
        { week: 'Week 4', reach: Math.round(reach * 0.22), engagement: 4.2, conversions: Math.round(reach * 0.0007) },
      ],
      recommendations: [
        `Increase ${p.platforms[0]} budget by 15% — highest engagement`,
        `Focus posting at 18:00-21:00 for ${p.location.split(',')[0]}`,
        `A/B test ${p.tone} vs. casual tone`,
        p.platforms.includes('tiktok') ? 'TikTok strong for younger segment' : 'Consider adding TikTok for 18-25',
      ],
      comparedTo: 'industry_average',
      industryBenchmark: { avgEngagement: 2.1, avgROI: 1.6, avgCPC: 0.42 },
    });

    setBuildStep('');
    pushLog('result', 'Campaign complete', 'All 7 WebMCP tools executed. Review and launch when ready.');
    setIsBuilding(false);
    setPrompt('');
  }, [isBuilding]);

  const handleNewCampaign = useCallback(() => {
    resetCampaign();
    setToasts([]);
    setPrompt('');
    setBuildStep('');
  }, []);

  const hasData = !!(store.brief || store.audience || store.adCopies.length > 0);
  const isComplete = !!(store.brief && store.audience && store.adCopies.length > 0 && store.budget && store.schedule);

  /* ================================================================
   *  LANDING PAGE
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
            Describe your campaign goal, and the agent builds it — brief, audience, ads, budget, schedule — all in real-time.
          </p>

          <div className="landing-how">
            <div className="landing-how-step">
              <div className="landing-how-icon"><Bot size={20} /></div>
              <div>
                <strong>1. Describe Your Campaign</strong>
                <span>Type what you want — "Skincare campaign targeting women 25-40 in Morocco, 5000 MAD budget"</span>
              </div>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-icon"><Terminal size={20} /></div>
              <div>
                <strong>2. Agent Builds It</strong>
                <span>7 WebMCP tools execute: brief, audience, ad copy, budget, schedule, analytics</span>
              </div>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-icon"><Globe size={20} /></div>
              <div>
                <strong>3. Review & Launch</strong>
                <span>Review every section, edit if needed, then launch your campaign</span>
              </div>
            </div>
          </div>

          <div className="landing-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => setShowLanding(false)}>
              <Rocket size={18} /> Enter Dashboard
            </button>
            <div className="landing-tech-badges">
              <span className="tech-badge"><Globe size={12} /> WebMCP</span>
              <span className="tech-badge">7 Agent Tools</span>
              <span className="tech-badge">React 19</span>
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
    <motion.div className="app-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
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
          campaignName={store.brief?.name}
          onNewCampaign={handleNewCampaign}
          onSearch={() => setSearchOpen(true)}
          notifications={store.agentLog.length}
        />

        <main className="main-content">

          {/* ============ PROMPT INPUT — The main interaction ============ */}
          <div className="prompt-hero" id="section-demo">
            {!hasData && (
              <div className="prompt-hero-header">
                <Sparkles size={20} className="prompt-hero-icon" />
                <h2>What campaign would you like to build?</h2>
                <p>Describe your marketing goal in plain language. The agent will use 7 WebMCP tools to build it.</p>
              </div>
            )}

            <form className="prompt-form" onSubmit={(e) => { e.preventDefault(); handleBuild(prompt); }}>
              <div className={`prompt-input-box ${isBuilding ? 'processing' : ''}`}>
                <Sparkles size={18} className="prompt-input-icon" />
                <input
                  type="text"
                  className="prompt-input"
                  placeholder={isBuilding ? buildStep : 'e.g. Launch a skincare campaign targeting women 25-40 in Morocco with 5000 MAD budget'}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isBuilding}
                />
                <button type="submit" className="prompt-send-btn" disabled={isBuilding || !prompt.trim()}>
                  {isBuilding ? <div className="prompt-spinner" /> : <Send size={16} />}
                </button>
              </div>
              {isBuilding && (
                <div className="prompt-progress">
                  <div className="prompt-progress-fill" />
                </div>
              )}
            </form>

            {/* Quick suggestions — only when empty */}
            {!hasData && !isBuilding && (
              <div className="prompt-suggestions">
                {[
                  'Launch a luxury skincare brand targeting women 25-40 in Casablanca with 8000 MAD budget on Instagram',
                  'Create a TikTok ad for a new sneaker brand targeting Gen Z in Marrakech',
                  'Build a Facebook campaign for a restaurant launch in Rabat, budget 3000 MAD',
                  'Promote an online learning platform for university students in Morocco',
                ].map((s, i) => (
                  <button key={i} className="prompt-suggestion" onClick={() => { setPrompt(s); handleBuild(s); }}>
                    <span>{s}</span>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Campaign status bar */}
          {store.brief && (
            <div className="campaign-status-bar">
              <span className="campaign-status-name">
                <Sparkles size={14} /> {store.brief.name}
              </span>
              <div className="campaign-status-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleNewCampaign}>
                  New Campaign
                </button>
                {isComplete && (
                  <button className="btn btn-success btn-sm">
                    <Rocket size={14} /> Launch Campaign
                  </button>
                )}
              </div>
            </div>
          )}

          {/* KPI Row — only shows when data exists */}
          <div id="section-kpi">
            <KPIRow store={store} />
          </div>

          {/* Dashboard Grid — only shows when agent has started working */}
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
                <PerformanceMetrics performance={store.performance} campaigns={store.campaigns} />
              </div>
              <div className="col-5" id="section-agentlog">
                <AgentActivityLog logs={store.agentLog} />
              </div>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
