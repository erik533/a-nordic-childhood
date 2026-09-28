'use client';

import { track } from '@vercel/analytics';
import { useEffect, useRef, type MouseEventHandler, type ReactNode } from 'react';
import { campaignKey } from '@/lib/analytics';
import { attributedFirstLettersCheckoutUrl } from '@/lib/checkout-attribution';
import { FIRST_LETTERS_CHECKOUT_URL } from '@/lib/first-letters-offer';
import { readMetaConsent, trackMetaEvent } from '@/lib/meta-pixel';

function currentDestination() {
  let includeAdClickIds = false;
  try {
    includeAdClickIds = readMetaConsent() === 'granted'
      && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  } catch {
    // Blocked browser storage means no permission to forward ad click IDs.
  }
  return attributedFirstLettersCheckoutUrl(FIRST_LETTERS_CHECKOUT_URL, window.location.search, {
    includeAdClickIds,
  });
}

export type FirstLettersPurchasePlacement =
  | 'header'
  | 'hero'
  | 'sticky'
  | 'midpoint'
  | 'offer'
  | 'closing';

type FirstLettersPurchaseLinkProps = {
  children: ReactNode;
  className?: string;
  placement: FirstLettersPurchasePlacement;
  'data-primary-cta'?: string;
};

export default function FirstLettersPurchaseLink({
  children,
  className,
  placement,
  'data-primary-cta': primaryCta,
}: FirstLettersPurchaseLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const refreshDestination = () => {
    const destination = currentDestination();
    if (linkRef.current) linkRef.current.href = destination;
    return destination;
  };

  useEffect(() => {
    // An actual attributed href also supports copying/opening in a new tab.
    const refresh = () => {
      if (linkRef.current) linkRef.current.href = currentDestination();
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, []);

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const search = window.location.search;
    const destination = refreshDestination();

    try {
      track('First Letters Purchase CTA Click', {
        placement,
        campaign: campaignKey(search),
        checkout_ready: destination.startsWith('http'),
      });

      if (destination.startsWith('http')) {
        trackMetaEvent('InitiateCheckout', {
          content_ids: ['anc-first-letters-set'],
          content_name: 'A Nordic Childhood: First Letters 3-Book Set',
          content_type: 'product',
          currency: 'USD',
          value: 10,
        });
      }
    } catch {
      // Analytics must never interrupt checkout.
    }
  };

  return (
    <a
      ref={linkRef}
      className={className}
      data-primary-cta={primaryCta}
      href={FIRST_LETTERS_CHECKOUT_URL}
      onClick={handleClick}
      onAuxClick={handleClick}
      onFocus={refreshDestination}
      onPointerDown={refreshDestination}
      onContextMenu={refreshDestination}
    >
      {children}
    </a>
  );
}
