# Reenat Trends Storefront Reference
@.agents/AGENTS.md
@PRODUCT_IDENTITY_AND_ORDER_FLOW_REPORT.md

## 🔒 STRICT PRODUCTION RULE: DO NOT DISTURB CHECKOUT & SHIPROCKET APIS
Under NO circumstances should any future website changes, styling tweaks, catalog additions, or refactoring disturb, modify, or break the core checkout and order fulfillment pipelines:
1. `/api/checkout/token` — Fastrr session token generation & payload signing.
2. `/api/shiprocket/webhook/order` — Fastrr order intake webhook, defensive address extraction, stock management, and deduplication.
3. `/api/checkout` — Manual fallback checkout with strict address validation.
4. `/api/cms/shiprocket-sync` & `src/utils/shiprocketApi.js` — Shiprocket fulfillment dashboard adhoc push.
5. All existing route contracts, HMAC signatures, database schemas, and payload structures must remain 100% preserved.
