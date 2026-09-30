'use client';

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2549276625541848';
export const META_CONSENT_KEY = 'anc_meta_consent';

type MetaConsent = 'granted' | 'denied';
type MetaEventParameters = Record<string, string | number | string[]>;
type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    __ancMetaPixelInitialized?: boolean;
    __ancMetaPageViewTracked?: boolean;
  }
}

export function readMetaConsent(): MetaConsent | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(META_CONSENT_KEY);
  return value === 'granted' || value === 'denied' ? value : null;
}

function installMetaPixel() {
  if (typeof window === 'undefined' || readMetaConsent() !== 'granted') return false;

  if (!window.fbq) {
    const fbq: Fbq = (...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue?.push(args);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }

  if (!document.querySelector('script[data-anc-meta-pixel]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.dataset.ancMetaPixel = 'true';
    document.head.appendChild(script);
  }

  if (!window.__ancMetaPixelInitialized) {
    window.fbq('init', META_PIXEL_ID);
    window.__ancMetaPixelInitialized = true;
  }

  return true;
}

export function trackMetaPageView() {
  if (!installMetaPixel() || window.__ancMetaPageViewTracked) return;
  window.fbq?.('track', 'PageView');
  window.__ancMetaPageViewTracked = true;
}

export function trackMetaEvent(eventName: 'InitiateCheckout' | 'Purchase', parameters: MetaEventParameters) {
  if (!installMetaPixel()) return;
  window.fbq?.('track', eventName, parameters);
}

export function grantMetaConsent() {
  window.localStorage.setItem(META_CONSENT_KEY, 'granted');
  trackMetaPageView();
}

function expireCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  document.cookie = `${name}=; Max-Age=0; path=/; domain=.${window.location.hostname}; SameSite=Lax`;
}

export function denyMetaConsent() {
  window.localStorage.setItem(META_CONSENT_KEY, 'denied');
  window.fbq?.('consent', 'revoke');
  expireCookie('_fbp');
  expireCookie('_fbc');
}
