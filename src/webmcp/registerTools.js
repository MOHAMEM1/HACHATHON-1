/* =====================================================================
 * WebMCP Tool Registration
 *
 * This module registers all tools that AI agents (ChatGPT, Chrome AI,
 * etc.) can invoke through the WebMCP standard.  Each tool has:
 *   - name          unique identifier the agent sees
 *   - description   human-readable purpose (guides the agent)
 *   - inputSchema   JSON-Schema for the parameters
 *   - execute()     async function that performs the action and returns
 *                   a result the agent can read back
 *
 * Tools update the shared campaignStore so the React UI reacts in
 * real-time — giving users a live "agent is working" experience.
 * =================================================================== */

import {
  setBrief,
  setAudience,
  addAdCopy,
  setBudget,
  setSchedule,
  setPerformance,
  pushLog,
  getSnapshot,
} from './campaignStore.js';

/* ---- helpers ---- */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function estimateReach(location, ageRange, gender) {
  const base = { casablanca: 820000, rabat: 420000, marrakech: 380000, tangier: 310000, fes: 290000 };
  const city = location?.toLowerCase().split(',')[0].trim() ?? '';
  let reach = base[city] ?? 540000;
  if (gender !== 'all') reach = Math.round(reach * 0.55);
  const [lo, hi] = (ageRange ?? '18-65').split('-').map(Number);
  reach = Math.round(reach * ((hi - lo) / 47));
  return reach + Math.round(Math.random() * 20000);
}

const headlines = {
  instagram: {
    luxury: (p) => `Discover ${p} — Where Elegance Meets Innovation`,
    casual: (p) => `Your new obsession just dropped 👀 — ${p}`,
    professional: (p) => `Introducing ${p}: Redefining Excellence`,
    playful: (p) => `${p} is HERE and we can't even 🔥`,
  },
  facebook: {
    luxury: (p) => `Experience the Art of ${p}`,
    casual: (p) => `Meet ${p} — your next favorite thing`,
    professional: (p) => `${p}: Built for Those Who Demand More`,
    playful: (p) => `Stop scrolling. ${p} just changed the game 🎯`,
  },
  google: {
    luxury: (p) => `${p} — Premium Quality, Unmatched Results`,
    casual: (p) => `Try ${p} Today — See the Difference`,
    professional: (p) => `${p}: Trusted by Industry Leaders`,
    playful: (p) => `${p} — Because You Deserve Better ✨`,
  },
  tiktok: {
    luxury: (p) => `${p} — The Luxury You've Been Waiting For`,
    casual: (p) => `POV: You just discovered ${p} 😍`,
    professional: (p) => `Why professionals choose ${p}`,
    playful: (p) => `${p} check ✅ — obsessed is an understatement`,
  },
};

const bodies = {
  instagram: (benefits) => `✨ ${benefits.slice(0, 3).join(' • ')}.\n\nJoin thousands who already made the switch. Limited availability — tap the link to explore.`,
  facebook: (benefits) => `Looking for ${benefits[0]?.toLowerCase() ?? 'something special'}? We've got you covered.\n\n${benefits.map((b) => `✓ ${b}`).join('\n')}\n\nClick below to learn more.`,
  google: (benefits) => `${benefits.slice(0, 2).join('. ')}. Shop now and enjoy free shipping on your first order.`,
  tiktok: (benefits) => `${benefits[0] ?? 'Something amazing'} 👉 Link in bio\n\n${benefits.slice(1, 3).map(b => `💫 ${b}`).join('\n')}`,
};

const ctas = {
  instagram: 'Shop Now',
  facebook: 'Learn More',
  google: 'Get Started',
  tiktok: 'See More',
};

/* ================================================================== */

