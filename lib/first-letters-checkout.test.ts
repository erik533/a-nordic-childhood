import assert from 'node:assert/strict';
import test from 'node:test';
import { attributedFirstLettersCheckoutUrl } from './checkout-attribution.ts';
import { resolveFirstLettersCheckoutUrl } from './first-letters-offer.ts';

test('checkout configuration fails closed until an HTTPS destination is approved', () => {
  for (const value of [undefined, '', '  ', '/checkout', 'not a URL', 'javascript:alert(1)', 'http://example.test', 'https://user:pass@example.test']) {
    assert.equal(resolveFirstLettersCheckoutUrl(value), '#purchase');
  }
  assert.equal(resolveFirstLettersCheckoutUrl(' https://checkout.example.test/order?v=2#pay '),
    'https://checkout.example.test/order?v=2#pay');
});

test('checkout preserves all five supported UTMs exactly and retains destination settings', () => {
  const incoming = new URLSearchParams({
    utm_source: 'Meta', utm_medium: 'PaidSocial', utm_campaign: 'Autumn Letters 2026',
    utm_content: 'Hero_A.2', utm_term: 'printable letters',
    email: 'private@example.com', first_name: 'Erika', phone: '+46123456789',
    contact_id: 'private-contact', redirect: 'https://untrusted.example',
    gclid: 'unsupported', campaign_id: 'unsupported',
  });
  const result = new URL(attributedFirstLettersCheckoutUrl(
    'https://checkout.example.test/order?v=2&utm_source=default#payment', incoming.toString(),
  ));
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    assert.equal(result.searchParams.get(key), incoming.get(key));
  }
  assert.deepEqual([...result.searchParams.keys()].sort(),
    ['v', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].sort());
  assert.equal(result.hash, '#payment');
  assert.equal(result.searchParams.get('v'), '2');
});

test('only consent-authorized valid fbclid is forwarded, without changing its case', () => {
  const destination = 'https://checkout.example.test/order?fbclid=stale';
  const search = '?fbclid=IwAR_Example-123.abc';
  assert.equal(new URL(attributedFirstLettersCheckoutUrl(destination, search)).searchParams.has('fbclid'), false);
  assert.equal(new URL(attributedFirstLettersCheckoutUrl(destination, search, { includeAdClickIds: false })).searchParams.has('fbclid'), false);
  assert.equal(new URL(attributedFirstLettersCheckoutUrl(destination, search, { includeAdClickIds: true })).searchParams.get('fbclid'), 'IwAR_Example-123.abc');
  for (const id of ['private@example.com', 'a'.repeat(251), 'https://example.test', '\ninvalid']) {
    assert.equal(new URL(attributedFirstLettersCheckoutUrl(destination,
      new URLSearchParams({ fbclid: id }).toString(), { includeAdClickIds: true })).searchParams.has('fbclid'), false);
  }
});

test('rejects email-like, URL-like, control-character and oversized campaign values', () => {
  for (const value of ['private@example.com', 'https://example.test', '+46(123)456', 'a'.repeat(129), 'hello\nworld']) {
    const result = new URL(attributedFirstLettersCheckoutUrl('https://checkout.example.test/order',
      new URLSearchParams({ utm_campaign: value }).toString()));
    assert.equal(result.searchParams.has('utm_campaign'), false);
  }
});

test('fallback never receives attribution and repeat application does not duplicate fields', () => {
  for (const value of ['#purchase', '', 'javascript:alert(1)', 'http://example.test', 'https://user:pass@example.test']) {
    assert.equal(attributedFirstLettersCheckoutUrl(value, '?utm_source=Meta'), '#purchase');
  }
  const first = attributedFirstLettersCheckoutUrl('https://checkout.example.test/order', '?utm_source=Meta');
  assert.equal(attributedFirstLettersCheckoutUrl(first, '?utm_source=Meta'), first);
});
