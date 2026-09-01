'use client';

import { track } from '@vercel/analytics';
import { useEffect } from 'react';

export default function PurchaseAnalytics({ campaign }: { campaign: string }) {
  useEffect(() => {
    try {
      track('Purchase Verified', { campaign });
    } catch {
      // Analytics must never interrupt delivery.
    } finally {
      const url = new URL(window.location.href);
      url.searchParams.delete('purchase');
      url.searchParams.delete('campaign');
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [campaign]);

  return null;
}
