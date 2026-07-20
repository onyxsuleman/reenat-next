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

---

## 🔑 Mappings & Key Shared Secrets

| Variable / Header | Config Name | Local / Production Value | Role |
| :--- | :--- | :--- | :--- |
| **X-Api-Key** | `SHIPROCKET_API_KEY` | `src_reenat_prod_key_9f8d7c6b5a` | The shared secret you will provide to Shiprocket so they can fetch your catalog. |

---

## ⚡ Next Steps - Finalizing Fastrr Checkout Integration

Once the Shiprocket team responds and provides your **API Key** and **Secret Key**, we will complete the following tasks:

### Task 1: Add Credentials to Coolify
Save the two credentials from Shiprocket in your `reenat-next` Coolify Environment Variables:
1. `SHIPROCKET_MERCHANT_API_KEY` (Used to authenticate our calls to Shiprocket)
2. `SHIPROCKET_MERCHANT_SECRET_KEY` (Used to sign request payloads with HMAC SHA256)

### Task 2: Create Webhook Endpoint (`/api/shiprocket/webhook/order`)
Create a Next.js API route that:
1. Receives order details from Shiprocket upon successful payment.
2. Cryptographically verifies the request source using the `SHIPROCKET_MERCHANT_SECRET_KEY` via HMAC.
3. Saves the completed customer profile in the `customers` table.
4. Records the completed order inside the `orders` table (populating the structured shipping address and the `shiprocket_order_id`).

### Task 3: Implement Checkout Token Generator & Script Injection
1. Create a server-side route `/api/checkout/token` that calls Shiprocket's token api (`https://checkout-api.shiprocket.com/api/v1/access-token/checkout`) using your seller credentials to get a checkout transaction token.
2. Modify your `/cart` page to load the Shiprocket Fastrr JavaScript SDK:
   ```html
    <script src="https://checkout-ui.shiprocket.com/assets/js/channels/custom.js"></script>
   ```
3. Connect the cart checkout button to retrieve the transaction token and launch the Fastrr overlay iframe:
   ```javascript
   HeadlessCheckout.addToCart(event, token, { fallbackUrl: "https://reenattrends.com/cart" });
   ```
