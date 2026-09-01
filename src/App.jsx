import { useEffect, useSyncExternalStore, useState, useCallback, useRef } from 'react';
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
import PromptBar from './components/ui/PromptBar.jsx';
import Toast from './components/ui/Toast.jsx';
import ProgressBar from './components/ui/ProgressBar.jsx';
import CommandPalette from './components/ui/CommandPalette.jsx';
import { Sparkles, Zap, Globe, Play, RotateCcw, Rocket } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

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

/* =====================================================================
 * Smart parser: extract campaign info from natural language input
 * =================================================================== */
function parseUserInput(text) {
  const lower = text.toLowerCase();

  // Extract budget
  let budget = 5000;
  let currency = 'MAD';
  const budgetMatch = lower.match(/(\d[\d,. ]*)\s*(mad|usd|eur|dh)/);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1].replace(/[,. ]/g, ''));
    currency = budgetMatch[2].toUpperCase();
    if (currency === 'DH') currency = 'MAD';
  }

  // Extract location
  let location = 'Casablanca, Morocco';
  const cities = ['casablanca', 'rabat', 'marrakech', 'tangier', 'fes', 'agadir', 'meknes', 'oujda'];
  for (const city of cities) {
    if (lower.includes(city)) {
      location = city.charAt(0).toUpperCase() + city.slice(1) + ', Morocco';
      break;
    }
  }

  // Extract age range
  let ageRange = '25-40';
  const ageMatch = lower.match(/(\d{2})\s*[-–to]\s*(\d{2})/);
  if (ageMatch) ageRange = `${ageMatch[1]}-${ageMatch[2]}`;
  if (lower.includes('gen z') || lower.includes('genz')) ageRange = '18-25';
  if (lower.includes('student')) ageRange = '18-30';
  if (lower.includes('millennial')) ageRange = '25-35';

  // Extract gender
  let gender = 'all';
  if (lower.includes('women') || lower.includes('female') || lower.includes('femme')) gender = 'female';
  if (lower.includes('men ') || lower.includes('male') || lower.includes('homme')) gender = 'male';

  // Extract platforms
  const platforms = [];
  if (lower.includes('instagram') || lower.includes('insta')) platforms.push('instagram');
  if (lower.includes('facebook') || lower.includes('fb')) platforms.push('facebook');
  if (lower.includes('tiktok') || lower.includes('tik tok')) platforms.push('tiktok');
  if (lower.includes('google')) platforms.push('google');
  if (platforms.length === 0) platforms.push('instagram', 'facebook');

  // Extract industry/product
  let industry = 'general';
  let productName = 'Product';
  const industries = {
    'skincare': 'cosmetics', 'cosmetic': 'cosmetics', 'beauty': 'cosmetics', 'makeup': 'cosmetics',
    'restaurant': 'food', 'food': 'food', 'cafe': 'food', 'coffee': 'food',
    'fashion': 'fashion', 'clothing': 'fashion', 'sneaker': 'fashion', 'shoes': 'fashion',
    'tech': 'technology', 'app': 'technology', 'software': 'technology', 'saas': 'technology',
    'education': 'education', 'learning': 'education', 'course': 'education', 'university': 'education',
    'fitness': 'health', 'gym': 'health', 'health': 'health', 'wellness': 'health',
    'real estate': 'realestate', 'property': 'realestate', 'apartment': 'realestate',
  };
  for (const [keyword, ind] of Object.entries(industries)) {
    if (lower.includes(keyword)) {
      industry = ind;
      productName = keyword.charAt(0).toUpperCase() + keyword.slice(1) + ' Brand';
      break;
    }
  }

  // Extract tone
  let tone = 'professional';
  if (lower.includes('luxury') || lower.includes('premium')) tone = 'luxury';
  if (lower.includes('fun') || lower.includes('playful') || lower.includes('viral')) tone = 'playful';
  if (lower.includes('casual') || lower.includes('chill')) tone = 'casual';

  // Interests based on industry
  const interestMap = {
    cosmetics: ['skincare', 'beauty', 'natural products', 'wellness', 'fashion'],
    food: ['dining', 'food delivery', 'culinary', 'recipes', 'restaurants'],
    fashion: ['streetwear', 'fashion trends', 'sneakers', 'style', 'shopping'],
    technology: ['tech gadgets', 'apps', 'innovation', 'startups', 'AI'],
    education: ['online learning', 'career development', 'university', 'skills', 'books'],
    health: ['fitness', 'wellness', 'nutrition', 'mental health', 'yoga'],
    realestate: ['property', 'investment', 'interior design', 'architecture', 'luxury living'],
    general: ['lifestyle', 'trends', 'online shopping', 'social media', 'entertainment'],
  };

  return {
    description: text,
    budget, currency, location, ageRange, gender, platforms,
    industry, productName, tone,
    interests: interestMap[industry] || interestMap.general,
  };
}

