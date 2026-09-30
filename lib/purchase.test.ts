import assert from 'node:assert/strict';
import test from 'node:test';
import { findPaidCheckoutSessionByReceipt, verifyPaidCheckoutSession } from './purchase.ts';

const paid = (tax = 214) => ({
  id: 'cs_fixture', payment_status: 'paid', currency: 'usd',
  amount_subtotal: 2900, amount_total: 2900 + tax,
  total_details: { amount_tax: tax, amount_discount: 0, amount_shipping: 0 },
  customer_details: { email: 'buyer@example.com' }, payment_intent: 'pi_fixture',
  line_items: { data: [{ amount_subtotal: 2900, amount_total: 2900 + tax,
    price: { product: { name: 'A Nordic Childhood: The Learning Collection' } } }] },
});

test('paid collection verification permits tax while preserving entitlement checks', async (t) => {
  const previous = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = 'test-only';
  t.after(() => { if (previous === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = previous; });
  let session = paid();
  t.mock.method(globalThis, 'fetch', async () => Response.json(session));
  assert.equal(await verifyPaidCheckoutSession('cs_fixture'), true, 'taxed purchase');
  session = paid(0);
  assert.equal(await verifyPaidCheckoutSession('cs_fixture'), true, 'untaxed purchase');
  for (const overrides of [
    { payment_status: 'unpaid' }, { currency: 'eur' }, { amount_subtotal: 100 },
    { amount_total: 1 }, { id: 'cs_other' },
    { line_items: { data: [] } },
    { line_items: { data: [{ ...paid().line_items.data[0], price: { product: { name: 'Other product' } } }] } },
  ]) {
    session = { ...paid(), ...overrides };
    assert.equal(await verifyPaidCheckoutSession('cs_fixture'), false, JSON.stringify(overrides));
  }
});

test('recovery retrieves each session separately, paginates, and matches email plus receipt', async (t) => {
  const previous = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = 'test-only';
  t.after(() => { if (previous === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = previous; });
  let receipt = '2964-1006';
  let email = 'buyer@example.com';
  let unavailable = false;
  t.mock.method(globalThis, 'fetch', async (input: string | URL) => {
    const url = new URL(input);
    if (unavailable) return new Response('', { status: 503 });
    if (url.pathname === '/v1/checkout/sessions') {
      assert.equal(url.searchParams.has('expand[]'), false, 'avoid unsupported deep list expansion');
      assert.equal(url.searchParams.get('customer_details[email]'), 'buyer@example.com');
      return Response.json(url.searchParams.has('starting_after')
        ? { data: [paid()], has_more: false }
        : { data: [{ ...paid(), id: 'cs_missing' }, { ...paid(), id: 'cs_older', payment_status: 'unpaid' }], has_more: true });
    }
    if (url.pathname === '/v1/checkout/sessions/cs_missing') return new Response('', { status: 404 });
    if (url.pathname === '/v1/checkout/sessions/cs_fixture') return Response.json({ ...paid(), customer_details: { email } });
    if (url.pathname === '/v1/payment_intents/pi_fixture') return Response.json({ latest_charge: { receipt_number: receipt } });
    throw new Error('Unexpected Stripe request');
  });
  assert.equal(await findPaidCheckoutSessionByReceipt(' BUYER@example.com ', ' 2964-1006 '), 'cs_fixture');
  receipt = '0000-0000';
  assert.equal(await findPaidCheckoutSessionByReceipt('buyer@example.com', '2964-1006'), undefined);
  receipt = '2964-1006'; email = 'someone-else@example.com';
  assert.equal(await findPaidCheckoutSessionByReceipt('buyer@example.com', '2964-1006'), undefined);
  unavailable = true;
  await assert.rejects(findPaidCheckoutSessionByReceipt('buyer@example.com', '2964-1006'), /Stripe/);
});

test('transient provider failures retry once, and long searches stop with a support error', async (t) => {
  const previous = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = 'test-only';
  t.after(() => { if (previous === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = previous; });
  let requests = 0;
  let search = false;
  t.mock.method(globalThis, 'fetch', async () => {
    requests++;
    if (search) return Response.json({ data: [{ ...paid(), id: `cs_unpaid_${requests}`, payment_status: 'unpaid' }], has_more: true });
    if (requests === 1) return new Response('', { status: 503, headers: { 'retry-after': '0' } });
    return Response.json(paid());
  });
  assert.equal(await verifyPaidCheckoutSession('cs_fixture'), true);
  assert.equal(requests, 2);
  await assert.rejects(verifyPaidCheckoutSession('..'), /Invalid checkout/);
  assert.equal(requests, 2, 'invalid path must not contact Stripe');
  search = true; requests = 0;
  await assert.rejects(findPaidCheckoutSessionByReceipt('buyer@example.com', '2964-1006'), /search limit/);
  assert.equal(requests, 5, 'unpaid sessions need no individual retrievals');
});
