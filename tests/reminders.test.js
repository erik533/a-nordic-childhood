import test from "node:test";
import assert from "node:assert/strict";
import { reminderDue } from "../api/reminders.js";

const accepted = { status: "accepted", feedback_status: "pending", withdrawn_at: null, accepted_at: "2026-08-01T08:00:00.000Z", reminder_day3_sent_at: null, reminder_day7_sent_at: null };
const atDay = (day) => new Date(`2026-08-${String(1 + day).padStart(2, "0")}T09:00:00.000Z`);

test("sends day 3 and prioritizes day 7", () => {
  assert.equal(reminderDue(accepted, atDay(2)), null);
  assert.equal(reminderDue(accepted, atDay(3)), "day3");
  assert.equal(reminderDue(accepted, atDay(7)), "day7");
});

test("does not repeat a sent reminder", () => {
  assert.equal(reminderDue({ ...accepted, reminder_day3_sent_at: "2026-08-04T09:00:00Z" }, atDay(4)), null);
  assert.equal(reminderDue({ ...accepted, reminder_day7_sent_at: "2026-08-08T09:00:00Z" }, atDay(8)), null);
});

test("stops after qualifying feedback or withdrawal, while no-use remains eligible", () => {
  assert.equal(reminderDue({ ...accepted, feedback_status: "usable" }, atDay(8)), null);
  assert.equal(reminderDue({ ...accepted, withdrawn_at: "2026-08-03T00:00:00Z" }, atDay(8)), null);
  assert.equal(reminderDue({ ...accepted, feedback_status: "no_use" }, atDay(7)), "day7");
});
