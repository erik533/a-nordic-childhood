import { cleanText } from "./security.js";

export function cleanUtm(value) {
  return cleanText(value, 100).replace(/[^a-zA-Z0-9._~+ -]/g, "");
}

export function referrerCategory(value, siteUrl = "") {
  if (!value) return "direct";
  try {
    const referrer = new URL(value);
    const site = siteUrl ? new URL(siteUrl) : null;
    if (site && referrer.hostname === site.hostname) return "internal";
    return referrer.hostname.toLowerCase().slice(0, 120) || "direct";
  } catch {
    return "direct";
  }
}

export function attributionFromInput(raw, siteUrl = "") {
  const utmSource = cleanUtm(raw.utmSource);
  const utmMedium = cleanUtm(raw.utmMedium);
  const utmCampaign = cleanUtm(raw.utmCampaign);
  return {
    source: utmSource || referrerCategory(raw.referrer, siteUrl),
    utmSource,
    utmMedium,
    utmCampaign,
  };
}
