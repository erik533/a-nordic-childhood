import test from "node:test";
import assert from "node:assert/strict";
import { aggregateTraffic } from "../lib/traffic.js";

const now = new Date("2026-08-22T10:00:00Z");

function event(id, session, name, occurredAt, metadata = {}, participantId = null) {
  return {
    id,
    landing_session_id: session,
    participant_id: participantId,
    event_name: name,
    occurred_at: occurredAt,
    metadata,
  };
}

test("traffic counts approximate sessions and funnel conversion", () => {
  const result = aggregateTraffic([
    event(1, "facebook-1", "landing_view", "2026-08-22T08:00:00Z", { utm_source: "facebook" }),
    event(2, "facebook-1", "landing_view", "2026-08-22T08:00:01Z", { utm_source: "facebook" }),
    event(3, "facebook-1", "application_started", "2026-08-22T08:01:00Z"),
    event(4, "facebook-1", "application_submitted", "2026-08-22T08:03:00Z", {}, "participant-1"),
    event(5, "tiktok-1", "landing_view", "2026-08-21T08:00:00Z", { utm_source: "tiktok" }),
    event(6, "old", "landing_view", "2026-08-01T08:00:00Z"),
  ], now);

  assert.deepEqual(result.periods.today, { visits: 1, started: 1, submitted: 1, conversion: 100 });
  assert.deepEqual(result.periods.sevenDays, { visits: 2, started: 1, submitted: 1, conversion: 50 });
  assert.deepEqual(result.periods.total, { visits: 3, started: 1, submitted: 1, conversion: 33.3 });
  assert.equal(result.sources.find((row) => row.source === "Facebook").submitted, 1);
  assert.equal(result.sources.find((row) => row.source === "TikTok").visits, 1);
  assert.equal(result.sources.find((row) => row.source === "Direct or untagged").visits, 1);
});

test("invalid timestamps are ignored", () => {
  const result = aggregateTraffic([event(1, "bad", "landing_view", "not-a-date")], now);
  assert.equal(result.periods.total.visits, 0);
});
