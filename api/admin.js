import { adminAuthorized } from "../lib/admin.js";
import { acceptedEmail, feedbackCompleteEmail, noUseEmail, notNowEmail, pendingReviewEmail, reminderEmail, sendEmail, waitlistEmail } from "../lib/email.js";
import { json, methodNotAllowed, parseBody } from "../lib/http.js";
import { cleanText } from "../lib/security.js";
import { recordEvent, supabase, updateParticipant } from "../lib/supabase.js";
import { aggregateTraffic } from "../lib/traffic.js";

async function participantToken(participantId) {
  const rows = await supabase(`pilot_token_delivery?participant_id=eq.${encodeURIComponent(participantId)}&select=delivery_token`);
  return rows?.[0]?.delivery_token || "";
}

async function sendStatusEmail(participant, token = "") {
  const message = participant.status === "accepted"
    ? acceptedEmail({ firstName: participant.adult_first_name, deadline: participant.personal_deadline, token })
    : participant.status === "pending_review"
      ? pendingReviewEmail({ firstName: participant.adult_first_name })
      : participant.status === "waitlisted"
        ? waitlistEmail({ firstName: participant.adult_first_name })
        : notNowEmail({ firstName: participant.adult_first_name });
  const delivery = await sendEmail({ to: participant.adult_email, ...message });
  await updateParticipant(participant.id, { email_delivery_failed_at: null, email_failure_kind: null, updated_at: new Date().toISOString() });
  await recordEvent({
    participantId: participant.id,
    sessionId: participant.landing_session_id,
    name: "admin_email_sent",
    metadata: { status: participant.status, providerId: delivery.id },
  });
}

async function dashboard() {
  const [settingsRows, participants, feedback, trafficEvents] = await Promise.all([
    supabase("pilot_settings?pilot_key=eq.first_numbers_v1&select=*"),
    supabase("pilot_participants?select=id,adult_first_name,adult_email,child_age_band,learning_stage,source,utm_source,utm_medium,utm_campaign,status,decision_reason,created_at,reviewed_at,accepted_at,personal_deadline,downloaded_at,downloaded_edition,feedback_status,reward_status,completion_qualified_at,email_delivery_failed_at,email_failure_kind,landing_session_id&order=created_at.desc"),
    supabase("pilot_feedback?select=participant_id,use_outcome,sections_used,printing_note,concrete_observation,instruction_friction,continue_next_week,continue_reason,anything_else,updated_at&order=updated_at.desc"),
    supabase("pilot_events?select=id,participant_id,landing_session_id,event_name,metadata,occurred_at&event_name=in.(landing_view,application_started,application_submitted)&order=occurred_at.asc&limit=5000"),
  ]);
  const counts = participants.reduce((result, participant) => {
    result[participant.status] = (result[participant.status] || 0) + 1;
    if (participant.downloaded_at) result.downloaded += 1;
    if (participant.completion_qualified_at) result.completed += 1;
    if (participant.email_delivery_failed_at) result.emailFailures += 1;
    return result;
  }, { pending_review: 0, accepted: 0, waitlisted: 0, not_now: 0, downloaded: 0, completed: 0, emailFailures: 0 });

  return {
    settings: settingsRows?.[0] || null,
    counts,
    pending: participants.filter((participant) => participant.status === "pending_review"),
    participants,
    feedback,
    traffic: aggregateTraffic(trafficEvents),
  };
}

