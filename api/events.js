import { bearerToken, isSameOrigin, json, methodNotAllowed, parseBody } from "../lib/http.js";
import { cleanText, safeMetadata } from "../lib/security.js";
import { findParticipant, recordEvent } from "../lib/supabase.js";

const ANONYMOUS_EVENTS = new Set(["landing_view", "application_start"]);
const PARTICIPANT_EVENTS = new Set(["download_view", "feedback_start"]);

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return json(res, 403, { error: "origin_not_allowed" });
  try {
    const body = parseBody(req);
    const name = cleanText(body.name, 50);
    const sessionId = cleanText(body.landingSessionId, 80);
    if (ANONYMOUS_EVENTS.has(name)) {
      await recordEvent({ sessionId, name, metadata: safeMetadata(body.metadata) });
      return json(res, 202, { ok: true });
    }
    if (PARTICIPANT_EVENTS.has(name)) {
      const participant = await findParticipant(bearerToken(req));
      if (!participant) return json(res, 401, { error: "invalid_link" });
      await recordEvent({ participantId: participant.id, sessionId: participant.landing_session_id, name, metadata: safeMetadata(body.metadata) });
      return json(res, 202, { ok: true });
    }
    return json(res, 422, { error: "event_not_allowed" });
  } catch (error) {
    console.error("event_failed", error);
    return json(res, 500, { error: "event_unavailable" });
  }
}
