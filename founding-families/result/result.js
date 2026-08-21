import { track } from "../shared.js";

const status = new URLSearchParams(location.search).get("status");
const title = document.querySelector("#result-title");
const copy = document.querySelector("#result-copy");

const content = {
  waitlisted: {
    title: "You are on the small waitlist.",
    html: "<p>Your family looks like a possible fit, but the current group is full. We have sent a confirmation and will write if a place opens.</p><p>You do not need to apply again.</p>",
  },
  not_now: {
    title: "This round is not the right fit.",
    html: "<p>Thank you for answering honestly. This first round is deliberately narrow, so a no for now is not a judgment about your child.</p><p>We have sent a short confirmation. There is nothing else you need to do.</p>",
  },
};

const selected = content[status] || {
  title: "Your answer is safely received.",
  html: "<p>Please check your email for the next step. If you were accepted, use the private link in that message to return to your download.</p>",
};

title.textContent = selected.title;
copy.innerHTML = selected.html;
document.querySelector("#year").textContent = new Date().getFullYear();
track("application_result_view", { metadata: { status: status || "unknown" } });
