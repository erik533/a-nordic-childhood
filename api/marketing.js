import { addMarketingContact, marketingConfirmationEmail, sendEmail } from "../lib/email.js";
import { bearerToken, isSameOrigin, json, methodNotAllowed, parseBody } from "../lib/http.js";
import { findParticipant, recordEvent, supabase } from "../lib/supabase.js";

export function marketingOptInAllowed(participant, consent) {
  return Boolean(
    consent === true
    && participant
    && participant.status === "accepted"
    && !participant.withdrawn_at
    && participant.completion_qualified_at
    && participant.reward_status === "confirmed"
  );
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
    if (raw.consent !== true) return json(res, 422, { error: "explicit_consent_required" });
    if (!marketingOptInAllowed(participant, raw.consent)) return json(res, 403, { error: "feedback_not_complete" });

    const contact = await addMarketingContact({
      email: participant.adult_email,
      firstName: participant.adult_first_name,
    });
    const now = new Date().toISOString();
    await supabase("marketing_opt_ins?on_conflict=adult_email", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        participant_id: participant.id,
        adult_email: participant.adult_email,
        adult_first_name: participant.adult_first_name,
        consent_source: "pilot_feedback_complete",
        consented_at: now,
        resend_contact_id: contact.id || null,
        unsubscribed_at: null,
        updated_at: now,
      }),
    });
    await recordEvent({
      participantId: participant.id,
      sessionId: participant.landing_session_id,
      name: "marketing_opt_in",
    });

    try {
      await sendEmail({
        to: participant.adult_email,
        ...marketingConfirmationEmail({ firstName: participant.adult_first_name }),
      });
    } catch (error) {
      console.error("marketing_confirmation_email_failed", error);
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("marketing_opt_in_failed", error);
    return json(res, 500, { error: "marketing_opt_in_unavailable" });
  }
}
