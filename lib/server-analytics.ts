import { track } from '@vercel/analytics/server';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;
type AnalyticsSender = typeof track;

export function privacySafeAnalyticsHeaders(headers: Headers) {
  return {
    cookie: '',
    referer: headers.get('referer') ?? '',
    'user-agent': headers.get('user-agent') ?? '',
    'x-forwarded-for': headers.get('x-forwarded-for') ?? '',
  };
}

export async function trackServerEventSafely(
  name: string,
  properties: AnalyticsProperties | undefined,
  headers: Headers,
  sender: AnalyticsSender = track,
) {
  try {
    await sender(name, properties, { headers: privacySafeAnalyticsHeaders(headers) });
    return true;
  } catch {
    return false;
  }
}
