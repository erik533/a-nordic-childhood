import { hashToken } from "./security.js";

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

export async function supabase(path, options = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.hint || `Supabase request failed (${response.status}).`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function findParticipant(token) {
  if (!token || token.length < 32) return null;
  const tokenHash = hashToken(token);
  const rows = await supabase(
    `pilot_participants?token_hash=eq.${encodeURIComponent(tokenHash)}&select=*`
  );
  return rows?.[0] || null;
}

export async function recordEvent({ participantId = null, sessionId = null, name, metadata = {} }) {
  return supabase("pilot_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      participant_id: participantId,
      landing_session_id: sessionId,
      event_name: name,
      metadata,
    }),
  });
}

export async function updateParticipant(id, patch) {
  return supabase(`pilot_participants?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
}
