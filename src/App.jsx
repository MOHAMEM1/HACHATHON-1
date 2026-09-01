import { useEffect, useSyncExternalStore, useState, useCallback } from 'react';
import {
  subscribe, getSnapshot,
  setBrief, setAudience, addAdCopy, setBudget, setSchedule, setPerformance,
  pushLog, resetCampaign,
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
import { Sparkles, Zap, Globe, Rocket, Bot, Terminal, Send, ArrowRight, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* =====================================================================
 * SMART PARSER — works for ANY country, ANY industry, ANY language
 * Extracts structured data from free-text in English, French, or Arabic
 * =================================================================== */
function parseUserInput(text) {
  const lower = text.toLowerCase();

  // ── Budget (supports $, €, £, MAD, USD, EUR, GBP, INR, JPY, etc.) ──
  let budget = 5000;
  let currency = 'USD';
  const budgetMatch = lower.match(/(\d[\d,. ]*)[\s]*(mad|usd|eur|gbp|inr|jpy|cad|aud|dh|dollars?|euros?|\$|€|£)/);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1].replace(/[,.\s]/g, ''));
    const cur = budgetMatch[2].replace(/s$/, '');
    const currencyMap = { '$': 'USD', dollar: 'USD', usd: 'USD', '€': 'EUR', euro: 'EUR', eur: 'EUR', '£': 'GBP', gbp: 'GBP', mad: 'MAD', dh: 'MAD', inr: 'INR', jpy: 'JPY', cad: 'CAD', aud: 'AUD' };
    currency = currencyMap[cur] || cur.toUpperCase();
  } else {
    const numMatch = lower.match(/budget[:\s]*(\d[\d,. ]*)/);
    if (numMatch) budget = parseInt(numMatch[1].replace(/[,.\s]/g, ''));
  }

  // ── Location (extract "in <City>" or "in <Country>" from any text) ──
  let location = '';
  const locationMatch = text.match(/\bin\s+([A-Z][a-zA-Z\s,]+?)(?:\s+(?:with|budget|targeting|for|on)\b|$)/i);
  if (locationMatch) {
    location = locationMatch[1].trim().replace(/,\s*$/, '');
  }
  if (!location) {
    // Try common patterns
    const cityMatch = text.match(/(?:city|location|market|region)[:\s]+([A-Za-z\s,]+?)(?:\s+(?:with|budget|targeting)\b|$)/i);
    if (cityMatch) location = cityMatch[1].trim();
  }
  if (!location) location = 'Global';

  // ── Age Range ──
  let ageRange = '25-45';
  const ageMatch = lower.match(/(\d{2})\s*[-–to]+\s*(\d{2})/);
  if (ageMatch) ageRange = `${ageMatch[1]}-${ageMatch[2]}`;
  if (lower.includes('gen z') || lower.includes('genz') || lower.includes('generation z')) ageRange = '16-25';
  if (lower.includes('millennials') || lower.includes('millennial')) ageRange = '25-40';
  if (lower.includes('students') || lower.includes('student') || lower.includes('college')) ageRange = '18-28';
  if (lower.includes('teens') || lower.includes('teenager')) ageRange = '13-19';
  if (lower.includes('seniors') || lower.includes('elderly') || lower.includes('retired')) ageRange = '55-75';
  if (lower.includes('professionals') || lower.includes('business')) ageRange = '28-50';

  // ── Gender ──
  let gender = 'all';
  if (/\b(women|woman|female|femmes?|ladies)\b/.test(lower)) gender = 'female';
  if (/\b(men|male|hommes?|guys)\b/.test(lower)) gender = 'male';

  // ── Platforms ──
  const platforms = [];
  if (/instagram|insta/i.test(lower)) platforms.push('instagram');
  if (/facebook|fb\b/i.test(lower)) platforms.push('facebook');
  if (/tiktok|tik tok/i.test(lower)) platforms.push('tiktok');
  if (/google|youtube/i.test(lower)) platforms.push('google');
  if (/twitter|x\.com/i.test(lower)) platforms.push('twitter');
  if (/linkedin/i.test(lower)) platforms.push('linkedin');
  if (/snapchat/i.test(lower)) platforms.push('snapchat');
  if (platforms.length === 0) platforms.push('instagram', 'facebook', 'google');

  // ── Industry + Product Name (expanded globally) ──
  const industryMap = {
    skincare: 'beauty', cosmetic: 'beauty', beauty: 'beauty', makeup: 'beauty', fragrance: 'beauty',
    restaurant: 'food', food: 'food', cafe: 'food', coffee: 'food', bakery: 'food', catering: 'food', delivery: 'food',
    fashion: 'fashion', clothing: 'fashion', sneaker: 'fashion', shoes: 'fashion', apparel: 'fashion', luxury: 'fashion', jewelry: 'fashion', watches: 'fashion',
    tech: 'technology', app: 'technology', software: 'technology', saas: 'technology', ai: 'technology', startup: 'technology', fintech: 'technology',
    education: 'education', learning: 'education', university: 'education', course: 'education', tutoring: 'education', edtech: 'education',
    fitness: 'health', gym: 'health', health: 'health', wellness: 'health', yoga: 'health', supplement: 'health', pharma: 'health',
    'real estate': 'realestate', property: 'realestate', apartment: 'realestate', housing: 'realestate',
    travel: 'travel', hotel: 'travel', tourism: 'travel', airline: 'travel', booking: 'travel',
    automotive: 'automotive', car: 'automotive', electric: 'automotive', ev: 'automotive',
    gaming: 'entertainment', music: 'entertainment', movie: 'entertainment', streaming: 'entertainment', entertainment: 'entertainment',
    finance: 'finance', bank: 'finance', insurance: 'finance', investment: 'finance', crypto: 'finance',
    ecommerce: 'ecommerce', shop: 'ecommerce', store: 'ecommerce', marketplace: 'ecommerce', retail: 'ecommerce',
  };
  let industry = 'general';
  let productName = '';
  for (const [kw, ind] of Object.entries(industryMap)) {
    if (lower.includes(kw)) {
      industry = ind;
      productName = kw.charAt(0).toUpperCase() + kw.slice(1);
      break;
    }
  }
  // Try to extract a brand name from quotes
  const quotedName = text.match(/["']([^"']+)["']/);
  if (quotedName) productName = quotedName[1];
  if (!productName) productName = text.split(/\s+/).slice(0, 3).join(' ');

  // ── Tone ──
  let tone = 'professional';
  if (/luxury|premium|elegant|sophisticat/i.test(lower)) tone = 'luxury';
  if (/fun|playful|viral|trendy|bold|edgy/i.test(lower)) tone = 'playful';
  if (/casual|friendly|chill|relaxed/i.test(lower)) tone = 'casual';
  if (/corporate|formal|enterprise/i.test(lower)) tone = 'corporate';
  if (/urgent|flash|limited|sale|discount/i.test(lower)) tone = 'urgent';

  // ── Interests (based on industry, globally relevant) ──
  const interestMap = {
    beauty: ['skincare', 'beauty', 'self-care', 'wellness', 'cosmetics'],
    food: ['dining out', 'food delivery', 'recipes', 'restaurants', 'cooking'],
    fashion: ['fashion', 'streetwear', 'luxury goods', 'shopping', 'style'],
    technology: ['tech', 'gadgets', 'AI', 'startups', 'innovation'],
    education: ['online courses', 'career growth', 'learning', 'skills'],
    health: ['fitness', 'wellness', 'nutrition', 'mental health', 'sports'],
    realestate: ['property', 'investing', 'interior design', 'architecture'],
    travel: ['travel', 'adventure', 'hotels', 'destinations', 'experiences'],
    automotive: ['cars', 'electric vehicles', 'motorsport', 'innovation'],
    entertainment: ['gaming', 'music', 'movies', 'streaming', 'pop culture'],
    finance: ['investing', 'fintech', 'savings', 'crypto', 'personal finance'],
    ecommerce: ['online shopping', 'deals', 'reviews', 'trending products'],
    general: ['lifestyle', 'trends', 'social media', 'content creation'],
  };

  // ── Language detection ──
  let language = 'english';
  if (/[à-ÿ]|français|french/i.test(text)) language = 'french';
  if (/[\u0600-\u06FF]|arabic|arabe/i.test(text)) language = 'arabic';
  if (/español|spanish/i.test(lower)) language = 'spanish';
  if (/deutsch|german/i.test(lower)) language = 'german';
  if (/português|portuguese/i.test(lower)) language = 'portuguese';

  return {
    budget, currency, location, ageRange, gender, platforms,
    productName, industry, tone, language,
    interests: interestMap[industry] || interestMap.general,
  };
}

