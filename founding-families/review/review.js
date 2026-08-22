import { setStatus } from "../shared.js";

const login = document.querySelector("#admin-login");
const dashboard = document.querySelector("#admin-dashboard");
const loginForm = document.querySelector("#admin-login-form");
const loginStatus = document.querySelector("#login-status");
const adminStatus = document.querySelector("#admin-status");
const summary = document.querySelector("#admin-summary");
const trafficPeriods = document.querySelector("#traffic-periods");
const trafficSources = document.querySelector("#traffic-sources");
const pendingList = document.querySelector("#pending-list");
const participantList = document.querySelector("#participant-list");
const feedbackList = document.querySelector("#feedback-list");
const waveGate = document.querySelector("#wave-gate");
const gateConfirmation = document.querySelector("#gate-confirmation");
const closeGate = document.querySelector("#close-gate");
const closeConfirmation = document.querySelector("#close-confirmation");
let secret = "";
let latest = null;

function element(tag, text, className = "") {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

async function adminApi({ method = "GET", body } = {}) {
  const response = await fetch("/api/admin", {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "request_failed");
  return payload;
}

function stat(label, value) {
  const card = element("div", undefined, "admin-stat");
  card.append(element("strong", String(value)), element("span", label));
  return card;
}

function trafficCard(label, values) {
  const card = element("article", undefined, "traffic-card");
  card.append(element("h3", label));
  const metrics = element("dl", undefined, "traffic-metrics");
  [["Visits", values.visits], ["Started", values.started], ["Applied", values.submitted], ["Conversion", `${values.conversion}%`]].forEach(([name, value]) => {
    const item = element("div");
    item.append(element("dt", name), element("dd", String(value)));
    metrics.append(item);
  });
  card.append(metrics);
  return card;
}

function renderTraffic() {
  const traffic = latest.traffic || { periods: {}, sources: [] };
  const empty = { visits: 0, started: 0, submitted: 0, conversion: 0 };
  trafficPeriods.replaceChildren(
    trafficCard("Today", traffic.periods.today || empty),
    trafficCard("Last 7 days", traffic.periods.sevenDays || empty),
    trafficCard("All time", traffic.periods.total || empty),
  );

  trafficSources.replaceChildren();
  if (!traffic.sources.length) {
    const row = document.createElement("tr");
    const cell = element("td", "No visits recorded yet.");
    cell.colSpan = 5;
    row.append(cell);
    trafficSources.append(row);
    return;
  }

  traffic.sources.forEach((source) => {
    const row = document.createElement("tr");
    row.append(
      element("td", source.source),
      element("td", String(source.visits)),
      element("td", String(source.started)),
      element("td", String(source.submitted)),
      element("td", `${source.conversion}%`),
    );
    trafficSources.append(row);
  });
}

function labelFor(value) {
  return String(value || "none").replaceAll("_", " ");
}

function actionButton(label, participantId, action, secondary = false) {
  const button = element("button", label, secondary ? "button secondary small" : "button small");
  button.type = "button";
  button.addEventListener("click", async () => {
    if (action === "decline" && !window.confirm("Decline this application and send the not-this-round email?")) return;
    button.disabled = true;
    setStatus(adminStatus, "Saving the decision...");
    try {
      const result = await adminApi({ method: "POST", body: { action: "decide", participantId, decision: action } });
      latest = result.dashboard;
      render();
      setStatus(adminStatus, "Decision saved and email handled.");
    } catch (error) {
      setStatus(adminStatus, `The decision was not completed: ${error.message}`, "error");
    } finally {
      button.disabled = false;
    }
  });
  return button;
}

function renderPending() {
  pendingList.replaceChildren();
  if (!latest.pending.length) {
    pendingList.append(element("p", "No applications are waiting."));
    return;
  }
  latest.pending.forEach((participant) => {
    const card = element("article", undefined, "admin-item");
    card.append(
      element("h3", participant.adult_first_name),
      element("p", `${participant.adult_email} · age ${labelFor(participant.child_age_band)} · ${labelFor(participant.learning_stage)}`),
      element("p", `Source: ${participant.source || "direct"}`, "note"),
    );
    const actions = element("div", undefined, "admin-actions");
    actions.append(
      actionButton("Accept", participant.id, "accept"),
      actionButton("Decline", participant.id, "decline", true),
    );
    card.append(actions);
    pendingList.append(card);
  });
}

function renderParticipants() {
  participantList.replaceChildren();
  latest.participants.forEach((participant) => {
    const row = document.createElement("tr");
    row.append(
      element("td", `${participant.adult_first_name}\n${participant.adult_email}`),
      element("td", labelFor(participant.status)),
      element("td", participant.downloaded_at ? labelFor(participant.downloaded_edition) : "not yet"),
      element("td", labelFor(participant.feedback_status)),
      element("td", participant.email_delivery_failed_at ? "failed" : "ok"),
    );
    const action = document.createElement("td");
    if (participant.email_delivery_failed_at) {
      const button = element("button", "Resend", "button secondary small");
      button.type = "button";
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          const result = await adminApi({ method: "POST", body: { action: "resend", participantId: participant.id } });
          latest = result.dashboard;
          render();
          setStatus(adminStatus, "Email resent.");
        } catch (error) {
          setStatus(adminStatus, `Email could not be resent: ${error.message}`, "error");
        } finally {
          button.disabled = false;
        }
      });
      action.append(button);
    }
    row.append(action);
    participantList.append(row);
  });
}

