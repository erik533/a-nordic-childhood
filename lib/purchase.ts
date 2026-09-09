import { createHmac, timingSafeEqual } from 'node:crypto';

const PRODUCT_NAME = 'A Nordic Childhood: The Learning Collection';
const EXPECTED_AMOUNT = 2900;
const EXPECTED_CURRENCY = 'usd';
const CLAIM_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

type StripeLineItem = {
  amount_total?: number;
  price?: { product?: { name?: string } | string };
};

type StripeCheckoutSession = {
  id?: string;
  payment_status?: string;
  amount_total?: number;
  currency?: string;
  line_items?: { data?: StripeLineItem[] };
  payment_intent?: string | {
    latest_charge?: string | {
      receipt_number?: string | null;
    };
  };
};

type StripeCheckoutSessionList = {
  data?: StripeCheckoutSession[];
};

function signingSecret() {
  const value = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!value) throw new Error('DOWNLOAD_SIGNING_SECRET is not configured');
  return value;
}

function signature(payload: string) {
  return createHmac('sha256', signingSecret()).update(payload).digest('base64url');
}

export async function verifyPaidCheckoutSession(sessionId: string) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured');

  const url = new URL(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
  url.searchParams.append('expand[]', 'line_items.data.price.product');

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: 'no-store',
  });

  if (!response.ok) return false;

  const session = await response.json() as StripeCheckoutSession;
  return isExpectedPaidSession(session, sessionId);
}

function isExpectedPaidSession(session: StripeCheckoutSession, sessionId?: string) {
  const hasExpectedProduct = session.line_items?.data?.some((item) => {
    const product = item.price?.product;
    return typeof product === 'object' && product?.name === PRODUCT_NAME && item.amount_total === EXPECTED_AMOUNT;
  });

  return (!sessionId || session.id === sessionId)
    && session.payment_status === 'paid'
    && session.amount_total === EXPECTED_AMOUNT
    && session.currency === EXPECTED_CURRENCY
    && hasExpectedProduct === true;
}

export async function findPaidCheckoutSessionByReceipt(email: string, receiptNumber: string) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured');

  const url = new URL('https://api.stripe.com/v1/checkout/sessions');
  url.searchParams.set('customer_details[email]', email.trim().toLowerCase());
  url.searchParams.set('status', 'complete');
  url.searchParams.set('limit', '10');
  url.searchParams.append('expand[]', 'data.line_items.data.price.product');

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: 'no-store',
  });
  if (!response.ok) return undefined;

  const sessions = await response.json() as StripeCheckoutSessionList;
  const expectedReceipt = receiptNumber.trim().toUpperCase();

  for (const session of sessions.data || []) {
    if (!session.id || !isExpectedPaidSession(session)) continue;
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : undefined;
    if (!paymentIntentId) continue;

    const paymentUrl = new URL(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`);
    paymentUrl.searchParams.append('expand[]', 'latest_charge');
    const paymentResponse = await fetch(paymentUrl, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: 'no-store',
    });
    if (!paymentResponse.ok) continue;

    const payment = await paymentResponse.json() as StripeCheckoutSession['payment_intent'];
    const charge = typeof payment === 'object' ? payment.latest_charge : undefined;
    const actualReceipt = typeof charge === 'object' ? charge.receipt_number?.toUpperCase() : undefined;
    if (actualReceipt && actualReceipt === expectedReceipt) return session.id;
  }

  return undefined;
}

export function createDownloadClaim(sessionId: string) {
  const expires = Math.floor(Date.now() / 1000) + CLAIM_LIFETIME_SECONDS;
  const payload = `${sessionId}.${expires}`;
  return `${payload}.${signature(payload)}`;
}

export function getDownloadClaimSessionId(value?: string) {
  if (!value) return undefined;
  const [sessionId, expiresValue, suppliedSignature] = value.split('.');
  const expires = Number(expiresValue);
  if (!sessionId || !Number.isFinite(expires) || !suppliedSignature || expires < Date.now() / 1000) return undefined;

  const payload = `${sessionId}.${expires}`;
  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(suppliedSignature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied)
    ? sessionId
    : undefined;
}

export function verifyDownloadClaim(value?: string) {
  return getDownloadClaimSessionId(value) !== undefined;
}
