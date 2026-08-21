import test from "node:test";
import assert from "node:assert/strict";
import { reminderDue } from "../api/reminders.js";

const accepted = {
  status: "accepted",
  feedback_status: "pending",
  withdrawn_at: null,
  accepted_at: "2026-08-01T08:00:00.000Z",
  downloaded_at: null,
  reminder_print_sent_at: null,
  reminder_session_sent_at: null,
  reminder_feedback_sent_at: null,
};

const atDay = (day) => new Date(`2026-08-${String(1 + day).padStart(2, "0")}T09:00:00.000Z`);

test("sends the print reminder after day two only if not downloaded", () => {
  assert.equal(reminderDue(accepted, atDay(2)), "print");
  assert.equal(reminderDue({ ...accepted, downloaded_at: "2026-08-02T09:00:00Z" }, atDay(2)), null);
});

test("sends session at day four and prioritises feedback at day eight", () => {
  assert.equal(reminderDue(accepted, atDay(4)), "session");
  assert.equal(reminderDue(accepted, atDay(8)), "feedback");
});

test("stops reminders after feedback or withdrawal", () => {
  assert.equal(reminderDue({ ...accepted, feedback_status: "submitted" }, atDay(8)), null);
  assert.equal(reminderDue({ ...accepted, withdrawn_at: "2026-08-03T00:00:00Z" }, atDay(8)), null);
});