export default async function handler(req, res) {
  if (!adminAuthorized(req)) return json(res, 401, { error: "not_authorized" });
  if (req.method === "GET") {
    try {
      return json(res, 200, await dashboard());
    } catch (error) {
      console.error("admin_dashboard_failed", error);
      return json(res, 500, { error: "admin_dashboard_unavailable" });
    }
  }
  if (req.method !== "POST") return methodNotAllowed(res, ["GET", "POST"]);

  try {
    const body = parseBody(req);
    const action = cleanText(body.action, 40);

    if (action === "decide") {
      const participantId = cleanText(body.participantId, 80);
      const decision = body.decision === "accept" ? "accept" : body.decision === "decline" ? "decline" : "";
      if (!participantId || !decision) return json(res, 422, { error: "invalid_decision" });

      const beforeRows = await supabase(`pilot_participants?id=eq.${encodeURIComponent(participantId)}&select=*`);
      const before = beforeRows?.[0];
      if (!before) return json(res, 404, { error: "participant_not_found" });
      const result = await supabase("rpc/pilot_admin_decide", {
        method: "POST",
        body: JSON.stringify({
          p_participant_id: participantId,
          p_action: decision,
          p_reason: decision === "accept" ? "manual_accept" : "manual_decline",
        }),
      });
      if (!result.existing) {
        const participant = {
          ...before,
          status: result.status,
          personal_deadline: result.deadline || null,
        };
        try {
          await sendStatusEmail(participant, result.delivery_token || "");
        } catch (error) {
          await updateParticipant(participantId, {
            email_delivery_failed_at: new Date().toISOString(),
            email_failure_kind: "application_status",
            updated_at: new Date().toISOString(),
          });
          throw error;
        }
      }
      return json(res, 200, { ok: true, result, dashboard: await dashboard() });
    }

    if (action === "resend") {
      const participantId = cleanText(body.participantId, 80);
      const rows = await supabase(`pilot_participants?id=eq.${encodeURIComponent(participantId)}&select=*`);
      const participant = rows?.[0];
      if (!participant) return json(res, 404, { error: "participant_not_found" });
      const token = participant.status === "accepted" ? await participantToken(participant.id) : "";
      const kind = participant.email_failure_kind || "application_status";
      if (kind === "application_status") {
        await sendStatusEmail(participant, token);
      } else {
        const message = kind === "reminder_day3"
          ? reminderEmail("day3", participant, token)
          : kind === "reminder_day7"
            ? reminderEmail("day7", participant, token)
            : kind === "feedback_no_use"
              ? noUseEmail({ firstName: participant.adult_first_name, token })
              : feedbackCompleteEmail({ firstName: participant.adult_first_name });
        const delivery = await sendEmail({ to: participant.adult_email, ...message });
        await updateParticipant(participant.id, { email_delivery_failed_at: null, email_failure_kind: null, updated_at: new Date().toISOString() });
        await recordEvent({ participantId: participant.id, sessionId: participant.landing_session_id, name: "admin_email_resent", metadata: { kind, providerId: delivery.id } });
      }
      return json(res, 200, { ok: true, dashboard: await dashboard() });
    }

    if (action === "open_second_wave") {
      if (body.confirmGate !== true) return json(res, 422, { error: "gate_confirmation_required" });
      const settingsRows = await supabase("pilot_settings?pilot_key=eq.first_numbers_v1&select=*");
      const settings = settingsRows?.[0];
      if (!settings || settings.phase !== "paused") return json(res, 409, { error: "pilot_not_paused" });
      const now = new Date().toISOString();
      await supabase("pilot_settings?pilot_key=eq.first_numbers_v1", {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ phase: "second_wave", second_wave_opened_at: now, updated_at: now }),
      });
      await recordEvent({ name: "second_wave_opened", metadata: { confirmedBy: "admin" } });
      return json(res, 200, { ok: true, dashboard: await dashboard() });
    }

    if (action === "close_cohort") {
      if (body.confirmClose !== true) return json(res, 422, { error: "close_confirmation_required" });
      const settingsRows = await supabase("pilot_settings?pilot_key=eq.first_numbers_v1&select=*");
      const settings = settingsRows?.[0];
      if (!settings || !["paused", "second_wave"].includes(settings.phase)) {
        return json(res, 409, { error: "pilot_not_open" });
      }
      const now = new Date().toISOString();
      await supabase("pilot_settings?pilot_key=eq.first_numbers_v1", {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ phase: "closed", closed_at: now, cohort_reviewed_at: now, updated_at: now }),
      });
      await recordEvent({ name: "cohort_closed", metadata: { reviewedBy: "admin" } });
      return json(res, 200, { ok: true, dashboard: await dashboard() });
    }

    return json(res, 422, { error: "unknown_action" });
  } catch (error) {
    console.error("admin_action_failed", error);
    return json(res, 500, { error: error.message || "admin_action_unavailable" });
  }
}
