const DAY_MS = 24 * 60 * 60 * 1000;

function sourceLabel(metadata = {}) {
  const raw = String(metadata.utm_source || "").trim().toLowerCase();
  if (!raw) return "Direct or untagged";
  if (raw.includes("facebook") || raw === "fb") return "Facebook";
  if (raw.includes("instagram") || raw === "ig") return "Instagram";
  if (raw.includes("tiktok") || raw === "tt") return "TikTok";
  if (raw.includes("community") || raw.includes("group")) return "Communities";
  return raw.slice(0, 40);
}

function eventIdentity(event) {
  return event.landing_session_id || event.participant_id || `event:${event.id}`;
}

function stockholmDate(value) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function summarize(events) {
  const visits = new Set();
  const started = new Set();
  const submitted = new Set();

  for (const event of events) {
    const identity = eventIdentity(event);
    if (event.event_name === "landing_view") visits.add(identity);
    if (event.event_name === "application_started") started.add(identity);
    if (event.event_name === "application_submitted") submitted.add(event.participant_id || identity);
  }

  const conversion = visits.size ? Math.round((submitted.size / visits.size) * 1000) / 10 : 0;
  return { visits: visits.size, started: started.size, submitted: submitted.size, conversion };
}

export function aggregateTraffic(events = [], now = new Date()) {
  const currentTime = now.getTime();
  const today = stockholmDate(now);
  const valid = events.filter((event) => Number.isFinite(new Date(event.occurred_at).getTime()));
  const todayEvents = valid.filter((event) => stockholmDate(event.occurred_at) === today);
  const sevenDayEvents = valid.filter((event) => new Date(event.occurred_at).getTime() >= currentTime - (7 * DAY_MS));

  const sourceBySession = new Map();
  for (const event of valid) {
    if (event.event_name === "landing_view" && event.landing_session_id) {
      sourceBySession.set(event.landing_session_id, sourceLabel(event.metadata));
    }
  }

  const grouped = new Map();
  for (const event of valid) {
    const source = sourceBySession.get(event.landing_session_id) || sourceLabel(event.metadata);
    if (!grouped.has(source)) grouped.set(source, []);
    grouped.get(source).push(event);
  }

  const sources = [...grouped.entries()]
    .map(([source, sourceEvents]) => ({ source, ...summarize(sourceEvents) }))
    .filter((row) => row.visits || row.started || row.submitted)
    .sort((a, b) => b.visits - a.visits || b.submitted - a.submitted || a.source.localeCompare(b.source));

  return {
    periods: {
      today: summarize(todayEvents),
      sevenDays: summarize(sevenDayEvents),
      total: summarize(valid),
    },
    sources,
    note: "Visits are approximate and do not represent persistent unique visitors.",
  };
}
