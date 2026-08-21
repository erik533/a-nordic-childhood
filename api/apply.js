import { assessEligibility, validateApplication } from "../lib/eligibility.js";
import { acceptedEmail, notNowEmail, sendEmail, waitlistEmail } from "../lib/email.js";
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
      activityLanguage: cleanText(raw.activityLanguage, 80),
      countsAloud: cleanText(raw.countsAloud, 30),
      countsFive: cleanText(raw.countsFive, 30),
      matchesNumerals: cleanText(raw.matchesNumerals, 30),
      composesNumbers: cleanText(raw.composesNumbers, 30),
      printerFormat: cleanText(raw.printerFormat, 30),
      participationConfirmed: raw.participationConfirmed === true,
      privacyConfirmed: raw.privacyConfirmed === true,
    };
    const errors = validateApplication(input);
    if (Object.keys(errors).length) return json(res, 422, { error: "validation_failed", fields: errors });

    const startedAt = Number(raw.formStartedAt || 0);
    if (startedAt && Date.now() - startedAt < 2500) return json(res, 429, { error: "please_try_again" });

    const assessment = assessEligibility(input);
    const token = createParticipantToken();
    const cohortCap = Math.max(1, Math.min(100, Number(process.env.PILOT_COHORT_CAP || 20)));
    const params = {
      p_token_hash: hashToken(token),
      p_delivery_token: token,
      p_landing_session_id: cleanText(raw.landingSessionId, 80),
      p_adult_first_name: input.adultFirstName,
      p_adult_email: input.adultEmail,
      p_child_age_band: input.childAgeBand,
      p_activity_language: input.activityLanguage,
      p_counts_aloud: input.countsAloud,
      p_counts_five: input.countsFive,
      p_matches_numerals: input.matchesNumerals,
      p_composes_numbers: input.composesNumbers,
      p_printer_format: input.printerFormat,
      p_qualification_reason: assessment.reason,
      p_qualified: assessment.qualified,
      p_source: cleanText(raw.source, 120),
      p_utm_source: cleanText(raw.utmSource, 120),
      p_utm_medium: cleanText(raw.utmMedium, 120),
      p_utm_campaign: cleanText(raw.utmCampaign, 120),
      p_cohort_cap: cohortCap,
    };
    const result = await supabase("rpc/pilot_apply", {
      method: "POST",
      body: JSON.stringify(params),
    });

    const participant = {
      id: result.id,
      adult_first_name: input.adultFirstName,
      adult_email: input.adultEmail,
      status: result.status,
      personal_deadline: result.deadline,
    };
    const deliveryToken = result.delivery_token || token;
    const message = result.status === "accepted"
      ? acceptedEmail({ firstName: input.adultFirstName, deadline: result.deadline, token: deliveryToken })
      : result.status === "waitlisted"
        ? waitlistEmail({ firstName: input.adultFirstName })
        : notNowEmail({ firstName: input.adultFirstName });

    try {
      const delivery = await sendEmail({ to: input.adultEmail, ...message });
      await recordEvent({ participantId: result.id, sessionId: params.p_landing_session_id, name: "delivery_email_sent", metadata: { providerId: delivery.id } });
    } catch (error) {
      await updateParticipant(result.id, { email_delivery_failed_at: new Date().toISOString() });
      await recordEvent({ participantId: result.id, sessionId: params.p_landing_session_id, name: "delivery_email_failed", metadata: { message: error.message } });
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
