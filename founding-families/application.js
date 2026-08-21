import { api, getLandingSessionId, setStatus, track } from "./shared.js";

const form = document.querySelector("#application-form");
const status = document.querySelector("#form-status");
const submit = form.querySelector("button[type=submit]");
const sessionId = getLandingSessionId();
const formStartedAt = Date.now();
let started = false;

document.querySelector("#year").textContent = new Date().getFullYear();

const search = new URLSearchParams(location.search);
const attribution = {
  utm_source: search.get("utm_source") || "",
  utm_medium: search.get("utm_medium") || "",
  utm_campaign: search.get("utm_campaign") || "",
};

track("landing_view", { metadata: attribution });

form.addEventListener("input", () => {
  if (!started) {
    started = true;
    track("application_started");
  }
}, { once: true });

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  submit.disabled = true;
  setStatus(status, "Sending your application...");
  const data = new FormData(form);
  const body = {
    adultFirstName: data.get("adultFirstName"),
    adultEmail: data.get("adultEmail"),
    childAgeBand: data.get("childAgeBand"),
    learningStage: data.get("learningStage"),
    participationConfirmed: data.get("participationConfirmed") === "on",
    privacyConfirmed: data.get("privacyConfirmed") === "on",
    website: data.get("website"),
    formStartedAt,
    landingSessionId: sessionId,
    referrer: document.referrer,
    utmSource: attribution.utm_source,
    utmMedium: attribution.utm_medium,
    utmCampaign: attribution.utm_campaign,
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
      setStatus(status, "Please check the required answers and try again.", "error");
    } else if (error.status === 429) {
      setStatus(status, "Please pause for a moment, then submit again.", "error");
    } else {
      setStatus(status, "The application could not be sent. Your answers are still here, so please try once more.", "error");
    }
    submit.disabled = false;
  }
});
