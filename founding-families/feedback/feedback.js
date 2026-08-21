import { api, getToken, setStatus, track } from "../shared.js";

const token = getToken();
const loading = document.querySelector("#loading");
const invalid = document.querySelector("#invalid");
const card = document.querySelector("#form-card");
const complete = document.querySelector("#complete");
const form = document.querySelector("#feedback-form");
const status = document.querySelector("#form-status");
const submit = form.querySelector("button[type=submit]");

document.querySelector("#year").textContent = new Date().getFullYear();

function show(element) {
  [loading, invalid, card, complete].forEach((item) => item.classList.add("hidden"));
  element.classList.remove("hidden");
}

if (!token) {
  show(invalid);
} else {
  try {
    const participant = await api("/api/participant", { token });
    if (participant.feedbackStatus === "submitted") show(complete);
    else {
      show(card);
      track("feedback_start", { token });
    }
  } catch {
    show(invalid);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  submit.disabled = true;
  setStatus(status, "Sending your observations…");
  const data = new FormData(form);
  const body = Object.fromEntries(data.entries());
  body.sectionsUsed = data.getAll("sectionsUsed");
  body.behaviours = data.getAll("behaviours");
  body.followUpConsent = data.get("followUpConsent") === "on";
  try {
    await api("/api/feedback", { method: "POST", token, body });
    show(complete);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    setStatus(status, error.status === 422 ? "Please complete the required answers, then try again." : "Your feedback could not be sent just now. Your answers remain here; please try again.", "error");
    submit.disabled = false;
  }
});