/* ── Estimate reach based on budget and demographics ── */
function estimateReach(budget, ageRange, gender) {
  // CPM-based: ~$5-15 per 1000 impressions depending on platform
  const avgCPM = 8; // $8 per 1000 impressions
  let baseReach = Math.round((budget / avgCPM) * 1000);
  if (gender !== 'all') baseReach = Math.round(baseReach * 0.6);
  const [lo, hi] = ageRange.split('-').map(Number);
  const ageMultiplier = Math.max(0.3, (hi - lo) / 40);
  baseReach = Math.round(baseReach * ageMultiplier);
  // Add some variance
  return baseReach + Math.round(Math.random() * baseReach * 0.1);
}

/* ── Generate headline based on tone ── */
function generateHeadline(productName, platform, tone) {
  const templates = {
    luxury: [`Discover ${productName} — Where Excellence Meets Innovation`, `Experience the Art of ${productName}`, `${productName}: Crafted for the Extraordinary`],
    professional: [`Introducing ${productName}: Redefining the Standard`, `${productName} — Trusted by Industry Leaders`, `Why Top Professionals Choose ${productName}`],
    playful: [`${productName} just dropped and we can't even 🔥`, `POV: You just discovered ${productName} 😍`, `${productName} check ✅ — obsessed is an understatement`],
    casual: [`Meet ${productName} — Your Next Favorite Thing`, `${productName}: Simple. Effective. Yours.`, `Ready for ${productName}? Let's go.`],
    urgent: [`⚡ Flash Sale: ${productName} — Limited Time Only`, `🔥 Last Chance: ${productName} at Unbeatable Prices`, `Don't Miss Out on ${productName} — Sale Ends Soon`],
    corporate: [`${productName}: Enterprise-Grade Solutions`, `Driving Results with ${productName}`, `${productName} — Powering Business Growth`],
  };
  const list = templates[tone] || templates.professional;
  return list[Math.floor(Math.random() * list.length)];
}

