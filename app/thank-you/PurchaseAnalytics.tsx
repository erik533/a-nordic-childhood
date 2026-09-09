'use client';

import { track } from '@vercel/analytics';
import { useEffect } from 'react';
import { trackMetaEvent } from '@/lib/meta-pixel';

export default function PurchaseAnalytics({ campaign }: { campaign: string }) {
  useEffect(() => {
    try {
      track('Purchase Verified', { campaign });
      trackMetaEvent('Purchase', {
        content_ids: ['anc-learning-collection'],
        content_name: 'A Nordic Childhood: The Learning Collection',
        content_type: 'product',
        currency: 'USD',
        value: 29,
      });
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
