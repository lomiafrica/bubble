// === LOMI_HELPERS_START ===
/**
 * Shared lomi. helpers for Bubble server actions.
 * Keep in sync with lib/lomi-api.mjs (local smoke tests).
 * Injected into server.js files between LOMI_HELPERS markers via scripts/inject-helpers.mjs
 */

function lomiResolveBaseUrl(apiKey) {
  var key = String(apiKey || '').toLowerCase();
  if (key.indexOf('_test_') !== -1 || key.indexOf('sk_test') !== -1) {
    return 'https://sandbox.api.lomi.africa';
  }
  return 'https://api.lomi.africa';
}

function lomiFormatAmountMinorUnits(amount, currencyCode) {
  var code = String(currencyCode || 'XOF').toUpperCase();
  var value = Number(amount);
  if (!isFinite(value)) {
    throw new Error('Amount must be a number');
  }
  if (code === 'XOF') {
    return Math.round(value);
  }
  return Math.round(value * 100);
}

function lomiNormalizePayload(json) {
  if (json && typeof json === 'object' && json.data && typeof json.data === 'object') {
    return json.data;
  }
  return json;
}

function lomiParseJsonField(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value === 'object') {
    return value;
  }
  try {
    return JSON.parse(String(value));
  } catch (e) {
    throw new Error(fieldName + ' must be valid JSON');
  }
}

function lomiRequireApiKey(context) {
  var apiKey = context.keys['API Secret Key'];
  if (!apiKey) {
    throw new Error('lomi. API secret key is not configured in Plugins → lomi.');
  }
  return apiKey;
}

function lomiRequireWebhookSecret(context) {
  var secret = context.keys['Webhook secret'];
  if (!secret) {
    return '';
  }
  return String(secret);
}

function lomiIsTestApiKey(apiKey) {
  var key = String(apiKey || '').toLowerCase();
  return key.indexOf('_test_') !== -1 || key.indexOf('sk_test') !== -1;
}

function lomiFormatMerchantFacingError(httpCode, detail, apiKey, json) {
  var reference = '';
  if (json && json.request_id) {
    reference = ' (Reference: ' + String(json.request_id) + ')';
  } else if (json && json.correlation_id) {
    reference = ' (Reference: ' + String(json.correlation_id) + ')';
  }
  var modeLabel = lomiIsTestApiKey(apiKey) ? 'test' : 'live';
  switch (Number(httpCode)) {
    case 401:
      return 'Invalid secret API key for ' + modeLabel + ' mode. Copy the key from Dashboard → Developers → API keys.' + reference;
    case 403:
      return 'This API key cannot perform this action. Check key permissions in the lomi. dashboard.' + reference;
    case 404:
      return 'lomi. could not find this resource. Confirm Development vs Production keys match your dashboard.' + reference;
    case 422:
      return 'Payment could not be created: ' + detail + '.' + reference;
    default:
      return 'lomi. returned an error (' + httpCode + '): ' + detail + '.' + reference + ' See docs.lomi.africa/build/ecommerce-extensions/bubble.';
  }
}

async function lomiRequest(apiKey, method, path, body) {
  var baseUrl = lomiResolveBaseUrl(apiKey);
  var headers = {
    'X-API-Key': apiKey,
    Accept: 'application/json',
  };
  var init = { method: method, headers: headers };
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  var response = await fetch(baseUrl + path, init);
  var json = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) {
    var detail =
      (json && (json.message || json.error)) ||
      'Request failed';
    throw new Error(lomiFormatMerchantFacingError(response.status, detail, apiKey, json));
  }
  return lomiNormalizePayload(json);
}

