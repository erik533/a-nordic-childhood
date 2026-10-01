'use client';

import { track } from '@vercel/analytics';
import Image from 'next/image';
import { useRef, useState } from 'react';

type PagePreviewProps = {
  src: string;
  alt: string;
  title: string;
  kind?: 'page' | 'cover';
  trackingName?: string;
};

const imageDimensions: Record<string, { height: number; width: number }> = {
  '/collection-covers/a-nordic-childhood.png': { width: 1103, height: 1426 },
  '/collection-covers/first-numbers.png': { width: 1024, height: 1536 },
  '/collection-covers/numbers-together.png': { width: 1024, height: 1536 },
  '/collection-covers/first-letters.png': { width: 1024, height: 1536 },
  '/collection-covers/words-together.png': { width: 1024, height: 1536 },
  '/collection-covers/extra-number-practice.png': { width: 1024, height: 1536 },
  '/collection-covers/extra-letter-practice.png': { width: 1024, height: 1536 },
  '/cover-a-nordic-childhood.png': { width: 1275, height: 1650 },
  '/cover-first-letters.png': { width: 1054, height: 1492 },
  '/cover-first-numbers.png': { width: 1054, height: 1492 },
  '/cover-numbers-together.png': { width: 1054, height: 1492 },
  '/cover-words-together.png': { width: 1054, height: 1492 },
  '/progression-letter-a-hires.png': { width: 1679, height: 2382 },
  '/progression-number-five-hires.png': { width: 1679, height: 2382 },
  '/progression-words-keepsake-hires.png': { width: 1679, height: 2382 },
  '/sisu-tree-page.png': { width: 918, height: 1188 },
  '/small-brave-things-page.png': { width: 1836, height: 2376 },
  '/first-letters/meet-a.png': { width: 1343, height: 1905 },
  '/first-letters/letters-in-my-name.png': { width: 1343, height: 1905 },
  '/first-letters/from-voice-to-page.png': { width: 1343, height: 1905 },
  '/first-letters/what-do-your-words-need-to-do.png': { width: 1343, height: 1905 },
  '/first-letters/letter-a-practice.png': { width: 1343, height: 1905 },
  '/first-letters/choose-and-practise.png': { width: 1343, height: 1905 },
};

export default function PagePreview({ src, alt, title, kind = 'page', trackingName }: PagePreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const dimensions = imageDimensions[src] || { width: 1200, height: 1600 };
  const previewSizes = kind === 'cover'
    ? '(max-width: 720px) 42vw, 260px'
    : '(max-width: 720px) 86vw, 540px';

  return (
    <>
      <button
        className={`warm-stage-trigger${kind === 'cover' ? ' warm-cover-trigger' : ''}`}
        type="button"
        aria-label={`View ${title} ${kind} at full size`}
        onClick={() => {
          dialogRef.current?.showModal();
          if (trackingName) {
            try {
              track('First Letters Page Preview Opened', { preview: trackingName });
            } catch {
              // Analytics must never interrupt the preview.
            }
          }
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          sizes={previewSizes}
          quality={85}
        />
        <span>{kind === 'cover' ? 'View cover' : 'View larger'}</span>
      </button>

      <dialog
        className="warm-page-dialog"
        ref={dialogRef}
        aria-label={`${title} ${kind} preview`}
        onClose={() => setZoomed(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className={`warm-page-dialog-shell${zoomed ? ' is-zoomed' : ''}`}>
          <div className="warm-page-dialog-controls">
            <button type="button" onClick={() => setZoomed((current) => !current)}>
              {zoomed ? 'Fit page' : 'Zoom in'}
            </button>
            <form method="dialog">
              <button type="submit">Close</button>
            </form>
          </div>
          <div className="warm-page-dialog-viewport">
            <Image
              src={src}
              alt={alt}
              width={dimensions.width}
              height={dimensions.height}
              sizes="(max-width: 720px) 94vw, 1100px"
              quality={90}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