export default function App() {
  const store = useSyncExternalStore(subscribe, getSnapshot);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [demoRunning, setDemoRunning] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [demoStep, setDemoStep] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [agentMessages, setAgentMessages] = useState([]);

  useEffect(() => {
    registerWebMCPTools();
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

  const addAgentMsg = (role, text) => {
    setAgentMessages(prev => [...prev, { id: Date.now() + '-' + Math.random().toString(36).slice(2, 5), role, text }]);
  };

  /* ================================================================
   *  CAMPAIGN BUILDER — triggered by user prompt
   * ================================================================ */
  const buildCampaign = useCallback(async (userText) => {
    if (demoRunning) return;
    setDemoRunning(true);
    resetCampaign();
    setDemoStep(0);

    // Parse the user's intent
    const parsed = parseUserInput(userText);

    // Show user message
    addAgentMsg('user', userText);
    await wait(800);

    // Agent acknowledges
    addAgentMsg('agent', `I'll build a ${parsed.industry} campaign targeting ${parsed.ageRange} in ${parsed.location} with a ${parsed.budget.toLocaleString()} ${parsed.currency} budget. Let me set everything up...`);
    await wait(1000);

    // Step 1: Generate brief
    setDemoStep(1);
    addAgentMsg('agent', '📋 Generating your campaign brief...');
    pushLog('tool-call', 'generate_campaign_brief', `"${userText.slice(0, 80)}"`);
    await wait(800);

    const campaignName = userText.length > 50
      ? userText.slice(0, 50).replace(/\s\S*$/, '') + ' Campaign'
      : userText.charAt(0).toUpperCase() + userText.slice(1);

    setBrief({
      name: campaignName,
      industry: parsed.industry,
      description: userText,
      objectives: [
        `Increase brand awareness in ${parsed.location.split(',')[0]} market`,
        'Drive website traffic and product discovery',
        'Generate qualified leads and first-time purchases',
        'Build engaged community on social platforms',
      ],
      keyMessages: [
        'Premium quality meets accessible pricing',
        `Designed for the ${parsed.ageRange} age group`,
        'Join a growing community of satisfied customers',
      ],
      timeline: '4 weeks',
    });
    scrollToSection('section-brief');
    await wait(1200);

    // Step 2: Set audience
    setDemoStep(2);
    addAgentMsg('agent', `🎯 Setting target audience: ${parsed.gender !== 'all' ? parsed.gender + ', ' : ''}${parsed.ageRange} in ${parsed.location}...`);
    pushLog('tool-call', 'set_target_audience', `${parsed.ageRange}, ${parsed.location}`);
    await wait(700);

    const estimatedReach = 250000 + Math.round(Math.random() * 200000);
    setAudience({
      ageRange: parsed.ageRange,
      gender: parsed.gender,
      location: parsed.location,
      interests: parsed.interests,
      language: 'french',
      estimatedReach,
    });
    scrollToSection('section-audience');
    await wait(1200);

    // Step 3: Generate ad for first platform
    setDemoStep(3);
    const p1 = parsed.platforms[0];
    addAgentMsg('agent', `✍️ Creating ${p1} ad copy with ${parsed.tone} tone...`);
    pushLog('tool-call', 'generate_ad_copy', `${p1} — ${parsed.productName}`);
    await wait(800);

    const headlinesMap = {
      luxury: (p) => `Discover ${p} — Where Elegance Meets Innovation`,
      casual: (p) => `Your new obsession just dropped 👀 — ${p}`,
      professional: (p) => `Introducing ${p}: Redefining Excellence`,
      playful: (p) => `${p} is HERE and we can't even 🔥`,
    };

    addAdCopy({
      platform: p1,
      tone: parsed.tone,
      headline: (headlinesMap[parsed.tone] || headlinesMap.professional)(parsed.productName),
      body: `✨ ${parsed.interests.slice(0, 3).join(' • ')}\n\nJoin thousands who already made the switch. Limited availability — tap the link to explore.`,
      cta: p1 === 'instagram' ? 'Shop Now' : p1 === 'facebook' ? 'Learn More' : p1 === 'tiktok' ? 'See More' : 'Get Started',
      productName: parsed.productName,
    });
    scrollToSection('section-adcopy');
    await wait(1000);

    // Step 4: Generate ad for second platform (if any)
    if (parsed.platforms.length > 1) {
      setDemoStep(4);
      const p2 = parsed.platforms[1];
      addAgentMsg('agent', `✍️ Creating ${p2} ad variant...`);
      pushLog('tool-call', 'generate_ad_copy', `${p2} — ${parsed.productName}`);
      await wait(600);
      addAdCopy({
        platform: p2,
        tone: parsed.tone,
        headline: `${parsed.productName}: Built for Those Who Demand More`,
        body: `Looking for the best? We've got you covered.\n\n${parsed.interests.map(i => `✓ ${i}`).join('\n')}\n\nClick below to learn more.`,
        cta: 'Learn More',
        productName: parsed.productName,
      });
      await wait(1000);
    } else {
      setDemoStep(4);
      await wait(400);
    }

    // Step 5: Budget
    setDemoStep(5);
    addAgentMsg('agent', `💰 Allocating ${parsed.budget.toLocaleString()} ${parsed.currency} across ${parsed.platforms.join(', ')}...`);
    pushLog('tool-call', 'allocate_budget', `${parsed.budget.toLocaleString()} ${parsed.currency}`);
    await wait(800);

    const weights = { instagram: 0.45, facebook: 0.25, google: 0.15, tiktok: 0.15 };
    const totalWeight = parsed.platforms.reduce((s, p) => s + (weights[p] || 0.25), 0);
    const allocations = parsed.platforms.map(p => {
      const pct = Math.round(((weights[p] || 0.25) / totalWeight) * 100);
      const amount = Math.round((pct / 100) * parsed.budget);
      return {
        platform: p, amount, pct,
        estReach: Math.round(amount * (12 + Math.random() * 8)),
        estCPC: +(0.15 + Math.random() * 0.35).toFixed(2),
      };
    });

    setBudget({
      total: parsed.budget,
      currency: parsed.currency,
      allocations,
      goal: 'engagement',
    });
    scrollToSection('section-budget');
    await wait(1200);

    // Step 6: Schedule
    setDemoStep(6);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 28);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    addAgentMsg('agent', `📅 Scheduling campaign: ${startStr} → ${endStr}...`);
    pushLog('tool-call', 'schedule_campaign', `${startStr} → ${endStr}`);
    await wait(600);

    setSchedule({
      startDate: startStr,
      endDate: endStr,
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

    // Step 7: Performance
    setDemoStep(7);
    addAgentMsg('agent', '📊 Analyzing projected performance...');
    pushLog('tool-call', 'analyze_performance', 'Campaign projection');
    await wait(900);

    setPerformance({
      campaignId: 'new-campaign',
      campaignName: campaignName,
      metrics: {
        reach: estimatedReach,
        impressions: estimatedReach * 3,
        engagementRate: +(2.5 + Math.random() * 3).toFixed(1),
        clicks: Math.round(estimatedReach * 0.032),
        conversions: Math.round(estimatedReach * 0.0028),
        costPerConversion: +(parsed.budget / Math.round(estimatedReach * 0.0028)).toFixed(2),
        roi: +(1.5 + Math.random() * 2).toFixed(1),
      },
      trends: [
        { week: 'Week 1', reach: Math.round(estimatedReach * 0.18), engagement: 2.1, conversions: Math.round(estimatedReach * 0.0005) },
        { week: 'Week 2', reach: Math.round(estimatedReach * 0.28), engagement: 3.4, conversions: Math.round(estimatedReach * 0.0009) },
        { week: 'Week 3', reach: Math.round(estimatedReach * 0.32), engagement: 4.6, conversions: Math.round(estimatedReach * 0.001) },
        { week: 'Week 4', reach: Math.round(estimatedReach * 0.22), engagement: 4.2, conversions: Math.round(estimatedReach * 0.0007) },
      ],
      recommendations: [
        `Increase ${parsed.platforms[0]} budget by 15% — highest projected engagement`,
        `Shift posting times to 18:00-21:00 for better reach in ${parsed.location.split(',')[0]}`,
        `A/B test ${parsed.tone} vs. casual tone — data suggests variety improves results`,
        parsed.platforms.includes('tiktok') ? 'TikTok shows strong potential for the younger segment' : 'Consider adding TikTok to reach 18-25 demographic',
      ],
      comparedTo: 'industry_average',
      industryBenchmark: { avgEngagement: 2.1, avgROI: 1.6, avgCPC: 0.42 },
    });
    scrollToSection('section-performance');

    addAgentMsg('agent', `✅ Campaign ready! All 7 sections are configured. Review the dashboard below, edit anything you'd like, then click Launch Campaign when ready.`);
    pushLog('result', 'Campaign built', `All 7 WebMCP tools executed successfully.`);
    setDemoRunning(false);
  }, [demoRunning]);

  const handleReset = useCallback(() => {
    resetCampaign();
    setToasts([]);
    setDemoStep(0);
    setAgentMessages([]);
  }, []);

  const handleNewCampaign = useCallback(() => {
    handleReset();
  }, [handleReset]);

  /* ================================================================
   *  LANDING PAGE — minimal, straight to the app
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
            The marketing dashboard where <strong>you</strong> describe what you want, and an <strong>AI agent</strong> builds it in real-time.
            No forms. No menus. Just tell the agent your goal.
          </p>

          <div className="landing-how">
            <div className="landing-how-step">
              <div className="landing-how-num">1</div>
              <div>
                <strong>You describe</strong>
                <span>"Launch a skincare campaign targeting women 25-40 in Morocco"</span>
              </div>
            </div>
            <div className="landing-how-arrow">→</div>
            <div className="landing-how-step">
              <div className="landing-how-num">2</div>
              <div>
                <strong>Agent builds</strong>
                <span>Brief, audience, ad copy, budget, schedule — all via WebMCP</span>
              </div>
            </div>
            <div className="landing-how-arrow">→</div>
            <div className="landing-how-step">
              <div className="landing-how-num">3</div>
              <div>
                <strong>You review & launch</strong>
                <span>Edit anything, approve, and go live</span>
              </div>
            </div>
          </div>

          <div className="landing-ctas">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowLanding(false)}
            >
              <Rocket size={18} /> Open Dashboard
            </button>
            <div className="landing-tech-badges">
              <span className="tech-badge"><Globe size={12} /> WebMCP</span>
              <span className="tech-badge">React 19</span>
              <span className="tech-badge">7 Agent Tools</span>
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
          {/* PromptBar — THE main interaction point */}
          <div id="section-demo">
            <PromptBar
              onSubmit={buildCampaign}
              isProcessing={demoRunning}
              agentMessages={agentMessages}
            />
          </div>

          {/* Quick status bar */}
          {store.brief && (
            <div className="campaign-status-bar">
              <span className="campaign-status-name">
                <Sparkles size={14} /> {store.brief.name}
              </span>
              <div className="campaign-status-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                  <RotateCcw size={14} /> Reset
                </button>
                {store.brief && store.audience && store.adCopies.length > 0 && store.budget && store.schedule && (
                  <button className="btn btn-success btn-sm" onClick={() => {
                    addAgentMsg('agent', '🚀 Campaign launched successfully! All channels are now active.');
                  }}>
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
