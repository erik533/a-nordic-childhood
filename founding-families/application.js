import { api, getLandingSessionId, setStatus, track } from "./shared.js";

const form = document.querySelector("#application-form");
const status = document.querySelector("#form-status");
const submit = form.querySelector("button[type=submit]");
const sessionId = getLandingSessionId();
const formStartedAt = Date.now();
let started = false;

document.querySelector("#year").textContent = new Date().getFullYear();
track("landing_view", { metadata: Object.fromEntries(new URLSearchParams(location.search)) });

form.addEventListener("input", () => {
  if (!started) {
    started = true;
    track("application_start");
  }
}, { once: true });

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  submit.disabled = true;
  setStatus(status, "Checking the current pilot group…");
  const data = new FormData(form);
  const search = new URLSearchParams(location.search);
  const body = {
    adultFirstName: data.get("adultFirstName"),
    adultEmail: data.get("adultEmail"),
    childAgeBand: data.get("childAgeBand"),
    activityLanguage: data.get("activityLanguage"),
    countsAloud: data.get("countsAloud"),
    countsFive: data.get("countsFive"),
    matchesNumerals: data.get("matchesNumerals"),
    composesNumbers: data.get("composesNumbers"),
    printerFormat: data.get("printerFormat"),
    participationConfirmed: data.get("participationConfirmed") === "on",
    privacyConfirmed: data.get("privacyConfirmed") === "on",
    website: data.get("website"),
    formStartedAt,
    landingSessionId: sessionId,
    source: search.get("source") || document.referrer || "direct",
    utmSource: search.get("utm_source"),
    utmMedium: search.get("utm_medium"),
    utmCampaign: search.get("utm_campaign"),
  };
  try {
    const result = await api("/api/apply", { method: "POST", body });
    if (result.status === "accepted" && result.token) {
      location.assign(`/founding-families/download/#token=${encodeURIComponent(result.token)}`);
      return;
    }
    location.assign(`/founding-families/result/?status=${encodeURIComponent(result.status)}`);
  } catch (error) {
    if (error.status === 422) {
      setStatus(status, "A required answer is missing or invalid. Please check the form and try again.", "error");
    } else if (error.status === 429) {
      setStatus(status, "Please pause for a moment, then submit again.", "error");
    } else {
      setStatus(status, "The application could not be sent just now. Your answers remain on this page; please try once more.", "error");
    }
    submit.disabled = false;
  }
});
