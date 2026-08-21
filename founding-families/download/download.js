import { api, formatDate, getToken, setStatus, track } from "../shared.js";

const token = getToken();
const loading = document.querySelector("#loading");
const invalid = document.querySelector("#invalid");
const card = document.querySelector("#download-card");
const status = document.querySelector("#download-status");

document.querySelector("#year").textContent = new Date().getFullYear();

function showInvalid() {
  loading.classList.add("hidden");
  card.classList.add("hidden");
  invalid.classList.remove("hidden");
}

if (!token) {
  showInvalid();
} else {
  try {
    const participant = await api("/api/participant", { token });
    document.querySelector("#first-name").textContent = participant.firstName;
    document.querySelector("#deadline").textContent = formatDate(participant.deadline);
    document.querySelector("#feedback-link").href = `/founding-families/feedback/#token=${encodeURIComponent(token)}`;
    loading.classList.add("hidden");
    card.classList.remove("hidden");
    if (participant.downloadedAt) setStatus(status, "Your pilot has already been downloaded. You can download it again if needed.");
    track("download_view", { token });
  } catch {
    showInvalid();
  }
}

document.querySelectorAll("[data-edition]").forEach((button) => {
  button.addEventListener("click", async () => {
    button.disabled = true;
    setStatus(status, "Preparing your PDF…");
    try {
      const result = await api("/api/download", { method: "POST", token, body: { edition: button.dataset.edition } });
      setStatus(status, "Your download is ready.");
      location.assign(result.url);
    } catch {
      setStatus(status, "The PDF could not be opened just now. Please try again or email erik@erikastrand.com.", "error");
    } finally {
      button.disabled = false;
    }
  });
});
