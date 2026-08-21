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
  if (participant.status !== "accepted" || participant.feedback_status !== "pending" || participant.withdrawn_at) return null;
  const accepted = new Date(participant.accepted_at);
  const days = (now - accepted) / 86400000;
  if (days >= 8 && !participant.reminder_feedback_sent_at) return "feedback";
  if (days >= 4 && !participant.reminder_session_sent_at) return "session";
  if (days >= 2 && !participant.downloaded_at && !participant.reminder_print_sent_at) return "print";
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return methodNotAllowed(res, ["GET", "POST"]);
  if (!authorized(req)) return json(res, 401, { error: "not_authorized" });
  try {
    const participants = await supabase("pilot_participants?status=eq.accepted&feedback_status=eq.pending&withdrawn_at=is.null&select=*");
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
        const field = `reminder_${kind}_sent_at`;
        await updateParticipant(participant.id, { [field]: new Date().toISOString(), updated_at: new Date().toISOString() });
        await recordEvent({ participantId: participant.id, sessionId: participant.landing_session_id, name: `reminder_${kind}_sent`, metadata: { providerId: delivery.id } });
        summary.sent += 1;
      } catch (error) {
        console.error("reminder_participant_failed", participant.id, error);
        summary.failed += 1;
      }
    }
    return json(res, 200, summary);
  } catch (error) {
    console.error("reminders_failed", error);
    return json(res, 500, { error: "reminders_unavailable" });
  }
}