function renderFeedback() {
  feedbackList.replaceChildren();
  if (!latest.feedback.length) {
    feedbackList.append(element("p", "No feedback has arrived yet."));
    return;
  }
  const names = new Map(latest.participants.map((participant) => [participant.id, participant.adult_first_name]));
  latest.feedback.forEach((feedback) => {
    const card = element("article", undefined, "admin-item");
    card.append(
      element("h3", names.get(feedback.participant_id) || "Participant"),
      element("p", `Outcome: ${labelFor(feedback.use_outcome)} · Parts: ${(feedback.sections_used || []).map(labelFor).join(", ") || "none"}`),
      element("p", feedback.concrete_observation || feedback.printing_note || "No observation supplied."),
      element("p", `Friction: ${feedback.instruction_friction || "none"}`, "note"),
      element("p", `Continue: ${labelFor(feedback.continue_next_week)} ${feedback.continue_reason || ""}`, "note"),
    );
    feedbackList.append(card);
  });
}

function render() {
  const counts = latest.counts;
  summary.replaceChildren(
    stat("Phase", labelFor(latest.settings?.phase)),
    stat("Accepted", counts.accepted),
    stat("Downloaded", counts.downloaded),
    stat("Completed", counts.completed),
    stat("Waiting", counts.pending_review),
    stat("Email failures", counts.emailFailures),
  );
  waveGate.classList.toggle("hidden", latest.settings?.phase !== "paused");
  closeGate.classList.toggle("hidden", !["paused", "second_wave"].includes(latest.settings?.phase));
  renderTraffic();
  renderPending();
  renderParticipants();
  renderFeedback();
}

async function refresh() {
  setStatus(adminStatus, "Refreshing...");
  try {
    latest = await adminApi();
    render();
    setStatus(adminStatus, "Review is current.");
  } catch (error) {
    setStatus(adminStatus, `Review could not be refreshed: ${error.message}`, "error");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  secret = document.querySelector("#admin-secret").value;
  setStatus(loginStatus, "Checking...");
  try {
    latest = await adminApi();
    login.classList.add("hidden");
    dashboard.classList.remove("hidden");
    render();
  } catch {
    secret = "";
    setStatus(loginStatus, "That passphrase did not open the review.", "error");
  }
});

document.querySelector("#refresh-admin").addEventListener("click", refresh);
document.querySelector("#open-second-wave").addEventListener("click", async () => {
  const gateChecks = [...gateConfirmation.querySelectorAll("input[type=checkbox]")];
  if (!gateChecks.every((checkbox) => checkbox.checked)) {
    setStatus(adminStatus, "Confirm every evidence gate before opening the second wave.", "error");
    return;
  }
  if (!window.confirm("Open the remaining fifteen pilot places?")) return;
  try {
    const result = await adminApi({ method: "POST", body: { action: "open_second_wave", confirmGate: true } });
    latest = result.dashboard;
    render();
    setStatus(adminStatus, "The second wave is open.");
  } catch (error) {
    setStatus(adminStatus, `The second wave was not opened: ${error.message}`, "error");
  }
});

document.querySelector("#close-cohort").addEventListener("click", async () => {
  if (!closeConfirmation.checked) {
    setStatus(adminStatus, "Confirm that the cohort review is finished before closing the pilot.", "error");
    return;
  }
  if (!window.confirm("Close this pilot and start the retention clock?")) return;
  try {
    const result = await adminApi({ method: "POST", body: { action: "close_cohort", confirmClose: true } });
    latest = result.dashboard;
    render();
    setStatus(adminStatus, "The cohort is closed and the retention clock has started.");
  } catch (error) {
    setStatus(adminStatus, `The cohort was not closed: ${error.message}`, "error");
  }
});
