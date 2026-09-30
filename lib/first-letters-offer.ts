// Dedicated to the $10 set's future GHL V2 Funnel. Never fall back to
// NEXT_PUBLIC_CHECKOUT_URL, which belongs to the separate $29 collection.
export function resolveFirstLettersCheckoutUrl(value?: string) {
  try {
    const url = new URL(value?.trim() || '');
    if (url.protocol !== 'https:' || url.username || url.password) return '#purchase';
    return url.toString();
  } catch {
    return '#purchase';
  }
}

export const FIRST_LETTERS_CHECKOUT_URL = resolveFirstLettersCheckoutUrl(
  process.env.NEXT_PUBLIC_FIRST_LETTERS_CHECKOUT_URL,
);
