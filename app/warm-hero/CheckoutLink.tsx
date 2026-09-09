'use client';

import { track } from '@vercel/analytics';
import type { MouseEventHandler, ReactNode } from 'react';
import { attributedCheckoutUrl, campaignKey } from '@/lib/analytics';
import { trackMetaEvent } from '@/lib/meta-pixel';

type CheckoutPlacement = 'hero' | 'midpoint' | 'offer' | 'closing';

type CheckoutLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
  placement: CheckoutPlacement;
};

export default function CheckoutLink({ children, className, href, placement }: CheckoutLinkProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    const search = window.location.search;
    event.currentTarget.href = attributedCheckoutUrl(href, search);

    try {
      track('Checkout Click', {
        placement,
        campaign: campaignKey(search),
      });
      trackMetaEvent('InitiateCheckout', {
        content_ids: ['anc-learning-collection'],
        content_name: 'A Nordic Childhood: The Learning Collection',
        content_type: 'product',
        currency: 'USD',
        value: 29,
      });
    } catch {
      // Analytics must never interrupt checkout.
    }
  };

  return (
    <a className={className} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
