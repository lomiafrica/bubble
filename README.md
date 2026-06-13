# lomi. — Bubble plugin

Bubble.io plugin for accepting payments via [lomi.](https://lomi.africa) hosted checkout. Matches the same API contract as the WooCommerce, PrestaShop, Magento, and Shopify plugins (`integration_source: bubble`).

## What’s included

| Component | Purpose |
|-----------|---------|
| **Server actions** | Create/get session, test connection, webhooks, complete-if-paid, abandon, URL builder |
| **Client actions** | Redirect, embed modal, mark redirect, abandon checkout |
| **Pay button element** | Branded CTA with image mode + secured badge |
| **Checkout branding element** | Payment method icons row |
| **API connector** | Optional raw calls (initialize in Plugin Editor after sync) |
| **`lib/` + `scripts/smoke-test.mjs`** | Local API smoke test without Bubble |

Built for **Bubble Plugin API v4** (Node 18, async/Promise server actions).

## Quick start in Bubble

1. **Create the plugin** at [bubble.io/home/plugins](https://bubble.io/home/plugins) → New plugin → name it `lomi.`
2. **Link GitHub** (Plugins → Version → Synchronize with GitHub) to [`lomiafrica/bubble`](https://github.com/lomiafrica/bubble).
3. **Shared tab** — Plugin API version **4**; upload assets from `assets/`.
4. **Plugins tab in your app** (Development / Production keys).
5. **Checkout workflow**
   - *Create checkout session* (set `bubble_thing_id` for webhooks)
   - *Redirect to checkout* or **lomi. Pay button**
6. **Success page** — *Complete if paid* with `session_id` from URL.
7. **Webhook** — see [docs/WEBHOOK_WORKFLOW.md](./docs/WEBHOOK_WORKFLOW.md).

See [docs/SETUP.md](./docs/SETUP.md) for abandon flows, XOF amounts, and embed mode.

## Local smoke test

```bash
cd apps/plugins/bubble
LOMI_API_KEY=lomi_sk_test_... node scripts/smoke-test.mjs
```

Rebuild embed asset after SDK changes:

```bash
cd apps/sdks/embed && npm run build:iife
node apps/plugins/bubble/scripts/build-assets.mjs
```

## Repository layout (Bubble Git sync)

```
meta_data.json              # Marketplace / General tab
shared_tech_params.json     # Shared keys, API v4, assets
html_headers.html           # Abandon recovery + lomi-embed.js
api/raw_calls.json          # API connector definitions
actions/LOM-*/              # Server + client workflow actions
elements/LOM-paybtn/        # Pay button
elements/LOM-branding/      # Checkout branding row
assets/images/              # Branding images (upload to Bubble CDN)
assets/js/                  # checkout-abandon.js, lomi-embed.js
lib/lomi-server-helpers.js  # Shared server action logic
scripts/smoke-test.mjs
scripts/inject-helpers.mjs  # Regenerate server actions after helper edits
```

After editing `lib/lomi-server-helpers.js`, run `node scripts/inject-helpers.mjs`.

Folder names use stable internal IDs (`LOM`, `LOA`, …). **Do not rename ID keys inside JSON** after publishing.

## Contract alignment

- `POST /checkout-sessions` with `integration_source: "bubble"`
- `X-API-Key` authentication
- Sandbox host when key contains `_test_` / `sk_test`, else `api.lomi.africa`
- XOF amounts in **whole francs** (not ×100)
- Webhooks: `X-Lomi-Signature` = HMAC-SHA256(raw body, webhook secret)
- Events: `PAYMENT_SUCCEEDED`, `REFUND_COMPLETED`

## Publish checklist (Bubble marketplace — free MIT)

Prerequisites: [Bubble marketplace policies](https://manual.bubble.io/account-and-marketplace/marketplace-policies)

### Seller profile (bubble.io/account)

- [ ] Display name, logo, website
- [ ] Stripe optional for **free** open-source plugins

### Plugin Editor

- [ ] Settings → License → **Open Source (MIT)** → Publish plugin version
- [ ] Shared → Plugin API version **4**
- [ ] Upload all `assets/images/*` and `assets/js/*`; update `html_headers.html` CDN URLs if needed
- [ ] General tab: description, categories `payment` + `ecommerce`, demo URL, instructions (from this README)

### Demo app (required — built on bubble.io, not in git)

| Page / workflow | Purpose |
|-----------------|--------|
| `/checkout` | Sample Order Thing + Pay button workflow |
| `/checkout_success` | Complete if paid + mark Thing paid |
| `/checkout_cancel` | Abandon checkout |
| Backend `lomi_webhook` | Webhook receiver (verify → on payment succeeded) |

- [ ] Test keys in Development; screenshots for listing
- [ ] Webhook URL in lomi. dashboard points at demo API workflow

### GitHub sync

- [ ] Push to [`lomiafrica/bubble`](https://github.com/lomiafrica/bubble)
- [ ] Plugin Editor → Version → **Synchronize**
- [ ] Tag releases `bubble-v*` (triggers `.github/workflows/bubble-release.yml`)

### Submit

- [ ] Submit for review in Plugin Editor
- [ ] Monitor Review tab; bump version + sync for fixes

## References

- [Bubble: Building plugins](https://manual.bubble.io/account-and-marketplace/building-plugins)
- [Bubble: GitHub integration](https://manual.bubble.io/account-and-marketplace/building-plugins/github-integration)
- [Bubble: Plugin API v4](https://manual.bubble.io/account-and-marketplace/building-plugins/updating-to-plugin-api-v4)
- [Paystack Bubble plugin](https://github.com/PaystackOSS/Bubble-Plugin-Paystack) (structural reference)

## License

MIT — see [LICENSE](./LICENSE).
