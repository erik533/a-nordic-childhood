'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  denyMetaConsent,
  grantMetaConsent,
  readMetaConsent,
  trackMetaPageView,
} from '@/lib/meta-pixel';
import styles from './meta-pixel-consent.module.css';

export default function MetaPixelConsent() {
  const [choice, setChoice] = useState<'granted' | 'denied' | null | undefined>(undefined);
  const [showChoices, setShowChoices] = useState(false);
  const [promptReady, setPromptReady] = useState(false);

  useEffect(() => {
    const storedChoice = readMetaConsent();
    if (storedChoice === 'granted') trackMetaPageView();
    const frame = window.requestAnimationFrame(() => setChoice(storedChoice));
    const promptDelay = window.setTimeout(() => setPromptReady(true), 1500);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(promptDelay);
    };
  }, []);

  if (choice === undefined || (!choice && !promptReady)) return null;

  const choose = (nextChoice: 'granted' | 'denied') => {
    if (nextChoice === 'granted') grantMetaConsent();
    else denyMetaConsent();
    setChoice(nextChoice);
    setShowChoices(false);
  };

  if (choice && !showChoices) {
    return (
      <button className={styles.reopen} type="button" onClick={() => setShowChoices(true)}>
        Privacy choices
      </button>
    );
  }

  return (
    <aside className={styles.banner} aria-label="Advertising measurement choices">
      <div className={styles.copy}>
        <strong>Optional ad measurement</strong>
        <p>
          Allow Meta to record visits and purchases so we can understand which ads work.
          You can change this anytime. <Link href="/privacy">Privacy</Link>
        </p>
      </div>
      <div className={styles.actions}>
        <button className={styles.decline} type="button" onClick={() => choose('denied')}>No thanks</button>
        <button className={styles.accept} type="button" onClick={() => choose('granted')}>Allow</button>
      </div>
    </aside>
  );
}
