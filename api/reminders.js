import crypto from "node:crypto";
import { reminderEmail, sendEmail } from "../lib/email.js";
import { json, methodNotAllowed } from "../lib/http.js";
import { recordEvent, supabase, updateParticipant } from "../lib/supabase.js";

function authorized(req) {
  const expected = process.env.CRON_SECRET || "";
  const received = (req.headers.authorization || "").replace(/^Bearer\s+/, "");
  if (!expected || !received || expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export function reminderDue(participant, now = new Date()) {
  if (participant.status !== "accepted" || participant.withdrawn_at) return null;
  if (!["pending", "no_use"].includes(participant.feedback_status)) return null;
  const accepted = new Date(participant.accepted_at);
  const days = (now - accepted) / 86400000;
  if (days >= 7) return participant.reminder_day7_sent_at ? null : "day7";
  if (days >= 3 && !participant.reminder_day3_sent_at) return "day3";
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return methodNotAllowed(res, ["GET", "POST"]);
  if (!authorized(req)) return json(res, 401, { error: "not_authorized" });
  try {
    const participants = await supabase("pilot_participants?status=eq.accepted&withdrawn_at=is.null&select=*");
    const summary = { checked: participants.length, sent: 0, failed: 0 };
    for (const participant of participants) {
      const kind = reminderDue(participant);
      if (!kind) continue;
      try {
        const tokenRow = await supabase(`pilot_token_delivery?participant_id=eq.${participant.id}&select=delivery_token`);
        const token = tokenRow?.[0]?.delivery_token;
        if (!token) throw new Error("Participant delivery token is unavailable.");
        const message = reminderEmail(kind, participant, token);
        const delivery = await sendEmail({ to: participant.adult_email, ...message });
        const field = kind === "day3" ? "reminder_day3_sent_at" : "reminder_day7_sent_at";
        await updateParticipant(participant.id, {
          [field]: new Date().toISOString(),
          email_delivery_failed_at: null,
          email_failure_kind: null,
          updated_at: new Date().toISOString(),
        });
        await recordEvent({
          participantId: participant.id,
          sessionId: participant.landing_session_id,
          name: `reminder_${kind}_sent`,
          metadata: { providerId: delivery.id },
        });
        summary.sent += 1;
      } catch (error) {
        console.error("reminder_participant_failed", participant.id, error);
        await updateParticipant(participant.id, {
          email_delivery_failed_at: new Date().toISOString(),
          email_failure_kind: kind === "day3" ? "reminder_day3" : "reminder_day7",
          updated_at: new Date().toISOString(),
        });
        summary.failed += 1;
      }
    }
    return json(res, 200, summary);
  } catch (error) {
    console.error("reminders_failed", error);
    return json(res, 500, { error: "reminders_unavailable" });
  }
}
