# Reenat Next Storefront - Project Context & Rules

This project has been migrated from a static HTML/CSS/JS site to a modern **Next.js App Router** structure using Tailwind CSS v4 and Supabase client-state sync.

## Project Structure & Architecture
- **Root Directory**: `reenat-next` (formerly `Reenat Next`)
- **Key Context**: `src/context/AppContext.js` manages global state: Cart, Wishlist, Theme (dark/light), and Toasts.
- **Supabase Integration**: `src/utils/supabase.js` serves inventory database tables. Online inventory queries fall back to local mock data automatically when Supabase environment variables are missing.
- **Key Components**:
  - `Navbar.js` & `Footer.js` (global layout header/footer). All SVG components must use camelCase React props (e.g. `clipRule`, `strokeWidth`, `strokeLinecap`).
  - `ProductCard.js` (reusable saree inventory display).
  - `QuickViewModal.js` (pop-up modal for detail preview).
- **Key Routes**:
  - `/` (Home, Carousel banner)
  - `/about` (Artisan story columns)
  - `/new-arrivals` (Search and categories filter)
  - `/product` (Details page, WhatsApp reviews share link)
  - `/wishlist` & `/cart` (State-synced cart/wishlist management)
  - `/login` & `/account` (User profile page with mock order history)
  - `/cms` (Inventory management console dashboard, passcode protected by `admin123`)

## Important Guidelines for Future Agents
1. **Hydration Mismatch Mitigation**: Both `<html>` and `<body>` tags in `src/app/layout.js` include `suppressHydrationWarning` to prevent React hydration issues stemming from system-level dark/light mode configurations.
2. **Quota Handling**: LocalStorage serialization of products cache inside `src/context/AppContext.js` is wrapped in try-catch to prevent `QuotaExceededError` if large base64 image strings are present.
3. **SVG Attributes**: Never use hyphenated standard HTML SVG attributes (like `stroke-linecap`). Always use React JSX camelCase props (like `strokeLinecap`).

## National-Level E-Commerce Standard Guidelines

All future agents must design and implement features to match the standards of top Indian e-commerce sites (Flipkart, Meesho):

1. **Seamless Catalog Management**:
   - Keep forms clean, intuitive, and error-resilient.
   - Support bulk/simple listing updates with instant validation, clear tooltips, and robust fallback states for images.

2. **High-Speed Performance & Caching**:
   - Never embed heavy resources (like base64 files or raw data arrays) directly inside code bundles. Use URL-based media links and keep client-side context state lightweight (< 20KB).
   - Leverage `next/image` lazy loading, responsive sizes, and whitelisted CDNs for instant, zero-delay rendering.

3. **Secure Checkout & Payments**:
   - When setting up payment gateways (such as Razorpay/UPI), adhere to standard secure server-side/client-side integrations with proper webhook verification and fail-safe order state syncing.

4. **Zero-Tolerance Error Checking**:
   - Every feature must be checked for hydration warnings, local storage quota issues, and browser compatibility.

---

## Planned Feature: Pinned Products / Featured Listings

> ⚠️ **Status: PLANNED BUT NOT YET IMPLEMENTED** — User confirmed intent to execute. Waiting for remaining questions to be clarified before starting.

### Concept
The homepage product grid will be split into two distinct sections:
1. **Top 9 "Pinned" products** — always load instantly (hardcoded defaults on first visit, localStorage cache on return visits)
2. **Custom CMS listings** — appear below the pinned 9, loaded asynchronously from Supabase

### Architecture
- A `pinned_products` table in Supabase stores which products are "featured" + their display `pin_order` (1–9).
- The CMS panel (`/cms`) will get a new **"⭐ Featured Listings"** section where the admin can pick and reorder the pinned 9 without touching code.
- On **first visit**: the hardcoded `defaultProducts` array in `AppContext.js` renders instantly, then gets swapped/updated once Supabase responds with the pinned selection.
- On **return visits**: `localStorage` cache of pinned products provides instant load, silently refreshed in background.
- Custom Supabase listings always appear **below** the pinned 9, loaded async.

### Critical Architecture Insight (do not contradict this)
- `localStorage` caching ONLY benefits **returning visitors**, NOT first-timers.
- For **first-time visitors**, ONLY hardcoded `defaultProducts` in `AppContext.js` provide instant rendering.
- This is why the hardcoded fallback must remain AND be expanded to 9 items.
- The hardcoded defaults act as the "skeleton" that is immediately visible, then replaced by the CMS-controlled pinned selection once DB responds.

### Supabase Status
- ✅ **Connected and verified working** (tested via direct query in this session).
- URL: `https://eilxtuedgtimrxfvqojv.supabase.co`
- `products` table exists and returns data correctly.
- A new `pinned_products` table will need to be created as part of this feature.

### Files That Will Need Changes
- `src/context/AppContext.js` — expand `defaultProducts` to 9 items, add `pinnedProducts` state and fetch logic
- `src/app/page.js` — split product grid into pinned section + custom section
- `src/app/cms/page.js` — add "⭐ Featured Listings" management panel
- Supabase — add `pinned_products` table schema

---

## Unified Product Identity & Image Architecture Rules (FINALIZED)

All listings, CMS edits, and product displays must strictly adhere to the following identity definitions and DB column structure:

1. **Catalog ID (Group ID)**:
   * **Purpose**: Identifies the overall catalog/group page. Groups all color variations together.
   * **Format**: Numeric string representing the catalog (e.g., `1`, `2`, `3`...).
   * **Database Mapping**: Stored in `catalog_id` column.
   * **Automation**: Set automatically in the CMS (incremented based on max ID in the system).

2. **Product ID (Unique Saree ID)**:
   * **Purpose**: Absolute unique, unchangeable, system-generated identifier for every individual saree variation.
   * **Format**: `"NYS" + String(db_row_id).padStart(4, '0')` (e.g., `NYS0001`, `NYS0002`).
   * **Lookup Role**: Used as the primary lookup parameter in URLs (`/product?id=NYS0001`).

3. **SKU ID (Seller SKU Code)**:
   * **Purpose**: Shipping, billing, sorting, and dispatch tracking code.
   * **Format**: Custom string entered by admin (e.g., `KJV-RED-01`).
   * **Behavior**: Fully editable at any time. Non-unique (duplicates are permitted).
   * **Database Mapping**: Stored in `styleid` column.

4. **Structured Image Roles**:
   * All products must map up to 4 images with explicit roles:
     * `image_front` / `image` (Required): Primary front-facing display thumbnail.
     * `image_back` / `image2` (Optional): Back view / pallu details.
     * `image_fabric` / `image3` (Optional): Texture/weave close-up.
     * `image_model` / `image4` (Optional): Styling or model view.

## Scripting & Path Guidelines (Windows)
- When writing file paths inside JavaScript/Node.js helper scripts on Windows, always use forward slashes (`/`) instead of backslashes (`\`) to prevent backslash escape sequence runtime errors.