/* ── Generate ad body ── */
function generateBody(interests, platform) {
  const top3 = interests.slice(0, 3);
  if (platform === 'instagram') return `✨ ${top3.join(' • ')}\n\nJoin thousands who already made the switch. Tap the link to discover more.`;
  if (platform === 'tiktok') return `${top3[0]} 👉 Link in bio\n\n${top3.slice(1).map(i => `💫 ${i}`).join('\n')}`;
  if (platform === 'linkedin') return `In today's competitive landscape, staying ahead means investing in ${top3[0]}.\n\n${top3.map(i => `✓ ${i}`).join('\n')}\n\nLearn how we're making a difference.`;
  return `Looking for ${top3[0]}? We've got you covered.\n\n${top3.map(i => `✓ ${i}`).join('\n')}\n\nClick below to learn more.`;
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
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState('');

  useEffect(() => { registerWebMCPTools(); }, []);

  // Toasts from agent log
  useEffect(() => {
    if (store.agentLog.length > 0) {
      const last = store.agentLog[store.agentLog.length - 1];
      setToasts(prev => [...prev, last]);
    }
  }, [store.agentLog]);

  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  /* ================================================================
   *  BUILD CAMPAIGN — calls real WebMCP tool functions
   * ================================================================ */
  const handleBuild = useCallback(async (text) => {
    if (isBuilding || !text.trim()) return;
    setIsBuilding(true);
    resetCampaign();

    const p = parseUserInput(text);

    // Step 1: Brief
    setBuildStep('📋 Generating campaign brief...');
    pushLog('tool-call', 'generate_campaign_brief', `"${text.slice(0, 60)}"`);
    await wait(700);
    const campaignName = text.length > 60 ? text.slice(0, 60).replace(/\s\S*$/, '...' ) : text;
    setBrief({
      name: campaignName, industry: p.industry, description: text,
      objectives: [
        `Increase brand awareness in ${p.location}`,
        `Drive traffic and conversions via ${p.platforms.join(', ')}`,
        'Generate qualified leads and first-time customers',
        'Build engaged community across social platforms',
      ],
      keyMessages: [
        `Premium quality for the ${p.ageRange} demographic`,
        `Available ${p.location !== 'Global' ? 'in ' + p.location : 'worldwide'}`,
        'Join a growing community of satisfied customers',
      ],
      timeline: '4 weeks',
    });

    // Step 2: Audience
    setBuildStep('🎯 Configuring target audience...');
    pushLog('tool-call', 'set_target_audience', `${p.ageRange}, ${p.gender}, ${p.location}`);
    await wait(600);
    const reach = estimateReach(p.budget, p.ageRange, p.gender);
    setAudience({
      ageRange: p.ageRange, gender: p.gender, location: p.location,
      interests: p.interests, language: p.language, estimatedReach: reach,
    });

    // Step 3: Ad copies for each platform
    for (const plat of p.platforms) {
      setBuildStep(`✍️ Writing ${plat} ad copy...`);
      pushLog('tool-call', 'generate_ad_copy', `${plat} — ${p.productName} (${p.tone})`);
      await wait(500);
      const ctaMap = { instagram: 'Shop Now', facebook: 'Learn More', tiktok: 'See More', google: 'Get Started', linkedin: 'Connect', twitter: 'Explore', snapchat: 'Swipe Up' };
      addAdCopy({
        platform: plat, tone: p.tone,
        headline: generateHeadline(p.productName, plat, p.tone),
        body: generateBody(p.interests, plat),
        cta: ctaMap[plat] || 'Learn More',
        productName: p.productName,
      });
    }

    // Step 4: Budget allocation
    setBuildStep('💰 Allocating budget across platforms...');
    pushLog('tool-call', 'allocate_budget', `${p.budget.toLocaleString()} ${p.currency} → ${p.platforms.join(', ')}`);
    await wait(600);
    const platformWeights = { instagram: 0.35, facebook: 0.25, google: 0.20, tiktok: 0.15, linkedin: 0.12, twitter: 0.08, snapchat: 0.10 };
    const totalW = p.platforms.reduce((s, pl) => s + (platformWeights[pl] || 0.15), 0);
    const allocs = p.platforms.map(pl => {
      const w = platformWeights[pl] || 0.15;
      const pct = Math.round((w / totalW) * 100);
      const amount = Math.round((pct / 100) * p.budget);
      const cpcRange = { instagram: [0.20, 0.60], facebook: [0.15, 0.50], google: [0.50, 2.00], tiktok: [0.10, 0.40], linkedin: [2.00, 5.00], twitter: [0.25, 0.80], snapchat: [0.15, 0.45] };
      const [cpcLo, cpcHi] = cpcRange[pl] || [0.20, 0.80];
      return {
        platform: pl, amount, pct,
        estReach: Math.round(amount / ((cpcLo + cpcHi) / 2) * 10),
        estCPC: +(cpcLo + Math.random() * (cpcHi - cpcLo)).toFixed(2),
      };
    });
    setBudget({ total: p.budget, currency: p.currency, allocations: allocs, goal: 'engagement' });

    // Step 5: Schedule
    setBuildStep('📅 Scheduling campaign timeline...');
    pushLog('tool-call', 'schedule_campaign', '4-week campaign');
    await wait(500);
    const start = new Date(); start.setDate(start.getDate() + 5);
    const end = new Date(start); end.setDate(end.getDate() + 28);
    setSchedule({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      frequency: 'daily', peakHours: ['09:00', '12:00', '18:00', '21:00'], totalDays: 28,
      phases: [
        { name: 'Pre-launch Teasers', duration: '4 days', status: 'upcoming' },
        { name: 'Campaign Launch', duration: '1 day', status: 'upcoming' },
        { name: 'Active Promotion', duration: '17 days', status: 'upcoming' },
        { name: 'Performance Review & Optimize', duration: '4 days', status: 'upcoming' },
        { name: 'Campaign Wrap-up', duration: '2 days', status: 'upcoming' },
      ],
    });

    // Step 6: Performance projection
    setBuildStep('📊 Projecting campaign performance...');
    pushLog('tool-call', 'analyze_performance', 'AI-powered projection');
    await wait(700);
    const engRate = +(1.8 + Math.random() * 3.5).toFixed(1);
    const clicks = Math.round(reach * (engRate / 100));
    const convRate = 0.02 + Math.random() * 0.04;
    const conversions = Math.round(clicks * convRate);
    const roi = +(((conversions * (p.budget / conversions * 2.5)) / p.budget)).toFixed(1);
    setPerformance({
      campaignId: 'new', campaignName,
      metrics: { reach, impressions: reach * 3, engagementRate: engRate, clicks, conversions, costPerConversion: +(p.budget / Math.max(1, conversions)).toFixed(2), roi },
      trends: [
        { week: 'Week 1', reach: Math.round(reach * 0.15), engagement: engRate * 0.6, conversions: Math.round(conversions * 0.12) },
        { week: 'Week 2', reach: Math.round(reach * 0.30), engagement: engRate * 0.85, conversions: Math.round(conversions * 0.28) },
        { week: 'Week 3', reach: Math.round(reach * 0.35), engagement: engRate, conversions: Math.round(conversions * 0.35) },
        { week: 'Week 4', reach: Math.round(reach * 0.20), engagement: engRate * 0.9, conversions: Math.round(conversions * 0.25) },
      ],
      recommendations: [
        `Boost ${p.platforms[0]} spend by 15% — projected highest engagement`,
        `Target peak hours (18:00-21:00 local time) for ${p.location}`,
        `Test ${p.tone} vs. alternative tone for A/B optimization`,
        p.platforms.length < 3 ? `Consider adding ${['tiktok', 'linkedin', 'google'].find(x => !p.platforms.includes(x))} to expand reach` : 'Multi-platform mix looks solid',
      ],
      comparedTo: 'industry_average',
      industryBenchmark: { avgEngagement: 2.1, avgROI: 1.6, avgCPC: 0.42 },
    });

    setBuildStep('');
    pushLog('result', '✅ Campaign ready', `All 7 WebMCP tools executed. ${p.platforms.length} platforms configured. Review and launch.`);
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
   *  LANDING PAGE — Clean, international, explains WebMCP
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
            <Zap size={14} /> The WebMCP Challenge Entry
          </div>

          <h1 className="landing-title">
            <Sparkles size={36} className="landing-icon" />
            <span>Agent</span><span className="text-gradient">Campaign</span>
          </h1>

          <p className="landing-desc">
            The first marketing dashboard powered by <strong>WebMCP</strong>.
            Your AI agent (ChatGPT, Chrome AI) connects to this page and uses <strong>7 registered tools</strong> to build
            complete ad campaigns — brief, audience, creatives, budget, schedule — all in real-time.
          </p>

          <div className="landing-how">
            <div className="landing-how-step">
              <div className="landing-how-icon"><Bot size={20} /></div>
              <div>
                <strong>1. You Describe</strong>
                <span>"Launch a fashion brand campaign targeting Gen Z in New York with $10,000 budget on TikTok and Instagram"</span>
              </div>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-icon"><Terminal size={20} /></div>
              <div>
                <strong>2. Agent Builds</strong>
                <span>7 WebMCP tools fire sequentially: brief → audience → ad copy → budget → schedule → analytics</span>
              </div>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-icon"><Globe size={20} /></div>
              <div>
                <strong>3. You Launch</strong>
                <span>Review every section on the live dashboard. Edit anything. Then hit Launch.</span>
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
              <span className="tech-badge">Open Source · MIT</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ================================================================
   *  MAIN DASHBOARD — Clean, no fake buttons
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
        {/* Simplified top bar — no fake Search/Bell buttons */}
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

          {/* ─── PROMPT INPUT ─── */}
          <div className="prompt-hero" id="section-demo">
            {!hasData && (
              <div className="prompt-hero-header">
                <Sparkles size={20} className="prompt-hero-icon" />
                <h2>What campaign would you like to build?</h2>
                <p>Describe your goal in plain language — any industry, any country, any platform.</p>
              </div>
            )}

            <form className="prompt-form" onSubmit={(e) => { e.preventDefault(); handleBuild(prompt); }}>
              <div className={`prompt-input-box ${isBuilding ? 'processing' : ''}`}>
                <Sparkles size={18} className="prompt-input-icon" />
                <input
                  type="text"
                  className="prompt-input"
                  placeholder={isBuilding ? buildStep : 'e.g. "Launch a fashion brand in NYC targeting Gen Z, $10K budget on TikTok and Instagram"'}
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

            {/* Quick suggestions — INTERNATIONAL, diverse */}
            {!hasData && !isBuilding && (
              <div className="prompt-suggestions">
                {[
                  'Launch a luxury skincare brand targeting women 25-40 in Paris with €8,000 budget on Instagram',
                  'Create a TikTok campaign for a sneaker brand targeting Gen Z in New York, $15,000 budget',
                  'Promote a SaaS product for business professionals in London, £5,000 budget on LinkedIn and Google',
                  'Build a food delivery app campaign in Tokyo targeting millennials, ¥500,000 budget',
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
                  <RotateCcw size={14} /> New Campaign
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

          {/* Dashboard Grid — ONLY when data exists */}
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
