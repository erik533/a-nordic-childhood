// Keep checkout forwarding separate from normalized analytics campaign keys.
// These are campaign labels, never contact details or arbitrary query fields.
const CAMPAIGN_PARAMETERS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
] as const;
const CAMPAIGN_VALUE = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,127}$/;
const CLICK_ID_VALUE = /^[A-Za-z0-9._-]{1,250}$/;

export function attributedFirstLettersCheckoutUrl(
  checkoutUrl: string,
  search: string,
  options: { includeAdClickIds?: boolean } = {},
) {
  try {
    const url = new URL(checkoutUrl);
    if (url.protocol !== 'https:' || url.username || url.password) return '#purchase';
    const incoming = new URLSearchParams(search);

    for (const parameter of CAMPAIGN_PARAMETERS) {
      const value = incoming.get(parameter);
      // Preserve supported values exactly, including case and internal spaces.
      if (value && CAMPAIGN_VALUE.test(value)) url.searchParams.set(parameter, value);
    }

    // fbclid is the only ad click identifier supported by the current page.
    // Remove it from the configured URL as well when consent is absent.
    url.searchParams.delete('fbclid');
    const fbclid = incoming.get('fbclid');
    if (options.includeAdClickIds && fbclid && CLICK_ID_VALUE.test(fbclid)) {
      url.searchParams.set('fbclid', fbclid);
    }
    return url.toString();
  } catch {
    return '#purchase';
  }
}