function lomiBuildCreateCheckoutSessionBody(properties) {
  var currency = String(properties.currency_code || 'XOF').toUpperCase();
  var lineItems = lomiParseJsonField(properties.line_items_json, 'line_items_json');
  var metadata = {
    plugin: 'bubble-lomi',
  };

  if (properties.bubble_thing_type) {
    metadata.bubble_thing_type = properties.bubble_thing_type;
  }
  if (properties.bubble_thing_id) {
    metadata.bubble_thing_id = String(properties.bubble_thing_id);
  }
  if (properties.bubble_page) {
    metadata.bubble_page = properties.bubble_page;
  }
  if (properties.bubble_app_version) {
    metadata.bubble_app_version = properties.bubble_app_version;
  }

  var extra = lomiParseJsonField(properties.metadata_json, 'metadata_json');
  if (extra && typeof extra === 'object') {
    metadata = Object.assign({}, metadata, extra);
  }

  var body = {
    currency_code: currency,
    integration_source: 'bubble',
    success_url: properties.success_url,
    cancel_url: properties.cancel_url,
    title: properties.title || 'Bubble checkout',
    require_billing_address: Boolean(properties.require_billing_address),
    metadata: metadata,
  };

  if (Array.isArray(lineItems) && lineItems.length > 0) {
    body.line_items = lineItems;
  } else {
    body.amount = lomiFormatAmountMinorUnits(properties.amount, currency);
  }

  if (properties.customer_email) body.customer_email = properties.customer_email;
  if (properties.customer_name) body.customer_name = properties.customer_name;
  if (properties.customer_phone) body.customer_phone = properties.customer_phone;
  if (properties.customer_city) body.customer_city = properties.customer_city;
  if (properties.customer_country) body.customer_country = properties.customer_country;
  if (properties.customer_address) body.customer_address = properties.customer_address;
  if (properties.customer_postal_code) body.customer_postal_code = properties.customer_postal_code;
  if (properties.customer_id) body.customer_id = properties.customer_id;
  if (properties.description) body.description = properties.description;
  if (properties.product_id) body.product_id = properties.product_id;
  if (properties.price_id) body.price_id = properties.price_id;
  if (properties.quantity) body.quantity = Number(properties.quantity);
  if (properties.allow_coupon_code) body.allow_coupon_code = Boolean(properties.allow_coupon_code);

  return body;
}

function lomiSessionToResult(session, fallbackCurrency) {
  var metadata = session.metadata;
  return {
    checkout_session_id: session.checkout_session_id || '',
    checkout_url: session.checkout_url || '',
    status: session.status || '',
    amount: session.amount,
    currency_code: session.currency_code || fallbackCurrency || '',
    customer_email: session.customer_email || '',
    transaction_id: session.transaction_id || session.payment_id || '',
    metadata_json: metadata ? JSON.stringify(metadata) : '',
    created_at: session.created_at || '',
    updated_at: session.updated_at || '',
    expires_at: session.expires_at || '',
  };
}

function lomiVerifyWebhookSignature(rawBody, signature, webhookSecret) {
  var crypto = require('crypto');
  if (!signature || !webhookSecret) {
    return false;
  }
  var computed = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  var provided = String(signature);
  if (computed.length !== provided.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(computed, 'utf8'), Buffer.from(provided, 'utf8'));
}

function lomiParseWebhookBody(rawBody, eventHeader) {
  var payload = lomiParseJsonField(rawBody, 'raw_body');
  var data = payload && payload.data ? payload.data : payload;
  if (!data || typeof data !== 'object') {
    throw new Error('Webhook body must contain a JSON object');
  }
  var event = eventHeader || payload.event || data.event || '';
  var metadata = data.metadata || {};
  return {
    event: String(event),
    checkout_session_id: String(
      data.checkout_session_id || metadata.checkout_session_id || '',
    ),
    transaction_id: String(data.transaction_id || data.payment_id || ''),
    amount: data.amount,
    currency_code: data.currency_code || '',
    metadata_json: JSON.stringify(metadata),
    bubble_thing_id: metadata.bubble_thing_id ? String(metadata.bubble_thing_id) : '',
    bubble_thing_type: metadata.bubble_thing_type ? String(metadata.bubble_thing_type) : '',
    raw_event: JSON.stringify(payload),
  };
}

function lomiBuildCheckoutUrls(properties) {
  var thingId = properties.bubble_thing_id ? String(properties.bubble_thing_id) : '';
  var successBase = String(properties.success_page_url || '');
  var cancelBase = String(properties.cancel_page_url || '');
  var joiner = function (base) {
    if (!base) return '';
    return base.indexOf('?') === -1 ? base + '?' : base + '&';
  };
  var success =
    joiner(successBase) +
    'thing_id=' +
    encodeURIComponent(thingId) +
    '&session_id={CHECKOUT_SESSION_ID}';
  var cancel = cancelBase
    ? joiner(cancelBase) + 'thing_id=' + encodeURIComponent(thingId)
    : '';
  return { success_url: success, cancel_url: cancel };
}


// === LOMI_HELPERS_END ===

async function (properties, context) {
  if (properties.event && properties.event !== 'PAYMENT_SUCCEEDED') {
    throw new Error('Expected PAYMENT_SUCCEEDED event, got ' + properties.event);
  }
  var apiKey = lomiRequireApiKey(context);
  var sessionId = properties.checkout_session_id;
  if (!sessionId) {
    throw new Error('checkout_session_id is required');
  }
  var session = await lomiRequest(
    apiKey,
    'GET',
    '/checkout-sessions/' + encodeURIComponent(sessionId),
    null,
  );
  var status = String(session.status || '').toLowerCase();
  if (status !== 'completed') {
    throw new Error('Checkout session is not completed (status: ' + status + ')');
  }
  var result = lomiSessionToResult(session);
  result.paid = true;
  return result;
}
