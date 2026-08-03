# Reenat Trends - Shiprocket Integration Guide & Session Log

This document serves as a complete record of the Shiprocket Catalog Sync and Fastrr Checkout integration setup. It records the database updates, developed endpoints, security keys, and next steps to resume development once you receive credentials from the Shiprocket onboarding team.

---

## 📅 Session Summary & Milestone Log

### Milestone 1: Catalog Sync API Integration (Completed)
* **Goal**: Share 3 endpoints with Shiprocket to sync your products and categories.
* **Security**: Configured header authentication via `X-Api-Key`.
* **Endpoints Developed**:
  * **Products API**: `https://reenattrends.com/api/shiprocket/products` (Groups database variants into products by `catalog_id`).
  * **Products by Collection API**: `https://reenattrends.com/api/shiprocket/products?collection_id={id}` (Filters by category using database foreign keys).
  * **Collections API**: `https://reenattrends.com/api/shiprocket/collections` (Loads categories directly from the collections table).
* **Local Auth Key**: `src_reenat_prod_key_9f8d7c6b5a` (Set in `.env.local` as `SHIPROCKET_API_KEY`).

### Milestone 2: Supabase Database Enhancements (Completed)
* **Goal**: Structure the database to support e-commerce operations, structured shipping details, tracking columns, and customer profiles.
* **Migration Script**: Executed `scripts/db-enhancements.sql` with 100% success.
* **Database Updates Applied**:
  * Created `collections` table. Auto-migrated 3 unique categories and linked **44 saree variants** to their corresponding collection IDs.
  * Created `customers` profile table.
  * Created `return_orders` table with a standard status state-machine ('Requested', 'Approved', 'Rejected', 'Picked Up', 'Completed').
  * Enhanced `orders` table with separate address columns (`shipping_line1`, `shipping_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`) and Shiprocket logistics tracking columns (`shiprocket_order_id`, `tracking_number`, `carrier_name`, `tracking_url`).

### Milestone 3: Fastrr Headless 1-Click Login & Customer Data Sync (Completed)
* **Goal**: Enable 1-Click Phone OTP Login on `/login` and auto-sync customer profiles to Supabase.
* **Credentials Verified**:
  * `SHIPROCKET_MERCHANT_API_KEY`: `ID12gSEcGkJ5t77y`
  * `SHIPROCKET_MERCHANT_SECRET_KEY`: `IH1WLhuUkNaLrUBuOns4JJe53tdsGCMr`
* **Endpoints Developed**:
  * **Login Token Generator**: `/api/auth/fastrr/token` (Generates HMAC SHA256 signature in Base64 and requests token from `https://checkout-api.shiprocket.com/api/v1/access-token/login`).
  * **Customer Data Sync**: `/api/auth/fastrr/customer` (Fetches customer data from `https://checkout-api.shiprocket.com/api/v1/customer-data/`, upserts user to Supabase `customers` table, and logs user into `AppContext`).
* **UI Integration**: Added **"⚡ Fastrr 1-Click Phone Login"** button on `/login` and preloaded Fastrr SDK scripts in `RootLayout`.

---

## 🔑 Mappings & Key Shared Secrets

| Variable / Header | Config Name | Local / Production Value | Role |
| :--- | :--- | :--- | :--- |
| **X-Api-Key** | `SHIPROCKET_API_KEY` | `src_reenat_prod_key_9f8d7c6b5a` | Shared secret for Shiprocket to fetch catalog endpoints. |
| **Merchant API Key** | `SHIPROCKET_MERCHANT_API_KEY` | `ID12gSEcGkJ5t77y` | Merchant API key provided by Shiprocket Support. |
| **Merchant Secret Key** | `SHIPROCKET_MERCHANT_SECRET_KEY` | `IH1WLhuUkNaLrUBuOns4JJe53tdsGCMr` | HMAC SHA256 secret key for signing token requests and webhooks. |

---

## ⚡ Production Verification & Next Steps

1. **Coolify Environment Variables**:
   Ensure `SHIPROCKET_MERCHANT_API_KEY` and `SHIPROCKET_MERCHANT_SECRET_KEY` are saved in your Coolify dashboard production environment settings.

2. **Webhooks**:
   Verify `/api/shiprocket/webhook/order` endpoint URL is registered in your Shiprocket Fastrr Dashboard (`https://shiprocket.in`) under Developer Settings -> Webhooks.

