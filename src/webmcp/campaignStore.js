/* =====================================================================
 * Campaign Store — reactive state that bridges WebMCP tools ↔ UI
 *
 * Why not Redux / Zustand?  Zero extra deps keeps the bundle tiny and
 * lets judges open campaignStore.js and instantly grasp the data flow.
 * Every WebMCP tool execute() writes here; React components subscribe
 * via useSyncExternalStore.
 * =================================================================== */

let state = {
  /* ---- Campaign brief ---- */
  brief: null,
  /* shape: { name, industry, description, objectives[], keyMessages[], timeline } */

  /* ---- Target audience ---- */
  audience: null,
  /* shape: { ageRange, gender, location, interests[], language, estimatedReach } */

  /* ---- Ad copy per platform ---- */
  adCopies: [],
  /* shape: [{ platform, tone, headline, body, cta, productName }] */

  /* ---- Budget allocation ---- */
  budget: null,
  /* shape: { total, currency, allocations[{platform,amount,pct,estReach,estCPC}], goal } */

  /* ---- Schedule ---- */
  schedule: null,
  /* shape: { startDate, endDate, frequency, peakHours[], phases[] } */

  /* ---- Performance ---- */
  performance: null,

  /* ---- Agent activity feed ---- */
  agentLog: [],

  /* ---- Campaigns list (empty — agent fills this) ---- */
  campaigns: [],
};

/* ---- Subscriber mechanism ---- */
const listeners = new Set();

function emitChange() {
  listeners.forEach((fn) => fn());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return state;
}

/* ---- Updaters (called by WebMCP tools and UI) ---- */

export function setBrief(brief) {
  state = { ...state, brief };
  pushLog('result', 'Campaign brief generated', `"${brief.name}" — ${brief.objectives.length} objectives defined`);
  emitChange();
}

export function setAudience(audience) {
  state = { ...state, audience };
  pushLog('result', 'Target audience configured', `${audience.ageRange} ${audience.gender}, ${audience.location} — Est. reach ${audience.estimatedReach?.toLocaleString() ?? '—'}`);
  emitChange();
}

export function addAdCopy(copy) {
  state = { ...state, adCopies: [...state.adCopies, copy] };
  pushLog('result', `Ad copy created for ${copy.platform}`, `"${copy.headline}"`);
  emitChange();
}

export function setBudget(budget) {
  state = { ...state, budget };
  const summary = budget.allocations.map((a) => `${a.platform} ${a.pct}%`).join(', ');
  pushLog('result', 'Budget allocated', `${budget.total.toLocaleString()} ${budget.currency} → ${summary}`);
  emitChange();
}

export function setSchedule(schedule) {
  state = { ...state, schedule };
  pushLog('result', 'Campaign scheduled', `${schedule.startDate} → ${schedule.endDate}, ${schedule.frequency}`);
  emitChange();
}

export function setPerformance(perf) {
  state = { ...state, performance: perf };
  pushLog('result', 'Performance analysis complete', `ROI: ${perf.metrics?.roi ?? '—'}x — ${perf.recommendations?.[0] ?? ''}`);
  emitChange();
}

export function pushLog(type, action, detail) {
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    type,
    action,
    detail,
    time: new Date(),
  };
  state = { ...state, agentLog: [...state.agentLog, entry] };
  emitChange();
}

export function resetCampaign() {
  state = {
    ...state,
    brief: null,
    audience: null,
    adCopies: [],
    budget: null,
    schedule: null,
    performance: null,
    agentLog: [],
  };
  emitChange();
}
