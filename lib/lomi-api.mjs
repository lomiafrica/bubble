/**
 * ESM wrapper for local smoke tests — logic lives in lomi-server-helpers.js
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const helpers = require(join(dirname(fileURLToPath(import.meta.url)), 'lomi-server-helpers.js'));

export const SANDBOX_BASE_URL = 'https://sandbox.api.lomi.africa';
export const LIVE_BASE_URL = 'https://api.lomi.africa';

export const resolveBaseUrl = helpers.lomiResolveBaseUrl;
export const formatAmountMinorUnits = helpers.lomiFormatAmountMinorUnits;
export const normalizeSessionPayload = helpers.lomiNormalizePayload;
export const buildCreateCheckoutSessionBody = helpers.lomiBuildCreateCheckoutSessionBody;
export const sessionToResult = helpers.lomiSessionToResult;
export const parseWebhookBody = helpers.lomiParseWebhookBody;
export const verifyWebhookSignature = helpers.lomiVerifyWebhookSignature;
export const buildCheckoutUrls = helpers.lomiBuildCheckoutUrls;
export const lomiRequest = async ({ apiKey, method, path, body }) =>
  helpers.lomiRequest(apiKey, method, path, body);
