export function getLandingSessionId() {
  const key = "anc_founding_session";
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
}

export function getToken() {
  const params = new URLSearchParams(location.hash.slice(1));
  return params.get("token") || "";
}

export async function api(path, { method = "GET", body, token } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "request_failed");
    error.payload = payload;
    error.status = response.status;
    throw error;
  }
  return payload;
}

export function track(name, { token, metadata = {} } = {}) {
  const body = { name, landingSessionId: getLandingSessionId(), metadata };
  return api("/api/events", { method: "POST", body, token }).catch(() => null);
}

export function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export function setStatus(element, text, type = "") {
  element.textContent = text;
  element.className = `form-status ${type}`.trim();
}
