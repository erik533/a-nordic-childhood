'use client';

import { track } from '@vercel/analytics';
import { useEffect } from 'react';
import { campaignKey } from '@/lib/analytics';

export default function FirstLettersPageTracker() {
  useEffect(() => {
    track('First Letters Offer Viewed', {
      campaign: campaignKey(window.location.search),
    });
  }, []);

  return null;
}

