import test from "node:test";
import assert from "node:assert/strict";
import { assessEligibility, validateApplication } from "../lib/eligibility.js";

const base = {
  adultFirstName: "Erik",
  adultEmail: "erik@example.com",
  childAgeBand: "5",
  activityLanguage: "English",
  countsAloud: "yes",
  countsFive: "sometimes",
  matchesNumerals: "sometimes",
  composesNumbers: "not_yet",
  printerFormat: "a4",
  participationConfirmed: true,
  privacyConfirmed: true,
};

test("accepts the provisional target stage", () => {
  assert.deepEqual(validateApplication(base), {});
  assert.deepEqual(assessEligibility(base), { qualified: true, reason: "provisional_fit" });
});

test("routes an already-confident learner out of the narrow pilot", () => {
  const input = { ...base, countsFive: "usually", matchesNumerals: "usually", composesNumbers: "usually" };
  assert.equal(assessEligibility(input).reason, "likely_too_advanced");
});

test("routes a learner with no emerging count signal out for now", () => {
  const input = { ...base, countsAloud: "not_yet", countsFive: "not_yet", matchesNumerals: "not_yet", composesNumbers: "not_yet" };
  assert.equal(assessEligibility(input).reason, "likely_too_early");
});

test("keeps the first round English-only", () => {
  assert.equal(assessEligibility({ ...base, activityLanguage: "Swedish" }).reason, "language_outside_first_round");
});

test("requires contact, qualification, timing, and privacy fields", () => {
  const errors = validateApplication({ ...base, adultEmail: "", privacyConfirmed: false });
  assert.ok(errors.adultEmail);
  assert.ok(errors.privacyConfirmed);
});
