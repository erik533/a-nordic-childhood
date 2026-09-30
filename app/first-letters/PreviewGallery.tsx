'use client';

import { useRef, useState } from 'react';
import PagePreview from '../warm-hero/PagePreview';

const previews = [
  {
    group: 'First Letters',
    title: 'Meet A',
    caption: 'Hear, find, follow, trace and try.',
    src: '/first-letters/meet-a.png',
    alt: 'First Letters page titled Meet A with sound recognition and follow, trace and try letter formation',
  },
  {
    group: 'First Letters',
    title: 'Letters in my name',
    caption: 'Find the letters, put them in order, then build a name.',
    src: '/first-letters/letters-in-my-name.png',
    alt: 'First Letters page titled Letters in my name with activities for finding and ordering name letters',
  },
  {
    group: 'Words Together',
    title: 'From voice to page',
    caption: 'Say it, hear it, build it, write it and read it back.',
    src: '/first-letters/from-voice-to-page.png',
    alt: 'Words Together page titled From voice to page showing how the spoken word sun becomes writing',
  },
  {
    group: 'Words Together',
    title: 'What do your words need to do?',
    caption: 'Remember something, tell someone, show something, give or invite.',
    src: '/first-letters/what-do-your-words-need-to-do.png',
    alt: 'Words Together page inviting a child to choose a real reason to write',
  },
  {
    group: 'Extra Letter Practice',
    title: 'Letter A',
    caption: 'Finger path, trace, fading guide, copy and try.',
    src: '/first-letters/letter-a-practice.png',
    alt: 'Extra Letter Practice page for uppercase and lowercase A with fading guidance',
  },
  {
    group: 'Extra Letter Practice',
    title: 'Choose and practise',
    caption: 'Choose only the letters that need another look.',
    src: '/first-letters/choose-and-practise.png',
    alt: 'Extra Letter Practice page for choosing up to three letter pairs to practise',
  },
] as const;

export default function PreviewGallery() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const updatePosition = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.children) as HTMLElement[];
    const closest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft - scroller.scrollLeft);
      return distance < best.distance ? { distance, index } : best;
    }, { distance: Number.POSITIVE_INFINITY, index: 0 });
    setActive(closest.index);
  };

  return (
    <>
      <div className="fl-preview-guidance">
        <p className="fl-preview-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="m7 7-5 5 5 5M2 12h20m-5-5 5 5-5 5" />
          </svg>
          Swipe to explore
        </p>
        <p className="fl-preview-position" aria-live="polite" aria-atomic="true">
          <strong>{active + 1}</strong> of {previews.length}
        </p>
      </div>
      <div className="fl-preview-grid" ref={scrollerRef} onScroll={updatePosition}>
        {previews.map((preview) => (
          <article className="fl-preview-card" key={preview.title}>
            <PagePreview
              src={preview.src}
              alt={preview.alt}
              title={preview.title}
              trackingName={preview.title}
            />
            <div className="fl-preview-caption">
              <p>{preview.group}</p>
              <h3>{preview.title}</h3>
              <span>{preview.caption}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
