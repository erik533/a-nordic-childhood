export function redactAnalyticsUrl(value: string) {
  const url = new URL(value);
  url.search = '';
  url.hash = '';
  return url.toString();
}

const CAMPAIGN_PARAMETERS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;
const CAMPAIGN_VALUE_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

type CampaignParameter = (typeof CAMPAIGN_PARAMETERS)[number];
type CampaignAttribution = Partial<Record<CampaignParameter, string>>;

function normalizeCampaignValue(value: string | null) {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return CAMPAIGN_VALUE_PATTERN.test(normalized) ? normalized : undefined;
}

export function readCampaignAttribution(search: string) {
  const searchParams = new URLSearchParams(search);
  return CAMPAIGN_PARAMETERS.reduce<CampaignAttribution>((attribution, parameter) => {
    const value = normalizeCampaignValue(searchParams.get(parameter));
    if (value) attribution[parameter] = value;
    return attribution;
  }, {});
}

export function campaignKey(search: string) {
  const attribution = readCampaignAttribution(search);
  return CAMPAIGN_PARAMETERS
    .map((parameter) => attribution[parameter] ?? 'none')
    .join('|');
}

export function safeCampaignKey(value?: string) {
  if (!value) return 'none|none|none';
  const parts = value.split('|');
  if (parts.length !== CAMPAIGN_PARAMETERS.length) return 'none|none|none';
  return parts.every((part) => part === 'none' || CAMPAIGN_VALUE_PATTERN.test(part))
    ? parts.join('|')
    : 'none|none|none';
}

export function attributedCheckoutUrl(checkoutUrl: string, search: string) {
  try {
    const url = new URL(checkoutUrl);
    const attribution = readCampaignAttribution(search);

    for (const parameter of CAMPAIGN_PARAMETERS) {
      const value = attribution[parameter];
      if (value) url.searchParams.set(parameter, value);
    }

    return url.toString();
  } catch {
    return checkoutUrl;
  }
}
