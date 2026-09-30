'use client';

import { useEffect, useState } from 'react';
import FirstLettersPurchaseLink from './FirstLettersPurchaseLink';

export default function MobilePurchaseBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const heroCta = document.querySelector('[data-primary-cta="hero"]');
    const purchase = document.querySelector('#purchase');
    if (!heroCta || !purchase) return;

    const update = () => {
      const heroRect = heroCta.getBoundingClientRect();
      const purchaseRect = purchase.getBoundingClientRect();
      const purchaseVisible = purchaseRect.top < window.innerHeight * .9
        && purchaseRect.bottom > window.innerHeight * .1;
      setShow(heroRect.bottom < 0 && !purchaseVisible);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className={`fl-sticky-purchase${show ? ' is-visible' : ''}`} aria-hidden={!show}>
      <span><strong>3 printable PDFs</strong><small>$10</small></span>
      <FirstLettersPurchaseLink placement="sticky">Get them</FirstLettersPurchaseLink>
    </div>
  );
}
