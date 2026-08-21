import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { marketingOptInAllowed } from "../api/marketing.js";
import { retentionDates } from "../api/retention.js";

test("marketing consent is explicit and available only after qualifying feedback", () => {
  const participant = { status: "accepted", withdrawn_at: null, completion_qualified_at: "2026-08-20T10:00:00Z", reward_status: "confirmed" };
  assert.equal(marketingOptInAllowed(participant, true), true);
  assert.equal(marketingOptInAllowed(participant, false), false);
  assert.equal(marketingOptInAllowed({ ...participant, completion_qualified_at: null }, true), false);
  assert.equal(marketingOptInAllowed({ ...participant, withdrawn_at: "2026-08-21T10:00:00Z" }, true), false);
});

test("retention windows are exactly 30 and 90 days", () => {
  const now = new Date("2026-08-21T12:00:00Z");
  const dates = retentionDates(now);
  assert.equal(dates.declinedBefore, "2026-07-22T12:00:00.000Z");
  assert.equal(dates.anonymizeBefore, "2026-05-23T12:00:00.000Z");
  assert.equal(dates.rewardDeleteBefore, "2026-05-23T12:00:00.000Z");
});

test("public page follows the approved section order", async () => {
  const html = await readFile(new URL("../founding-families/index.html", import.meta.url), "utf8");
  const markers = ["class=\"hero\"", "problem-section", "id=\"inside\"", "A narrow first round", "The Founding Families exchange", "How it works", "A note from Erik", "faq-section", "id=\"apply\""];
  let previous = -1;
  for (const marker of markers) {
    const current = html.indexOf(marker);
    assert.ok(current > previous, `${marker} is missing or out of order`);
    previous = current;
  }
});

test("download page leads with US Letter and explains the 19-page imposition", async () => {
  const html = await readFile(new URL("../founding-families/download/index.html", import.meta.url), "utf8");
  assert.ok(html.indexOf('data-edition="us_letter"') < html.indexOf('data-edition="a4"'));
  assert.match(html, /19 numbered pages paired across 10 landscape printer sheets/);
  assert.match(html, /one honest activity attempt is enough/);
});

test("all four application result states are represented", async () => {
  const apply = await readFile(new URL("../api/apply.js", import.meta.url), "utf8");
  const result = await readFile(new URL("../founding-families/result/result.js", import.meta.url), "utf8");
  for (const state of ["pending_review", "accepted", "waitlisted", "not_now"]) assert.match(apply, new RegExp(state));
  for (const state of ["pending_review", "waitlisted", "not_now"]) assert.match(result, new RegExp(state));
});

test("tracking uses the approved participant journey and no browser storage", async () => {
  const files = await Promise.all([
    "../founding-families/application.js", "../founding-families/shared.js", "../founding-families/feedback/feedback.js", "../api/apply.js", "../api/download.js", "../api/feedback.js", "../supabase/migrations/002_founding_families_revision.sql",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));
  const joined = files.join("\n");
  for (const event of ["landing_view", "application_started", "application_submitted", "approved", "pack_downloaded", "feedback_started", "feedback_submitted"]) assert.match(joined, new RegExp(event));
  assert.doesNotMatch(joined, /sessionStorage|localStorage|document\.cookie/);
});
