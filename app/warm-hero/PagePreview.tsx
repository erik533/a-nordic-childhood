'use client';

import { useRef, useState } from 'react';

type PagePreviewProps = {
  src: string;
  alt: string;
  title: string;
  kind?: 'page' | 'cover';
};

export default function PagePreview({ src, alt, title, kind = 'page' }: PagePreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <button
        className={`warm-stage-trigger${kind === 'cover' ? ' warm-cover-trigger' : ''}`}
        type="button"
        aria-label={`View ${title} ${kind} at full size`}
        onClick={() => dialogRef.current?.showModal()}
      >
        <img src={src} alt={alt} />
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
            <img src={src} alt={alt} />
          </div>
        </div>
      </dialog>
    </>
  );
}
