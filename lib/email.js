function emailConfig() {
  const configuredBaseUrl = (process.env.PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const previewHost = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  const baseUrl = process.env.VERCEL_ENV === "preview" && previewHost
    ? `https://${previewHost.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
    : configuredBaseUrl;
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM,
    baseUrl,
    support: process.env.PILOT_SUPPORT_EMAIL || "erik@erikastrand.com",
    adminPath: process.env.PILOT_ADMIN_PATH || "/founding-families/review/",
    segmentId: process.env.RESEND_FIRST_NUMBERS_SEGMENT_ID,
    topicId: process.env.RESEND_FIRST_NUMBERS_TOPIC_ID,
    disabled: process.env.EMAIL_MODE === "disabled",
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDeadline(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

async function resendRequest(path, options = {}) {
  const cfg = emailConfig();
  if (cfg.disabled) return { id: "email-disabled", skipped: true };
  if (!cfg.apiKey) throw new Error("Resend is not configured.");
  const response = await fetch(`https://api.resend.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Resend request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function sendEmail({ to, subject, html, text }) {
  const cfg = emailConfig();
  if (!cfg.from && !cfg.disabled) throw new Error("Resend sender is not configured.");
  return resendRequest("/emails", {
    method: "POST",
    body: JSON.stringify({ from: cfg.from, to: [to], subject, html, text }),
  });
}

export async function addMarketingContact({ email, firstName }) {
  const cfg = emailConfig();
  if (!cfg.segmentId || !cfg.topicId) throw new Error("Resend marketing list is not configured.");
  try {
    return await resendRequest("/contacts", {
      method: "POST",
      body: JSON.stringify({
        email,
        first_name: firstName,
        unsubscribed: false,
        segments: [{ id: cfg.segmentId }],
        topics: [{ id: cfg.topicId, subscription: "opt_in" }],
      }),
    });
  } catch (error) {
    if (error.status !== 409) throw error;
    await resendRequest(`/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(cfg.segmentId)}`, { method: "POST" });
    await resendRequest(`/contacts/${encodeURIComponent(email)}/topics`, {
      method: "PATCH",
      body: JSON.stringify([{ id: cfg.topicId, subscription: "opt_in" }]),
    });
    return { id: email, existing: true };
  }
}

function layout({ preheader, title, body, buttonLabel, buttonUrl, showCover = false }) {
  const cfg = emailConfig();
  const button = buttonUrl
    ? `<p style="margin:28px 0"><a href="${buttonUrl}" style="display:inline-block;background:#6f765e;color:#f7f2e8;text-decoration:none;padding:14px 22px;border-radius:8px;font-family:Arial,sans-serif;font-size:14px">${buttonLabel}</a></p>`
    : "";
  const cover = showCover
    ? `<p style="margin:24px 0"><img src="${cfg.baseUrl}/founding-families/assets/first-numbers-restrained.png" width="180" alt="First Numbers pilot cover" style="display:block;max-width:180px;height:auto;border-radius:4px"></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f7f2e8;color:#4a321c"><div style="display:none;max-height:0;overflow:hidden">${preheader}</div><div style="max-width:620px;margin:0 auto;padding:40px 24px;font-family:Arial,sans-serif;line-height:1.6"><div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#97742f">A Nordic Childhood · First Numbers</div><h1 style="font-family:Georgia,serif;font-weight:400;font-size:34px;line-height:1.15;margin:14px 0 22px">${title}</h1>${cover}${body}${button}<p style="margin-top:34px;padding-top:20px;border-top:1px solid #d9cdb6;color:#6b4f35;font-size:13px">Questions or printing trouble? Reply to this message or write to <a href="mailto:${cfg.support}" style="color:#545b47">${cfg.support}</a>.</p></div></body></html>`;
}

export function participantLinks(token) {
  const { baseUrl } = emailConfig();
  return {
    download: `${baseUrl}/founding-families/download/#token=${encodeURIComponent(token)}`,
    feedback: `${baseUrl}/founding-families/feedback/#token=${encodeURIComponent(token)}`,
  };
}

export function pendingReviewEmail({ firstName }) {
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>Your application is safely received. Erik will review it and reply within one business day.</p><p>This pilot looks for one narrow learning stage. The review is about the fit of the current pages, not about whether a child is doing well.</p>`;
  return {
    subject: "Your First Numbers application is received",
    html: layout({ preheader: "Erik will reply within one business day", title: "Thank you for applying", body }),
    text: `Hello ${firstName},\n\nYour First Numbers pilot application is safely received. Erik will review it and reply within one business day. The review is about the fit of the current pages, not about whether a child is doing well.`,
  };
}

export function acceptedEmail({ firstName, deadline, token }) {
  const links = participantLinks(token);
  const readableDeadline = formatDeadline(deadline);
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>Your family has a place in the First Numbers pilot. Please try at least one short activity and send your feedback by <strong>${escapeHtml(readableDeadline)}</strong>.</p><p>You need a printer, a pencil or crayon, and up to eight small safe objects. Stop if interest runs out. Printing trouble and an early stop are both worth reporting.</p>`;
  return {
    subject: "Your First Numbers pilot is ready",
    html: layout({ preheader: "Your printable pilot and personal feedback link", title: "Your First Numbers pilot is ready", body, buttonLabel: "Open your pilot", buttonUrl: links.download, showCover: true }),
    text: `Hello ${firstName},\n\nYour family has a place in the First Numbers pilot. Please try at least one short activity and send feedback by ${readableDeadline}.\n\nOpen your pilot: ${links.download}\nFeedback form: ${links.feedback}\n\nPrinting trouble and an early stop are both worth reporting.`,
  };
}

export function waitlistEmail({ firstName }) {
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>The current group is full or paused while Erik reviews the first family reports. We will write if another place opens.</p><p>There is no promised date. You can ask us to delete your details at any time.</p>`;
  return {
    subject: "The current First Numbers group is paused",
    html: layout({ preheader: "The current group is paused or full", title: "Thank you for your interest", body }),
    text: `Hello ${firstName},\n\nThe current First Numbers group is full or paused while Erik reviews the first family reports. We will write if another place opens. There is no promised date, and you can ask us to delete your details at any time.`,
  };
}

export function notNowEmail({ firstName }) {
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>Thank you for applying. This early pilot is testing one narrow learning stage, and the current pages are probably not the right fit for your family just now.</p><p>This is only a boundary around the draft we need to test. It is not a judgment about your child.</p>`;
  return {
    subject: "Thank you for your First Numbers application",
    html: layout({ preheader: "This narrow pilot is not the right fit just now", title: "Not this round", body }),
    text: `Hello ${firstName},\n\nThank you for applying. This early pilot is testing one narrow learning stage, and the current pages are probably not the right fit for your family just now. This is not a judgment about your child.`,
  };
}

export function adminApplicationEmail({ participant }) {
  const cfg = emailConfig();
  const adminUrl = `${cfg.baseUrl}${cfg.adminPath}`;
  const body = `<p>A new application is waiting for review.</p><p><strong>Adult:</strong> ${escapeHtml(participant.adult_first_name)}<br><strong>Age band:</strong> ${escapeHtml(participant.child_age_band)}<br><strong>Learning stage:</strong> ${escapeHtml(participant.learning_stage)}<br><strong>Source:</strong> ${escapeHtml(participant.source || "direct")}</p>`;
  return {
    subject: "First Numbers application waiting for review",
    html: layout({ preheader: "A pilot application needs a decision", title: "Application waiting", body, buttonLabel: "Open the private review page", buttonUrl: adminUrl }),
    text: `A new First Numbers application is waiting for review.\n\nAdult: ${participant.adult_first_name}\nAge band: ${participant.child_age_band}\nLearning stage: ${participant.learning_stage}\nSource: ${participant.source || "direct"}\n\nReview: ${adminUrl}`,
  };
}

export function reminderEmail(kind, participant, token) {
  const links = participantLinks(token);
  const firstName = escapeHtml(participant.adult_first_name);
  if (kind === "day3") {
    const downloaded = Boolean(participant.downloaded_at);
    const body = downloaded
      ? `<p>Hello ${firstName},</p><p>One short First Numbers activity is enough for this pilot. Stop when interest runs out, then tell us what happened.</p><p>You do not need to finish the pack or produce a perfect session.</p>`
      : `<p>Hello ${firstName},</p><p>Your First Numbers pack has not been downloaded yet. Choose US Letter for US printers or A4 for most other countries, then print at 100% or Actual Size.</p><p>If printing blocks you, please report that. A genuine printing failure counts as a completed pilot attempt.</p>`;
    return {
      subject: downloaded ? "One short First Numbers activity is enough" : "Can we help with your First Numbers download?",
      html: layout({ preheader: "A gentle First Numbers reminder", title: downloaded ? "Stop when interest runs out" : "Is printing getting in the way?", body, buttonLabel: downloaded ? "Open the feedback form" : "Open your pilot", buttonUrl: downloaded ? links.feedback : links.download }),
      text: `${downloaded ? "One short First Numbers activity is enough. Stop when interest runs out, then tell us what happened." : "Your First Numbers pack has not been downloaded yet. If printing blocks you, please report that."}\n\n${downloaded ? links.feedback : links.download}`,
    };
  }

  const readableDeadline = formatDeadline(participant.personal_deadline);
  const body = `<p>Hello ${firstName},</p><p>Today is the feedback date for your First Numbers pilot: <strong>${escapeHtml(readableDeadline)}</strong>.</p><p>Five short prompts ask what you used, one thing you noticed, and where the pages or directions got in the way. The link stays open for three more days if family life has shifted the timing.</p>`;
  return {
    subject: "Your First Numbers feedback date is here",
    html: layout({ preheader: "Five short feedback prompts", title: "What happened is enough", body, buttonLabel: "Share what happened", buttonUrl: links.feedback }),
    text: `Hello ${participant.adult_first_name},\n\nToday is the feedback date for your First Numbers pilot: ${readableDeadline}. The link stays open for three more days if you need them.\n\nShare what happened: ${links.feedback}`,
  };
}

export function feedbackCompleteEmail({ firstName }) {
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>Your feedback is safely received, and your free copy of the finished digital First Numbers book is confirmed.</p><p>There is no fixed release date yet. The family reports from this pilot will determine what needs to change before the book is complete.</p>`;
  return {
    subject: "Your First Numbers feedback is received",
    html: layout({ preheader: "Your finished-book thank-you is confirmed", title: "Thank you for the honest report", body }),
    text: `Hello ${firstName},\n\nYour feedback is safely received, and your free copy of the finished digital First Numbers book is confirmed. There is no fixed release date yet because the pilot findings may change the book.`,
  };
}

export function noUseEmail({ firstName, token }) {
  const links = participantLinks(token);
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>Your response is saved. The finished-book thank-you is confirmed after one real activity attempt or a genuine printing failure.</p><p>Your personal page remains available during the grace period if you are able to return.</p>`;
  return {
    subject: "Your First Numbers response is saved",
    html: layout({ preheader: "You can return during the grace period", title: "Your response is saved", body, buttonLabel: "Return to your pilot", buttonUrl: links.download }),
    text: `Hello ${firstName},\n\nYour response is saved. The finished-book thank-you is confirmed after one real activity attempt or a genuine printing failure. You can return during the grace period: ${links.download}`,
  };
}

export function marketingConfirmationEmail({ firstName }) {
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>You are now subscribed to occasional First Numbers and A Nordic Childhood updates.</p><p>This choice is separate from the pilot and does not affect your finished-book thank-you. Every marketing message will include an unsubscribe link.</p>`;
  return {
    subject: "First Numbers updates confirmed",
    html: layout({ preheader: "Your separate update subscription is confirmed", title: "You are on the updates list", body }),
    text: `Hello ${firstName},\n\nYou are now subscribed to occasional First Numbers and A Nordic Childhood updates. This is separate from the pilot, and every marketing message will include an unsubscribe link.`,
  };
}
