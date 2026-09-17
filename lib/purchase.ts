import { createHmac, timingSafeEqual } from 'node:crypto';

const PRODUCT_NAME = 'A Nordic Childhood: The Learning Collection';
const EXPECTED_AMOUNT = 2900;
const EXPECTED_CURRENCY = 'usd';
const CLAIM_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

class StripeLookupError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function stripeFetch(url: URL, secretKey: string, deadline = Date.now() + 15_000) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error('Stripe lookup time limit reached');
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}` }, cache: 'no-store',
      signal: AbortSignal.timeout(Math.min(5_000, remaining)),
    });
    if (attempt === 1 || (response.status !== 429 && response.status < 500)) return response;
    const wait = Number(response.headers.get('retry-after') || '0.25') * 1000;
    if (!Number.isFinite(wait) || wait < 0 || wait > 1000 || Date.now() + wait >= deadline) return response;
    await response.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, wait));
  }
  throw new Error('Stripe lookup retry limit reached');
}

type StripeLineItem = {
  amount_subtotal?: number;
  amount_total?: number;
  price?: { product?: { name?: string } | string };
};

type StripeCheckoutSession = {
  id?: string;
  payment_status?: string;
  amount_total?: number;
  currency?: string;
  amount_subtotal?: number;
  total_details?: { amount_tax?: number; amount_discount?: number; amount_shipping?: number };
  customer_details?: { email?: string | null };
  line_items?: { data?: StripeLineItem[] };
  payment_intent?: string | {
    latest_charge?: string | {
      receipt_number?: string | null;
    };
  };
};

type StripeCheckoutSessionList = {
  data?: StripeCheckoutSession[];
  has_more?: boolean;
};

function signingSecret() {
  const value = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!value) throw new Error('DOWNLOAD_SIGNING_SECRET is not configured');
  return value;
}

function signature(payload: string) {
  return createHmac('sha256', signingSecret()).update(payload).digest('base64url');
}

async function stripeFailure(response: Response, operation: string) {
  const body = await response.json().catch(() => ({})) as { error?: { code?: string; param?: string; type?: string } };
  // Error identifiers help diagnose provider failures without logging customer data or credentials.
  const key = process.env.STRIPE_SECRET_KEY || '';
  const keyFormat = /^(sk|rk)_live_[a-zA-Z0-9]+$/.test(key.trim()) ? 'live' : 'invalid';
  return new StripeLookupError(`Stripe ${operation} failed (${response.status}; ${body.error?.type || 'unknown'}; ${body.error?.code || 'unknown'}; ${body.error?.param || 'none'}; key format: ${keyFormat})`, response.status);
}

export async function verifyPaidCheckoutSession(sessionId: string) {
  const session = await retrieveCheckoutSession(sessionId);
  return isExpectedPaidSession(session, sessionId);
}

async function retrieveCheckoutSession(sessionId: string, deadline?: number) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new Error('Invalid checkout session ID');
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured');

  const url = new URL(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
  url.searchParams.append('expand[]', 'line_items.data.price.product');

  const response = await stripeFetch(url, secretKey, deadline);

  if (!response.ok) throw await stripeFailure(response, 'checkout lookup');

  const session = await response.json() as StripeCheckoutSession;
  return session;
}

function isExpectedPaidSession(session: StripeCheckoutSession, sessionId?: string) {
  const hasExpectedProduct = session.line_items?.data?.some((item) => {
    const product = item.price?.product;
    return typeof product === 'object' && product?.name === PRODUCT_NAME && item.amount_subtotal === EXPECTED_AMOUNT;
  });

  const tax = session.total_details?.amount_tax ?? 0;
  // This offer uses exclusive tax, with no discounts or shipping charges.
  const hasExpectedAmount = session.amount_subtotal === EXPECTED_AMOUNT
    && Number.isSafeInteger(tax) && tax >= 0
    && (session.total_details?.amount_discount ?? 0) === 0
    && (session.total_details?.amount_shipping ?? 0) === 0
    && session.amount_total === EXPECTED_AMOUNT + tax;

  return (!sessionId || session.id === sessionId)
    && session.payment_status === 'paid'
    && hasExpectedAmount
    && session.currency === EXPECTED_CURRENCY
    && hasExpectedProduct === true;
}

export async function findPaidCheckoutSessionByReceipt(email: string, receiptNumber: string) {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured');

  const url = new URL('https://api.stripe.com/v1/checkout/sessions');
  url.searchParams.set('customer_details[email]', email.trim().toLowerCase());
  url.searchParams.set('status', 'complete');
  url.searchParams.set('limit', '20');
  const expectedEmail = email.trim().toLowerCase();
  const expectedReceipt = receiptNumber.trim().toUpperCase();

  const deadline = Date.now() + 45_000;
  let candidatesChecked = 0;
  for (let page = 0; page < 5; page++) {
    const response = await stripeFetch(url, secretKey, deadline);
    if (!response.ok) throw await stripeFailure(response, 'recovery lookup');

    const sessions = await response.json() as StripeCheckoutSessionList;

    for (const candidate of sessions.data || []) {
      if (!candidate.id || candidate.payment_status !== 'paid'
        || candidate.currency !== EXPECTED_CURRENCY || candidate.amount_subtotal !== EXPECTED_AMOUNT
        || candidate.customer_details?.email?.trim().toLowerCase() !== expectedEmail) continue;
      if (++candidatesChecked > 50) throw new Error('Stripe recovery search limit reached');
      try {
        // Retrieve individually: expanding products in the list exceeds Stripe's depth limit.
        const session = await retrieveCheckoutSession(candidate.id, deadline);
        if (!session.id || !isExpectedPaidSession(session, candidate.id)
          || session.customer_details?.email?.trim().toLowerCase() !== expectedEmail) continue;
        const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : undefined;
        if (!paymentIntentId) continue;

        const paymentUrl = new URL(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`);
        paymentUrl.searchParams.append('expand[]', 'latest_charge');
        const paymentResponse = await stripeFetch(paymentUrl, secretKey, deadline);
        if (!paymentResponse.ok) throw await stripeFailure(paymentResponse, 'receipt lookup');

        const payment = await paymentResponse.json() as StripeCheckoutSession['payment_intent'];
        const charge = typeof payment === 'object' ? payment.latest_charge : undefined;
        const actualReceipt = typeof charge === 'object' ? charge.receipt_number?.toUpperCase() : undefined;
        if (actualReceipt && actualReceipt === expectedReceipt) return session.id;
      } catch (error) {
        if (error instanceof StripeLookupError && error.status === 404) continue;
        throw error;
      }
    }

    if (!sessions.has_more) return undefined;
    const lastId = sessions.data?.at(-1)?.id;
    if (!lastId || lastId === url.searchParams.get('starting_after')) {
      throw new Error('Stripe recovery pagination failed');
    }
    url.searchParams.set('starting_after', lastId);
  }
  throw new Error('Stripe recovery search limit reached');
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
