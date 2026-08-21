import { api, getToken, setStatus, track } from "../shared.js";

const token = getToken();
const loading = document.querySelector("#loading");
const invalid = document.querySelector("#invalid");
const expired = document.querySelector("#expired");
const card = document.querySelector("#form-card");
const complete = document.querySelector("#complete");
const form = document.querySelector("#feedback-form");
const status = document.querySelector("#form-status");
const submit = form.querySelector("button[type=submit]");
const partsField = document.querySelector("#parts-field");
const observationField = document.querySelector("#observation-field");
const printingNoteField = document.querySelector("#printing-note-field");
const printingNote = document.querySelector("#printing-note");
const observedMoment = document.querySelector("#observed-moment");
const marketingInvite = document.querySelector("#marketing-invite");
const marketingButton = document.querySelector("#marketing-opt-in");
const marketingStatus = document.querySelector("#marketing-status");

document.querySelector("#year").textContent = new Date().getFullYear();
document.querySelector("#return-download").href = `/founding-families/download/#token=${encodeURIComponent(token)}`;

function show(element) {
  [loading, invalid, expired, card, complete].forEach((item) => item.classList.add("hidden"));
  element.classList.remove("hidden");
}

function showCompleted({ marketingOptedIn = false } = {}) {
  document.querySelector("#complete-title").textContent = "Thank you for the honest report.";
  document.querySelector("#complete-copy").innerHTML = "<p>Your free copy of the finished digital First Numbers book is confirmed. There is no fixed release date yet because the pilot findings may change the book.</p>";
  marketingInvite.classList.toggle("hidden", marketingOptedIn);
  if (marketingOptedIn) setStatus(marketingStatus, "You are already on the updates list.");
  show(complete);
}

function showNoUse() {
  document.querySelector("#complete-title").textContent = "Your response is saved.";
  document.querySelector("#complete-copy").innerHTML = "<p>The finished-book thank-you is confirmed after one real activity attempt or a genuine printing failure. Your link remains open during the grace period if you can return.</p>";
  marketingInvite.classList.add("hidden");
  show(complete);
}

function updateConditionalFields() {
  const outcome = form.elements.useOutcome.value;
  const used = outcome === "used_with_objects" || outcome === "used_without_objects";
  const printingBlocked = outcome === "printing_blocked";
  partsField.classList.toggle("hidden", !used);
  observationField.classList.toggle("hidden", !used);
  printingNoteField.classList.toggle("hidden", !printingBlocked);
  observedMoment.required = used;
  printingNote.required = printingBlocked;
}

form.addEventListener("change", (event) => {
  if (event.target.name === "useOutcome") updateConditionalFields();
});

if (!token) {
  show(invalid);
} else {
  try {
    const participant = await api("/api/participant", { token });
    if (participant.completionConfirmed) {
      showCompleted({ marketingOptedIn: participant.marketingOptedIn });
    } else if (!participant.feedbackWindowOpen) {
      show(expired);
    } else {
      show(card);
      track("feedback_started", { token });
    }
  } catch {
    show(invalid);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const outcome = form.elements.useOutcome.value;
  const used = outcome === "used_with_objects" || outcome === "used_without_objects";
  const parts = new FormData(form).getAll("partsUsed");
  if (used && parts.length === 0) {
    setStatus(status, "Please choose the part or parts you tried.", "error");
    partsField.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  submit.disabled = true;
  setStatus(status, "Sending your observations...");
  const data = new FormData(form);
  const body = Object.fromEntries(data.entries());
  body.partsUsed = data.getAll("partsUsed");
  try {
    const result = await api("/api/feedback", { method: "POST", token, body });
    if (result.completionConfirmed) showCompleted();
    else showNoUse();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    if (error.status === 410) {
      show(expired);
      return;
    }
    setStatus(status, error.status === 422 ? "Please complete the required answers, then try again." : "Your feedback could not be sent. Your answers are still here, so please try again.", "error");
    submit.disabled = false;
  }
});

marketingButton.addEventListener("click", async () => {
  marketingButton.disabled = true;
  setStatus(marketingStatus, "Adding you to the separate updates list...");
  try {
    await api("/api/marketing", { method: "POST", token, body: { consent: true } });
    setStatus(marketingStatus, "You are on the First Numbers updates list.");
    marketingButton.classList.add("hidden");
  } catch {
    setStatus(marketingStatus, "The signup could not be completed. Please try again.", "error");
    marketingButton.disabled = false;
  }
});
