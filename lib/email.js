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
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export async function sendEmail({ to, subject, html, text }) {
  const cfg = emailConfig();
  if (cfg.disabled) return { id: "email-disabled", skipped: true };
  if (!cfg.apiKey || !cfg.from) throw new Error("Resend is not configured.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: cfg.from, to: [to], subject, html, text }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || `Resend request failed (${response.status}).`);
  return payload;
}

function layout({ preheader, title, body, buttonLabel, buttonUrl }) {
  const cfg = emailConfig();
  const button = buttonUrl
    ? `<p style="margin:28px 0"><a href="${buttonUrl}" style="display:inline-block;background:#6f765e;color:#f7f2e8;text-decoration:none;padding:14px 22px;border-radius:8px;font-family:Arial,sans-serif;font-size:14px">${buttonLabel}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f7f2e8;color:#4a321c"><div style="display:none;max-height:0;overflow:hidden">${preheader}</div><div style="max-width:620px;margin:0 auto;padding:40px 24px;font-family:Arial,sans-serif;line-height:1.6"><div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#97742f">Founding Families · First Numbers</div><h1 style="font-family:Georgia,serif;font-weight:400;font-size:34px;line-height:1.15;margin:14px 0 22px">${title}</h1>${body}${button}<p style="margin-top:34px;padding-top:20px;border-top:1px solid #d9cdb6;color:#6b4f35;font-size:13px">Questions or printing trouble? Reply to this message or write to <a href="mailto:${cfg.support}" style="color:#545b47">${cfg.support}</a>.</p></div></body></html>`;
}

export function participantLinks(token) {
  const { baseUrl } = emailConfig();
  return {
    download: `${baseUrl}/founding-families/download/#token=${encodeURIComponent(token)}`,
    feedback: `${baseUrl}/founding-families/feedback/#token=${encodeURIComponent(token)}`,
  };
}

export function acceptedEmail({ firstName, deadline, token }) {
  const links = participantLinks(token);
  const readableDeadline = formatDeadline(deadline);
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>Your family has a place in the First Numbers pilot. Please send your feedback by <strong>${escapeHtml(readableDeadline)}</strong>.</p><p>You only need a printer, a pencil or crayon, and eight small safe objects. Aim for two short sittings—but please report what actually happens, even if printing is awkward, your child stops, or you use only part of the pack.</p>`;
  return {
    subject: "Your First Numbers pilot is ready",
    html: layout({ preheader: "Your printable pilot and private feedback link", title: "Your quiet number journey is ready", body, buttonLabel: "Open your pilot", buttonUrl: links.download }),
    text: `Hello ${firstName},\n\nYour family has a place in the First Numbers pilot. Please send your feedback by ${readableDeadline}.\n\nOpen your pilot: ${links.download}\nPrivate feedback: ${links.feedback}\n\nPlease report what happens even if printing is awkward, your child stops, or you use only part of the pack.`,
  };
}

export function waitlistEmail({ firstName }) {
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>Your family appears to fit this narrow pilot, but the current group is full. We have kept only the information needed to contact you if another round opens.</p><p>There is no promised date, and you can ask us to delete your details at any time.</p>`;
  return { subject: "First Numbers pilot — current group full", html: layout({ preheader: "The current group is full", title: "A good fit, but not this round", body }), text: `Hello ${firstName},\n\nYour family appears to fit, but the current First Numbers group is full. There is no promised date. You may ask us to delete your details at any time.` };
}

export function notNowEmail({ firstName }) {
  const body = `<p>Hello ${escapeHtml(firstName)},</p><p>Thank you for applying. This early pilot tests one deliberately narrow learning stage, and the answers suggest it may not be the right fit for your family just now.</p><p>This is not a judgment of the child—only a boundary around what this particular draft can teach us.</p>`;
  return { subject: "First Numbers pilot — thank you", html: layout({ preheader: "Thank you for applying", title: "A narrow pilot, not a judgment", body }), text: `Hello ${firstName},\n\nThank you for applying. This early pilot tests one narrow learning stage, and it may not be the right fit for your family just now. This is not a judgment of the child.` };
}

export function reminderEmail(kind, participant, token) {
  const links = participantLinks(token);
  const firstName = escapeHtml(participant.adult_first_name);
  const messages = {
    print: {
      subject: "A quick First Numbers printing check",
      title: "Is printing getting in the way?",
      body: `<p>Hello ${firstName},</p><p>It looks as though the pilot download may not have been opened yet. Choose US Letter for US printers or A4 for most other countries, then print at <strong>100% / Actual Size</strong>—not “Fit to page.”</p><p>If printing is blocking you, that is useful pilot evidence. You can open the feedback form now rather than disappearing politely.</p>`,
      buttonLabel: "Open the pilot",
      buttonUrl: links.download,
    },
    session: {
      subject: "One quiet First Numbers sitting is enough to begin",
      title: "Begin small. Stop kindly.",
      body: `<p>Hello ${firstName},</p><p>Meet Two and Meet Five can form the first sitting. Read the short directions aloud, observe rather than correct, and stop if interest runs out.</p><p>Partial or unsuccessful use is worth reporting.</p>`,
      buttonLabel: "Open your pilot",
      buttonUrl: links.download,
    },
    feedback: {
      subject: "What happened matters more than a score",
      title: "Your observation is the useful part",
      body: `<p>Hello ${firstName},</p><p>Your pilot date has arrived. The feedback form takes about 8–10 minutes. Unfinished pages, confusion, and printing friction all count; please do not tidy the experience for us.</p>`,
      buttonLabel: "Share what happened",
      buttonUrl: links.feedback,
    },
  };
  const message = messages[kind];
  return {
    subject: message.subject,
    html: layout({ preheader: message.subject, title: message.title, body: message.body, buttonLabel: message.buttonLabel, buttonUrl: message.buttonUrl }),
    text: `${message.subject}\n\n${message.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n\n${message.buttonUrl}`,
  };
}
