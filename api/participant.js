import { bearerToken, json, methodNotAllowed } from "../lib/http.js";
import { findParticipant } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const participant = await findParticipant(bearerToken(req));
    if (!participant || participant.status !== "accepted" || participant.withdrawn_at) {
      return json(res, 401, { error: "invalid_link" });
    }
    return json(res, 200, {
      firstName: participant.adult_first_name,
      deadline: participant.personal_deadline,
      printerFormat: participant.printer_format,
      downloadedAt: participant.downloaded_at,
      feedbackStatus: participant.feedback_status,
    });
  } catch (error) {
    console.error("participant_failed", error);
    return json(res, 500, { error: "participant_unavailable" });
  }
}