export function registerWebMCPTools() {
  if (typeof document === 'undefined' || !document.modelContext) {
    console.info('[AgentCampaign] WebMCP API not available in this browser. Tools will work when opened in a WebMCP-enabled browser (ChatGPT or Chrome 149+).');
    return;
  }

  console.log('[AgentCampaign] Registering WebMCP tools…');

  /* ─── Tool 1: generate_campaign_brief ─── */
  document.modelContext.registerTool({
    name: 'generate_campaign_brief',
    description:
      'Generate a structured marketing campaign brief from a natural language description. Returns the campaign name, industry, objectives, key messages, and a phased timeline. Call this first when creating a new campaign.',
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Natural language description of the campaign (e.g. "Launch a luxury skincare line targeting women 25-40 in Morocco")',
        },
        industry: {
          type: 'string',
          description: 'Industry or sector such as cosmetics, tech, food, fashion, education',
        },
      },
      required: ['description'],
    },
    execute: async (input) => {
      pushLog('tool-call', 'generate_campaign_brief', `"${input.description.slice(0, 80)}…"`);
      await delay(600);

      const industry = input.industry ?? 'general';
      const desc = input.description;

      const brief = {
        name: desc.length > 50 ? desc.slice(0, 50).replace(/\s\S*$/, '') + ' Campaign' : desc + ' Campaign',
        industry,
        description: desc,
        objectives: [
          'Increase brand awareness in target market',
          'Drive website traffic and product discovery',
          'Generate qualified leads and conversions',
          'Build community engagement on social platforms',
        ],
        keyMessages: [
          'Premium quality meets accessible pricing',
          'Designed for the modern, discerning consumer',
          'Join a growing community of satisfied customers',
        ],
        timeline: '4 weeks',
      };

      setBrief(brief);
      return { success: true, brief, message: 'Campaign brief generated successfully. You can now set the target audience, generate ad copies, allocate budget, and schedule the campaign.' };
    },
  });

  /* ─── Tool 2: set_target_audience ─── */
  document.modelContext.registerTool({
    name: 'set_target_audience',
    description:
      'Configure the target audience for the campaign with demographics, interests, and geographic targeting. Updates the audience panel in the dashboard in real-time.',
    inputSchema: {
      type: 'object',
      properties: {
        age_range: { type: 'string', description: 'Target age range, e.g. "25-40"' },
        gender: { type: 'string', description: 'Target gender: male, female, or all' },
        location: { type: 'string', description: 'Target location, e.g. "Casablanca, Morocco"' },
        interests: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of audience interests such as ["beauty", "skincare", "fashion", "wellness"]',
        },
        language: { type: 'string', description: 'Primary language: arabic, french, english, darija' },
      },
      required: ['age_range', 'location'],
    },
    execute: async (input) => {
      pushLog('tool-call', 'set_target_audience', `${input.age_range}, ${input.location}`);
      await delay(500);

      const audience = {
        ageRange: input.age_range,
        gender: input.gender ?? 'all',
        location: input.location,
        interests: input.interests ?? ['general'],
        language: input.language ?? 'french',
        estimatedReach: estimateReach(input.location, input.age_range, input.gender ?? 'all'),
      };

      setAudience(audience);
      return { success: true, audience, message: `Audience configured. Estimated reach: ${audience.estimatedReach.toLocaleString()} people.` };
    },
  });

  /* ─── Tool 3: generate_ad_copy ─── */
  document.modelContext.registerTool({
    name: 'generate_ad_copy',
    description:
      'Generate ad copy for a specific platform. Returns a headline, body text, and call-to-action. You can call this multiple times for different platforms (instagram, facebook, google, tiktok).',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          description: 'Target platform: instagram, facebook, google, or tiktok',
        },
        tone: {
          type: 'string',
          description: 'Copy tone: professional, casual, luxury, or playful',
        },
        product_name: { type: 'string', description: 'Name of the product or service' },
        key_benefits: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key benefits to emphasize, e.g. ["Natural ingredients", "Dermatologist-approved"]',
        },
      },
      required: ['platform', 'product_name'],
    },
    execute: async (input) => {
      pushLog('tool-call', 'generate_ad_copy', `${input.platform} — ${input.product_name}`);
      await delay(700);

      const platform = input.platform.toLowerCase();
      const tone = input.tone?.toLowerCase() ?? 'professional';
      const benefits = input.key_benefits ?? ['High quality', 'Best value', 'Fast delivery'];

      const headlineFn = headlines[platform]?.[tone] ?? headlines.instagram.professional;
      const bodyFn = bodies[platform] ?? bodies.instagram;

      const copy = {
        platform,
        tone,
        headline: headlineFn(input.product_name),
        body: bodyFn(benefits),
        cta: ctas[platform] ?? 'Learn More',
        productName: input.product_name,
      };

      addAdCopy(copy);
      return { success: true, adCopy: copy, message: `Ad copy for ${platform} generated. Call again with a different platform to create more variations.` };
    },
  });

  /* ─── Tool 4: allocate_budget ─── */
  document.modelContext.registerTool({
    name: 'allocate_budget',
    description:
      'Allocate the campaign budget across platforms. Returns a breakdown with estimated reach and cost-per-click for each platform. Updates the budget chart in real-time.',
    inputSchema: {
      type: 'object',
      properties: {
        total_budget: { type: 'number', description: 'Total campaign budget amount (e.g. 5000)' },
        currency: { type: 'string', description: 'Currency code: MAD, USD, EUR, etc.' },
        platforms: {
          type: 'array',
          items: { type: 'string' },
          description: 'Platforms to spread budget across, e.g. ["instagram", "facebook"]',
        },
        optimization_goal: {
          type: 'string',
          description: 'What to optimize for: reach, clicks, conversions, or engagement',
        },
      },
      required: ['total_budget', 'currency'],
    },
    execute: async (input) => {
      pushLog('tool-call', 'allocate_budget', `${input.total_budget.toLocaleString()} ${input.currency}`);
      await delay(600);

      const platforms = input.platforms ?? ['instagram', 'facebook'];
      const goal = input.optimization_goal ?? 'reach';
      const total = input.total_budget;

      // Intelligent-looking split based on goal
      const weights = {
        reach:       { instagram: 0.4, facebook: 0.3, google: 0.2, tiktok: 0.1 },
        clicks:      { instagram: 0.25, facebook: 0.25, google: 0.35, tiktok: 0.15 },
        conversions: { instagram: 0.2, facebook: 0.3, google: 0.4, tiktok: 0.1 },
        engagement:  { instagram: 0.45, facebook: 0.2, google: 0.1, tiktok: 0.25 },
      };

      const w = weights[goal] ?? weights.reach;
      const activePlatforms = platforms.filter((p) => w[p] !== undefined);
      const totalWeight = activePlatforms.reduce((s, p) => s + (w[p] || 0.25), 0);

      const allocations = activePlatforms.map((p) => {
        const pct = Math.round(((w[p] || 0.25) / totalWeight) * 100);
        const amount = Math.round((pct / 100) * total);
        return {
          platform: p,
          amount,
          pct,
          estReach: Math.round(amount * (12 + Math.random() * 8)),
          estCPC: +(0.15 + Math.random() * 0.35).toFixed(2),
        };
      });

      const budget = { total, currency: input.currency, allocations, goal };
      setBudget(budget);
      return { success: true, budget, message: 'Budget allocated. The dashboard now shows the allocation breakdown.' };
    },
  });

  /* ─── Tool 5: schedule_campaign ─── */
  document.modelContext.registerTool({
    name: 'schedule_campaign',
    description:
      'Set the campaign schedule with start date, end date, posting frequency, and preferred times. Creates a visual timeline on the dashboard.',
    inputSchema: {
      type: 'object',
      properties: {
        start_date: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
        end_date: { type: 'string', description: 'End date in YYYY-MM-DD format' },
        posting_frequency: {
          type: 'string',
          description: 'Posting frequency: daily, every_other_day, or weekly',
        },
        peak_hours: {
          type: 'array',
          items: { type: 'string' },
          description: 'Preferred posting hours, e.g. ["09:00", "18:00", "21:00"]',
        },
      },
      required: ['start_date', 'end_date'],
    },
    execute: async (input) => {
      pushLog('tool-call', 'schedule_campaign', `${input.start_date} → ${input.end_date}`);
      await delay(500);

      const start = new Date(input.start_date);
      const end = new Date(input.end_date);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      const phases = [
        { name: 'Pre-launch Teasers', duration: `${Math.max(1, Math.round(diffDays * 0.15))} days`, status: 'upcoming' },
        { name: 'Campaign Launch', duration: '1 day', status: 'upcoming' },
        { name: 'Active Promotion', duration: `${Math.max(1, Math.round(diffDays * 0.6))} days`, status: 'upcoming' },
        { name: 'Performance Review & Adjust', duration: `${Math.max(1, Math.round(diffDays * 0.15))} days`, status: 'upcoming' },
        { name: 'Campaign Wrap-up', duration: `${Math.max(1, Math.round(diffDays * 0.1))} days`, status: 'upcoming' },
      ];

      const schedule = {
        startDate: input.start_date,
        endDate: input.end_date,
        frequency: input.posting_frequency ?? 'daily',
        peakHours: input.peak_hours ?? ['09:00', '18:00'],
        totalDays: diffDays,
        phases,
      };

      setSchedule(schedule);
      return { success: true, schedule, message: `Campaign scheduled for ${diffDays} days with ${phases.length} phases.` };
    },
  });

  /* ─── Tool 6: preview_campaign ─── */
  document.modelContext.registerTool({
    name: 'preview_campaign',
    description:
      'Get a full summary of the current campaign configuration. Returns all settings including brief, audience, ad copies, budget, and schedule in one view. Useful for reviewing before launch.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: 'Output format: summary (default), detailed, or export',
        },
      },
    },
    execute: async (input) => {
      pushLog('tool-call', 'preview_campaign', `format: ${input.format ?? 'summary'}`);
      await delay(300);

      const snap = getSnapshot();
      const preview = {
        brief: snap.brief,
        audience: snap.audience,
        adCopies: snap.adCopies,
        budget: snap.budget,
        schedule: snap.schedule,
        readiness: {
          hasBrief: !!snap.brief,
          hasAudience: !!snap.audience,
          hasAdCopy: snap.adCopies.length > 0,
          hasBudget: !!snap.budget,
          hasSchedule: !!snap.schedule,
          isReady: !!(snap.brief && snap.audience && snap.adCopies.length > 0 && snap.budget && snap.schedule),
        },
      };

      pushLog('result', 'Campaign preview ready', preview.readiness.isReady ? 'All sections complete ✓' : 'Some sections still need configuration');
      return { success: true, preview };
    },
  });

  /* ─── Tool 7: analyze_performance ─── */
  document.modelContext.registerTool({
    name: 'analyze_performance',
    description:
      'Analyze campaign performance metrics and provide optimization recommendations. Returns KPIs (reach, engagement rate, conversions, ROI) and actionable suggestions. Uses campaign demo data for demonstration.',
    inputSchema: {
      type: 'object',
      properties: {
        campaign_id: { type: 'string', description: 'Campaign ID to analyze (use "demo-1" for the sample campaign)' },
        metric: {
          type: 'string',
          description: 'Primary metric to focus analysis on: reach, engagement, conversions, or roi',
        },
        compare_to: {
          type: 'string',
          description: 'Comparison baseline: previous_period or industry_average',
        },
      },
      required: ['campaign_id'],
    },
    execute: async (input) => {
      pushLog('tool-call', 'analyze_performance', `Campaign: ${input.campaign_id}`);
      await delay(800);

      const snap = getSnapshot();
      const campaign = snap.campaigns.find((c) => c.id === input.campaign_id);

      if (!campaign) {
        return { success: false, error: 'Campaign not found. Available IDs: ' + snap.campaigns.map((c) => c.id).join(', ') };
      }

      const perf = {
        campaignId: campaign.id,
        campaignName: campaign.name,
        metrics: {
          reach: campaign.reach || 45200,
          impressions: (campaign.reach || 45200) * 3,
          engagementRate: campaign.engagement || 3.8,
          clicks: Math.round((campaign.reach || 45200) * 0.032),
          conversions: campaign.conversions || 127,
          costPerConversion: campaign.budget ? +(campaign.budget / (campaign.conversions || 127)).toFixed(2) : 39.37,
          roi: campaign.roi || 2.4,
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
        comparedTo: input.compare_to ?? 'industry_average',
        industryBenchmark: { avgEngagement: 2.1, avgROI: 1.6, avgCPC: 0.42 },
      };

      setPerformance(perf);
      return { success: true, performance: perf, message: 'Performance analysis complete. Dashboard updated with charts and recommendations.' };
    },
  });

  console.log('[AgentCampaign] ✓ 7 WebMCP tools registered successfully');
}
