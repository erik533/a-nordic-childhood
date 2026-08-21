import test from "node:test";
import assert from "node:assert/strict";
import { assessFeedback } from "../api/feedback.js";
import { feedbackWindowOpen } from "../lib/pilot.js";

const base = { useOutcome: "used_with_objects", partsUsed: ["meet_two"], observedMoment: "She grouped two stones.", printingNote: "", friction: "Nothing.", continueChoice: "yes" };

test("actual use and genuine printing failure confirm completion", () => {
  assert.equal(assessFeedback(base).completionConfirmed, true);
  assert.equal(assessFeedback({ ...base, useOutcome: "printing_blocked", partsUsed: [], observedMoment: "", printingNote: "Printer scaled every page." }).completionConfirmed, true);
});

test("no use is saved without confirming completion", () => {
  const result = assessFeedback({ ...base, useOutcome: "not_tried", partsUsed: [], observedMoment: "" });
  assert.deepEqual(result.errors, []);
  assert.equal(result.completionConfirmed, false);
});

test("use requires a section and observed moment", () => {
  const result = assessFeedback({ ...base, partsUsed: [], observedMoment: "" });
  assert.deepEqual(result.errors, ["partsUsed", "observedMoment"]);
});

test("feedback remains open through the three-day grace period", () => {
  assert.equal(feedbackWindowOpen("2026-08-10", new Date("2026-08-13T23:59:59Z")), true);
  assert.equal(feedbackWindowOpen("2026-08-10", new Date("2026-08-14T00:00:00Z")), false);
});
