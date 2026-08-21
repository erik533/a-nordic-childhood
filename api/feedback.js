import { bearerToken, isSameOrigin, json, methodNotAllowed, parseBody } from "../lib/http.js";
import { cleanText } from "../lib/security.js";
import { findParticipant, recordEvent, supabase, updateParticipant } from "../lib/supabase.js";

const VALUES = {
  printed: new Set(["yes", "partly", "no"]),
  sittings: new Set(["0", "1", "2", "3_plus"]),
  usedObjects: new Set(["yes", "partly", "no"]),
  numeralCues: new Set(["too_faint", "about_right", "too_dominant", "not_used"]),
  knewNext: new Set(["yes", "mostly", "no"]),
  continueNextWeek: new Set(["yes", "maybe", "no"]),
};

function allowed(value, set) {
  const cleaned = cleanText(value, 40);
  return set.has(cleaned) ? cleaned : "";
}

function textArray(value, allowedValues) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, 60)).filter((item) => allowedValues.has(item)).slice(0, 20);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return json(res, 403, { error: "origin_not_allowed" });
  try {
    const participant = await findParticipant(bearerToken(req));
    if (!participant || participant.status !== "accepted" || participant.withdrawn_at) {
      return json(res, 401, { error: "invalid_link" });
    }
    const raw = parseBody(req);
    if (raw.website) return json(res, 200, { ok: true });

    const feedback = {
      participant_id: participant.id,
      printed: allowed(raw.printed, VALUES.printed),
      print_friction: cleanText(raw.printFriction, 1200),
      sittings: allowed(raw.sittings, VALUES.sittings),
      sections_used: textArray(raw.sectionsUsed, new Set(["meet_two", "meet_five", "meet_eight"])),
      page_codes: cleanText(raw.pageCodes, 500),
      used_objects: allowed(raw.usedObjects, VALUES.usedObjects),
      instruction_friction: cleanText(raw.instructionFriction, 2000),
      concrete_observation: cleanText(raw.concreteObservation, 2400),
      behaviours: textArray(raw.behaviours, new Set(["stopped", "rushed", "repeated", "returned", "asked_help", "new_grouping", "other"])),
      easiest_section: cleanText(raw.easiestSection, 80),
      hardest_section: cleanText(raw.hardestSection, 80),
      difficulty_reason: cleanText(raw.difficultyReason, 1600),
      numeral_cues: allowed(raw.numeralCues, VALUES.numeralCues),
      knew_next: allowed(raw.knewNext, VALUES.knewNext),
      knew_next_note: cleanText(raw.knewNextNote, 1200),
      continue_next_week: allowed(raw.continueNextWeek, VALUES.continueNextWeek),
      continue_reason: cleanText(raw.continueReason, 1200),
      anything_else: cleanText(raw.anythingElse, 2000),
      follow_up_consent: raw.followUpConsent === true,
      updated_at: new Date().toISOString(),
    };
    const missing = ["printed", "sittings", "used_objects", "concrete_observation", "continue_next_week"].filter((key) => !feedback[key]);
    if (missing.length) return json(res, 422, { error: "validation_failed", fields: missing });

    await supabase("pilot_feedback?on_conflict=participant_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(feedback),
    });
    const now = new Date().toISOString();
    await updateParticipant(participant.id, { feedback_status: "submitted", reward_status: "review_pending", updated_at: now });
    await recordEvent({ participantId: participant.id, sessionId: participant.landing_session_id, name: "feedback_submit", metadata: { sittings: feedback.sittings, printed: feedback.printed } });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("feedback_failed", error);
    return json(res, 500, { error: "feedback_unavailable" });
  }
}
