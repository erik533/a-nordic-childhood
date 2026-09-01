'use client';

import { Analytics as VercelAnalytics, type BeforeSendEvent } from '@vercel/analytics/next';
import { redactAnalyticsUrl } from '@/lib/analytics';

function redactEventUrl(event: BeforeSendEvent): BeforeSendEvent {
  return {
    ...event,
    url: redactAnalyticsUrl(event.url),
  };
}

export function Analytics() {
  return <VercelAnalytics beforeSend={redactEventUrl} />;
}
