import test from "node:test";
import assert from "node:assert/strict";
import { assessEligibility, validateApplication } from "../lib/eligibility.js";

const base = { adultFirstName: "Erik", adultEmail: "erik@example.com", childAgeBand: "5", learningStage: "emerging", participationConfirmed: true, privacyConfirmed: true };

test("accepts the narrow emerging stage without using age as a rejection rule", () => {
  assert.deepEqual(validateApplication(base), {});
  assert.deepEqual(assessEligibility({ ...base, childAgeBand: "7_or_older" }), { qualified: true, reason: "clear_fit" });
});

test("routes early and confident stages out of this draft", () => {
  assert.equal(assessEligibility({ ...base, learningStage: "beginning" }).reason, "likely_too_early");
  assert.equal(assessEligibility({ ...base, learningStage: "confident" }).reason, "likely_too_advanced");
});

test("routes an unsure answer to manual review", () => {
  assert.deepEqual(assessEligibility({ ...base, learningStage: "unsure" }), { qualified: true, reason: "manual_unsure" });
});

test("requires contact, stage, participation, and privacy fields", () => {
  const errors = validateApplication({ ...base, adultEmail: "", learningStage: "", privacyConfirmed: false });
  assert.ok(errors.adultEmail);
  assert.ok(errors.learningStage);
  assert.ok(errors.privacyConfirmed);
});
