import { feedbackCompleteEmail, noUseEmail, sendEmail } from "../lib/email.js";
import { bearerToken, isSameOrigin, json, methodNotAllowed, parseBody } from "../lib/http.js";
import { cleanText } from "../lib/security.js";
import { feedbackWindowOpen } from "../lib/pilot.js";
import { findParticipant, recordEvent, supabase, updateParticipant } from "../lib/supabase.js";

const USE_OUTCOMES = new Set(["used_with_objects", "used_without_objects", "printing_blocked", "not_tried"]);
const PARTS = new Set(["meet_two", "meet_five", "meet_eight"]);
const CONTINUE = new Set(["yes", "maybe", "no"]);

function allowed(value, values) {
  const cleaned = cleanText(value, 40);
  return values.has(cleaned) ? cleaned : "";
}

function partsUsed(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, 40)).filter((item) => PARTS.has(item)).slice(0, 3);
}

export function assessFeedback(input) {
  const errors = [];
  if (!USE_OUTCOMES.has(input.useOutcome)) errors.push("useOutcome");
  if (!CONTINUE.has(input.continueChoice)) errors.push("continueChoice");
  if (!input.friction) errors.push("friction");

  const used = input.useOutcome === "used_with_objects" || input.useOutcome === "used_without_objects";
  const printingBlocked = input.useOutcome === "printing_blocked";
  if (used && input.partsUsed.length === 0) errors.push("partsUsed");
  if (used && !input.observedMoment) errors.push("observedMoment");
  if (printingBlocked && !input.printingNote) errors.push("printingNote");

  return {
    errors,
    completionConfirmed: used || printingBlocked,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return json(res, 403, { error: "origin_not_allowed" });

  try {
    const token = bearerToken(req);
    const participant = await findParticipant(token);
    if (!participant || participant.status !== "accepted" || participant.withdrawn_at) {
      return json(res, 401, { error: "invalid_link" });
    }
    if (!participant.completion_qualified_at && !feedbackWindowOpen(participant.personal_deadline)) {
      return json(res, 410, { error: "feedback_window_closed" });
    }
    const raw = parseBody(req);
    if (raw.website) return json(res, 200, { ok: true });

    const input = {
      useOutcome: allowed(raw.useOutcome, USE_OUTCOMES),
      partsUsed: partsUsed(raw.partsUsed),
      printingNote: cleanText(raw.printingNote, 1200),
      observedMoment: cleanText(raw.observedMoment, 2400),
      friction: cleanText(raw.friction, 2000),
      continueChoice: allowed(raw.continueChoice, CONTINUE),
      continueReason: cleanText(raw.continueReason, 1200),
      anythingElse: cleanText(raw.anythingElse, 2000),
    };
    const assessment = assessFeedback(input);
    if (assessment.errors.length) {
      return json(res, 422, { error: "validation_failed", fields: assessment.errors });
    }

    const feedback = {
      participant_id: participant.id,
      use_outcome: input.useOutcome,
      printing_note: input.printingNote,
      printed: input.useOutcome === "printing_blocked" ? "no" : input.useOutcome === "not_tried" ? null : "yes",
      sections_used: input.partsUsed,
      concrete_observation: input.observedMoment,
      instruction_friction: input.friction,
      continue_next_week: input.continueChoice,
      continue_reason: input.continueReason,
      anything_else: input.anythingElse,
      updated_at: new Date().toISOString(),
    };

    await supabase("pilot_feedback?on_conflict=participant_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(feedback),
    });

    const now = new Date().toISOString();
    const newlyCompleted = assessment.completionConfirmed && !participant.completion_qualified_at;
    await updateParticipant(participant.id, assessment.completionConfirmed
      ? {
          feedback_status: "usable",
          reward_status: "confirmed",
          completion_qualified_at: participant.completion_qualified_at || now,
          updated_at: now,
        }
      : {
          feedback_status: "no_use",
          reward_status: "not_eligible",
          updated_at: now,
        });
    await recordEvent({
      participantId: participant.id,
      sessionId: participant.landing_session_id,
      name: "feedback_submitted",
      metadata: { useOutcome: input.useOutcome, completionConfirmed: assessment.completionConfirmed },
    });

    try {
      const message = assessment.completionConfirmed
        ? feedbackCompleteEmail({ firstName: participant.adult_first_name })
        : noUseEmail({ firstName: participant.adult_first_name, token });
      if (newlyCompleted || !assessment.completionConfirmed) {
        await sendEmail({ to: participant.adult_email, ...message });
        if (participant.email_delivery_failed_at) {
          await updateParticipant(participant.id, { email_delivery_failed_at: null, email_failure_kind: null, updated_at: new Date().toISOString() });
        }
      }
    } catch (error) {
      await updateParticipant(participant.id, {
        email_delivery_failed_at: new Date().toISOString(),
        email_failure_kind: assessment.completionConfirmed ? "feedback_complete" : "feedback_no_use",
        updated_at: new Date().toISOString(),
      });
      await recordEvent({
        participantId: participant.id,
        sessionId: participant.landing_session_id,
        name: "feedback_email_failed",
        metadata: { message: error.message },
      });
    }

    return json(res, 200, {
      ok: true,
      completionConfirmed: assessment.completionConfirmed,
      marketingInvite: assessment.completionConfirmed,
    });
  } catch (error) {
    console.error("feedback_failed", error);
    return json(res, 500, { error: "feedback_unavailable" });
  }
}
