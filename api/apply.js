import { attributionFromInput } from "../lib/attribution.js";
import { validateApplication } from "../lib/eligibility.js";
import {
  acceptedEmail,
  adminApplicationEmail,
  notNowEmail,
  pendingReviewEmail,
  sendEmail,
  waitlistEmail,
} from "../lib/email.js";
import { isSameOrigin, json, methodNotAllowed, parseBody } from "../lib/http.js";
import { cleanEmail, cleanText, createParticipantToken, hashToken } from "../lib/security.js";
import { recordEvent, supabase, updateParticipant } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return json(res, 403, { error: "origin_not_allowed" });

  try {
    const raw = parseBody(req);
    if (raw.website) return json(res, 200, { status: "not_now" });

    const input = {
      adultFirstName: cleanText(raw.adultFirstName, 80),
      adultEmail: cleanEmail(raw.adultEmail),
      childAgeBand: cleanText(raw.childAgeBand, 30),
      learningStage: cleanText(raw.learningStage, 30),
      participationConfirmed: raw.participationConfirmed === true,
      privacyConfirmed: raw.privacyConfirmed === true,
    };
    const errors = validateApplication(input);
    if (Object.keys(errors).length) return json(res, 422, { error: "validation_failed", fields: errors });

    const startedAt = Number(raw.formStartedAt || 0);
    if (startedAt && Date.now() - startedAt < 2500) return json(res, 429, { error: "please_try_again" });

    const attribution = attributionFromInput(raw, process.env.PUBLIC_SITE_URL);
    const token = createParticipantToken();
    const params = {
      p_token_hash: hashToken(token),
      p_delivery_token: token,
      p_landing_session_id: cleanText(raw.landingSessionId, 80),
      p_adult_first_name: input.adultFirstName,
      p_adult_email: input.adultEmail,
      p_child_age_band: input.childAgeBand,
      p_learning_stage: input.learningStage,
      p_source: attribution.source,
      p_utm_source: attribution.utmSource,
      p_utm_medium: attribution.utmMedium,
      p_utm_campaign: attribution.utmCampaign,
    };
    const result = await supabase("rpc/pilot_apply_v2", {
      method: "POST",
      body: JSON.stringify(params),
    });

    const participant = {
      id: result.id,
      adult_first_name: input.adultFirstName,
      adult_email: input.adultEmail,
      child_age_band: input.childAgeBand,
      learning_stage: input.learningStage,
      source: attribution.source,
      status: result.status,
      personal_deadline: result.deadline,
    };
    const deliveryToken = result.delivery_token || token;
    const message = participant.status === "accepted"
      ? acceptedEmail({ firstName: input.adultFirstName, deadline: result.deadline, token: deliveryToken })
      : participant.status === "pending_review"
        ? pendingReviewEmail({ firstName: input.adultFirstName })
        : participant.status === "waitlisted"
          ? waitlistEmail({ firstName: input.adultFirstName })
          : notNowEmail({ firstName: input.adultFirstName });

    try {
      const delivery = await sendEmail({ to: input.adultEmail, ...message });
      await recordEvent({
        participantId: result.id,
        sessionId: params.p_landing_session_id,
        name: "application_email_sent",
        metadata: { providerId: delivery.id, status: participant.status },
      });
    } catch (error) {
      await updateParticipant(result.id, {
        email_delivery_failed_at: new Date().toISOString(),
        email_failure_kind: "application_status",
        updated_at: new Date().toISOString(),
      });
      await recordEvent({
        participantId: result.id,
        sessionId: params.p_landing_session_id,
        name: "application_email_failed",
        metadata: { message: error.message, status: participant.status },
      });
    }

    if (participant.status === "pending_review" && !result.existing) {
      try {
        await sendEmail({
          to: process.env.PILOT_SUPPORT_EMAIL || "erik@erikastrand.com",
          ...adminApplicationEmail({ participant }),
        });
      } catch (error) {
        console.error("admin_application_email_failed", error);
      }
    }

    return json(res, 200, {
      status: participant.status,
      deadline: participant.personal_deadline,
      token: participant.status === "accepted" ? deliveryToken : undefined,
    });
  } catch (error) {
    console.error("apply_failed", error);
    return json(res, 500, { error: "application_unavailable" });
  }
}
