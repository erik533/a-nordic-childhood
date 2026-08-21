import crypto from "node:crypto";
import { json, methodNotAllowed } from "../lib/http.js";
import { supabase, updateParticipant } from "../lib/supabase.js";

function authorized(req) {
  const expected = process.env.CRON_SECRET || "";
  const received = (req.headers.authorization || "").replace(/^Bearer\s+/, "");
  if (!expected || !received || expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export function retentionDates(now = new Date()) {
  return {
    declinedBefore: new Date(now.getTime() - 30 * 86400000).toISOString(),
    anonymizeBefore: new Date(now.getTime() - 90 * 86400000).toISOString(),
    rewardDeleteBefore: new Date(now.getTime() - 90 * 86400000).toISOString(),
  };
}

async function removeParticipant(id) {
  await supabase(`pilot_participants?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return methodNotAllowed(res, ["GET", "POST"]);
  if (!authorized(req)) return json(res, 401, { error: "not_authorized" });

  try {
    const dates = retentionDates();
    const summary = { declinedDeleted: 0, feedbackAnonymized: 0, inactiveDeleted: 0, rewardRecordsDeleted: 0 };
    const declined = await supabase(`pilot_participants?status=eq.not_now&created_at=lt.${encodeURIComponent(dates.declinedBefore)}&select=id`);
    for (const participant of declined) {
      await removeParticipant(participant.id);
      summary.declinedDeleted += 1;
    }

    const settingsRows = await supabase("pilot_settings?pilot_key=eq.first_numbers_v1&select=*");
    const settings = settingsRows?.[0];
    if (settings?.cohort_reviewed_at && settings.cohort_reviewed_at < dates.anonymizeBefore) {
      const candidates = await supabase("pilot_participants?feedback_status=in.(usable,no_use)&feedback_anonymized_at=is.null&select=*");
      for (const participant of candidates) {
        const rows = await supabase(`pilot_feedback?participant_id=eq.${participant.id}&select=*`);
        const feedback = rows?.[0];
        if (feedback) {
          const { participant_id: ignoredParticipantId, ...anonymousResponse } = feedback;
          await supabase("pilot_feedback_anonymous", {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ response: anonymousResponse }),
          });
          await supabase(`pilot_feedback?participant_id=eq.${participant.id}`, { method: "DELETE" });
        }
        await supabase(`pilot_events?participant_id=eq.${participant.id}`, { method: "DELETE" });
        await supabase(`pilot_token_delivery?participant_id=eq.${participant.id}`, { method: "DELETE" });
        await updateParticipant(participant.id, {
          landing_session_id: null,
          child_age_band: null,
          activity_language: null,
          learning_stage: null,
          source: null,
          utm_source: null,
          utm_medium: null,
          utm_campaign: null,
          feedback_anonymized_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        summary.feedbackAnonymized += 1;
      }

      const inactive = await supabase("pilot_participants?reward_status=neq.confirmed&reward_status=neq.issued&select=id");
      for (const participant of inactive) {
        await removeParticipant(participant.id);
        summary.inactiveDeleted += 1;
      }
    }

    const rewarded = await supabase(`pilot_participants?reward_status=eq.issued&reward_issued_at=lt.${encodeURIComponent(dates.rewardDeleteBefore)}&select=id`);
    for (const participant of rewarded) {
      await removeParticipant(participant.id);
      summary.rewardRecordsDeleted += 1;
    }
    return json(res, 200, summary);
  } catch (error) {
    console.error("retention_failed", error);
    return json(res, 500, { error: "retention_unavailable" });
  }
}
