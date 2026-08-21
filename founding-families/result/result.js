const status = new URLSearchParams(location.search).get("status");
const title = document.querySelector("#result-title");
const copy = document.querySelector("#result-copy");

const content = {
  pending_review: {
    title: "Thank you for applying.",
    html: "<p>Erik will review your application and reply within one business day.</p><p>The review is about the fit of these early pages, not about whether a child is doing well.</p>",
  },
  waitlisted: {
    title: "The current group is paused.",
    html: "<p>The first family group is full or being reviewed. We have sent a confirmation and will write if another place opens.</p><p>You do not need to apply again.</p>",
  },
  not_now: {
    title: "Not this round.",
    html: "<p>This early pilot is testing one narrow learning stage, and the current pages are probably not the right fit just now.</p><p>This is not a judgment about your child.</p>",
  },
};

const selected = content[status] || content.pending_review;
title.textContent = selected.title;
copy.innerHTML = selected.html;
document.querySelector("#year").textContent = new Date().getFullYear();
