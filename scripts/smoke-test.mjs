#!/usr/bin/env node
/**
 * Local smoke test for lomi. API helpers (no Bubble runtime required).
 *
 * Usage:
 *   LOMI_API_KEY=lomi_sk_test_... node scripts/smoke-test.mjs
 */

import {
  buildCreateCheckoutSessionBody,
  lomiRequest,
  resolveBaseUrl,
  sessionToResult,
  parseWebhookBody,
} from '../lib/lomi-api.mjs';

const apiKey = process.env.LOMI_API_KEY || process.env.LOMI_SECRET_KEY;

if (!apiKey) {
  console.error('Set LOMI_API_KEY to run the smoke test.');
  process.exit(1);
}

console.log('Base URL:', resolveBaseUrl(apiKey));

const me = await lomiRequest({ apiKey, method: 'GET', path: '/me' });
console.log('GET /me OK — organization:', me.organization_id || me.id || '(unknown)');

const body = buildCreateCheckoutSessionBody({
  amount: 1000,
  currency_code: 'XOF',
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://example.com/cancel',
  customer_email: 'test@example.com',
  title: 'Bubble plugin smoke test',
  bubble_thing_type: 'Order',
  bubble_thing_id: 'smoke-order-1',
  bubble_page: 'checkout',
  metadata_json: JSON.stringify({ smoke: 'bubble-plugin' }),
});

if (body.integration_source !== 'bubble') {
  throw new Error('integration_source must be bubble');
}
if (body.metadata.plugin !== 'bubble-lomi') {
  throw new Error('metadata.plugin must be bubble-lomi');
}
if (body.metadata.bubble_thing_id !== 'smoke-order-1') {
  throw new Error('metadata.bubble_thing_id missing');
}

const session = await lomiRequest({
  apiKey,
  method: 'POST',
  path: '/checkout-sessions',
  body,
});

console.log('POST /checkout-sessions OK');
console.log('  session:', session.checkout_session_id);
console.log('  url:    ', session.checkout_url);

const fetched = await lomiRequest({
  apiKey,
  method: 'GET',
  path: '/checkout-sessions/' + encodeURIComponent(session.checkout_session_id),
});

const result = sessionToResult(fetched);
if (!result.checkout_session_id) {
  throw new Error('get session missing checkout_session_id');
}
if (!result.metadata_json.includes('bubble-lomi')) {
  throw new Error('get session metadata_json missing plugin tag');
}
console.log('GET /checkout-sessions/:id OK — status:', result.status);

const lineItemsBody = buildCreateCheckoutSessionBody({
  currency_code: 'XOF',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
  line_items_json: JSON.stringify([{ price_id: 'price_smoke_test', quantity: 1 }]),
  bubble_thing_id: 'smoke-line-items',
});

if ('amount' in lineItemsBody) {
  throw new Error('line_items body must omit root amount');
}
if (!Array.isArray(lineItemsBody.line_items) || lineItemsBody.line_items.length !== 1) {
  throw new Error('line_items must be set when line_items_json provided');
}
console.log('line_items body shape OK');

const parsedWebhook = parseWebhookBody(
  JSON.stringify({
    event: 'PAYMENT_SUCCEEDED',
    data: {
      checkout_session_id: session.checkout_session_id,
      transaction_id: 'txn_smoke',
      amount: 1000,
      currency_code: 'XOF',
      metadata: { bubble_thing_id: 'smoke-order-1', plugin: 'bubble-lomi' },
    },
  }),
  'PAYMENT_SUCCEEDED',
);
if (parsedWebhook.event !== 'PAYMENT_SUCCEEDED') {
  throw new Error('parseWebhookBody event mismatch');
}
if (parsedWebhook.bubble_thing_id !== 'smoke-order-1') {
  throw new Error('parseWebhookBody bubble_thing_id mismatch');
}
console.log('parseWebhookBody OK');

console.log('Smoke test passed.');
