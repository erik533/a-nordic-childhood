import { bearerToken, json, methodNotAllowed } from "../lib/http.js";
import { feedbackWindowOpen } from "../lib/pilot.js";
import { findParticipant, supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const participant = await findParticipant(bearerToken(req));
    if (!participant || participant.status !== "accepted" || participant.withdrawn_at) {
      return json(res, 401, { error: "invalid_link" });
    }
    const marketingRows = participant.completion_qualified_at
      ? await supabase(`marketing_opt_ins?participant_id=eq.${participant.id}&unsubscribed_at=is.null&select=id`)
      : [];
    return json(res, 200, {
      firstName: participant.adult_first_name,
      deadline: participant.personal_deadline,
      downloadedAt: participant.downloaded_at,
      feedbackStatus: participant.feedback_status,
      rewardStatus: participant.reward_status,
      completionConfirmed: Boolean(participant.completion_qualified_at),
      marketingOptedIn: Boolean(marketingRows?.length),
      feedbackWindowOpen: feedbackWindowOpen(participant.personal_deadline),
    });
  } catch (error) {
    console.error("participant_failed", error);
    return json(res, 500, { error: "participant_unavailable" });
  }
}
