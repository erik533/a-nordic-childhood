import { bearerToken, isSameOrigin, json, methodNotAllowed, parseBody } from "../lib/http.js";
import { cleanText } from "../lib/security.js";
import { findParticipant, recordEvent, updateParticipant } from "../lib/supabase.js";

const FILES = {
  a4: "/founding-families/files/first-numbers-a4-birch-82f4.pdf",
  us_letter: "/founding-families/files/first-numbers-us-letter-pine-51c7.pdf",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return json(res, 403, { error: "origin_not_allowed" });
  try {
    const participant = await findParticipant(bearerToken(req));
    if (!participant || participant.status !== "accepted" || participant.withdrawn_at) {
      return json(res, 401, { error: "invalid_link" });
    }
    const edition = cleanText(parseBody(req).edition, 20);
    if (!FILES[edition]) return json(res, 422, { error: "edition_not_available" });

    const now = new Date().toISOString();
    await updateParticipant(participant.id, {
      downloaded_at: participant.downloaded_at || now,
      downloaded_edition: edition,
      updated_at: now,
    });
    await recordEvent({ participantId: participant.id, sessionId: participant.landing_session_id, name: "pack_downloaded", metadata: { edition } });
    return json(res, 200, { url: FILES[edition] });
  } catch (error) {
    console.error("download_failed", error);
    return json(res, 500, { error: "download_unavailable" });
  }
}
