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
   * **Purpose**: Identifies the overall catalog/group page. Groups all color/style variations together.
   * **Format**: Alphanumeric string representing the catalog (e.g., `1`, `2`, `3`, `M1`, `M2`, `M3`...).
   * **Database Mapping**: Stored in `catalog_id` column.
   * **Automation**: Set automatically in the CMS (incremented based on max ID in the system), or custom alphanumeric input.
   * **Grouping Behavior**: All products with the same Catalog ID are shown under the same catalog layout to customers. If a catalog already has 6 live products, adding another variation makes it the 7th product in that catalog.

2. **Product ID (Unique Saree ID)**:
   * **Purpose**: Absolute unique, unchangeable, system-generated identifier for every individual saree variation.
   * **Format**: `"NSY" + String(db_row_id).padStart(4, '0')` (e.g., `NSY0042`, `NSY0043`, `NSY0099`). (Note: The rule previously had a typo as `NYS`; it must strictly be `NSY` as per code implementation).
   * **Lookup Role**: Used as the primary lookup parameter in URLs (`/product?id=NSY0042`).
   * **Uniqueness / Adding new variations**: When adding a new product variation or style to an existing catalog, the database assigns a new higher sequential database ID. It does NOT merge or overwrite older products. New variations are simply appended to the catalog as new entries.

3. **SKU ID (Seller SKU Code)**:
   * **Purpose**: Shipping, billing, sorting, and dispatch tracking code.
   * **Format**: Custom string entered by admin (e.g., `MANGO GREEN PAI X1`).
   * **Behavior**: Fully editable at any time. Non-unique (duplicates are permitted). For example, Catalog `M1` and Catalog `M3` can both contain a product with the same SKU ID `"MANGO GREEN PAI X1"`. Since they have distinct, unique Product IDs (`NSY0042` vs `NSY0043`), the system is not confused.
   * **Database Mapping**: Stored in `styleid` column.

4. **Structured Image Roles**:
   * All products must map up to 6 images with explicit roles:
     * `image_front` / `image` (Required): Primary front-facing display thumbnail.
     * `image_back` / `image2` (Optional): Back view / pallu details.
     * `image_fabric` / `image3` (Optional): Texture/weave close-up.
     * `image_model` / `image4` (Optional): Styling or model view.
     * `image_extra1` / `image5` (Optional): Additional angle or detail 1.
     * `image_extra2` / `image6` (Optional): Additional angle or detail 2.

## Scripting & Path Guidelines (Windows)
- When writing file paths inside JavaScript/Node.js helper scripts on Windows, always use forward slashes (`/`) instead of backslashes (`\`) to prevent backslash escape sequence runtime errors.

---

## Known Issue: Duplicate ID Clashing & Cache Merging

> ⚠️ **Status: WORK IN PROGRESS / ON HOLD** — The live database is updated and the bugs are resolved, but the actual product variations must be re-added.
> 
> ### Current Situation
> 1. The database columns `catalog_id` and `linked_to` are set up and working.
> 2. Hardcoded secret sweeping and passcode environment variable integrations have been deployed and verified.
> 3. Refactored the merge logic in `src/context/AppContext.js` and batch saving in `src/app/cms/page.js` to ensure that duplicate Product IDs (clashing on `id: 42` / `NSY0042`) from browser `localStorage` local cache are filtered out.
> 4. Only one variation (`Navy Blue` / `NSY0042`) is currently stored in the live Supabase database. The other variations (`Gold`, `Grey`, `Mango Rani`, `Mango Green`) were lost/deleted from the database during earlier failed sync attempts (due to missing database columns at that time).
> 5. **Next steps**: Edit the remaining `NSY0042` row in the CMS console, change it back to `Mango Green` (if you want Mango Green to be the front cover item), and then use the **"Add Saree variation / color"** button to re-add the other variants. Submit the request to write them as new rows into the live database.


---

## National E-Commerce Standard Road Map & Goals

This roadmap defines the remaining development, optimization, and verification tasks required to prepare the Reenat storefront for a bulletproof, bug-free production launch.

### Phase 1: Database & Catalog Verification
- [ ] **Restore Saree Variations**: 
  - Edit the single row `NSY0042` in `/cms` to set its cover color.
  - Re-add the 4 missing variations (`Gold`, `Grey`, `Mango Rani`, `Mango Green`) as separate color variants under the same Catalog ID.
  - Submit/Sync to save them as new sequential rows in the live Supabase database.
- [ ] **Verify Variant Linkage**:
  - Open `/product?id=NSY0042` and verify that the color selector matches and links correctly between all variants.

### Phase 2: Feature Implementation - Pinned Products / Featured Listings
- [ ] **Supabase Schema Creation**:
  - Create the `pinned_products` table in Supabase.
  - Link it with foreign keys to `products(id)`.
  - Add constraint for `pin_order` (unique values between 1 and 9).
- [ ] **Expand Fallback Products**:
  - Update `defaultProducts` in `src/context/AppContext.js` to contain 9 fully populated placeholder items.
- [ ] **Asynchronous Fetching & Caching**:
  - Write query logic in `AppContext.js` to fetch pinned items, store them in `localStorage`, and background-update them silently.
- [ ] **Homepage Products Section Split**:
  - Refactor `src/app/page.js` to display the "Pinned 9 Products" grid on top.
  - Load non-pinned Custom Listings from Supabase below the pinned grid.
- [ ] **CMS "Featured Listings" Panel**:
  - Design a control area in `/cms` where the admin can select products and assign their pin order (1-9).
  - Verify that reordering pins updates the database correctly.

### Phase 3: Performance & Asset Optimization
- [ ] **Client-Side Image Compression**:
  - Add image resizing/compression (e.g. using a browser-based canvas tool or `browser-image-compression`) to the CMS upload page (`src/app/cms/page.js`).
  - Restrict raw file uploads larger than 1MB to save bandwidth and improve load speeds.
- [ ] **Responsive Image Gallery Optimization**:
  - Review all sizes and loading priorities for the 6-image layout on `src/app/product/page.js`.
  - Enable Next.js native lazy loading for images that are not immediately in the viewport.

### Phase 4: Checkout & Order Security
- [ ] **Validate Billing & Shipping Fields**:
  - Add robust field checks (correct zip-codes, phone format, empty address detection) to checkout/cart forms.
- [ ] **Cart State Reliability**:
  - Ensure that adding/removing items in the cart updates the badge counts in header/nav on both mobile and desktop without layout shifts.

### Phase 5: Browser Compatibility & Stress Testing
- [ ] **Hydration Diagnostics**:
  - Double check console logs during production run (`npm run build` and `npm start`) to guarantee no active hydration mismatches.
- [ ] **Safari & Mobile Layout Verification**:
  - Verify styling layouts for the 6-image carousel on Apple devices and mobile webviews (checking flex-basis, aspect ratio, and sticky sidebars).
- [x] **Extreme Load Stress Test**:
  - Test cart with 20+ items, check for local storage capacity boundaries, and confirm fallback states when API keys are missing.

---

## Completed Milestones (Sync Record)

### Milestone 3: High-Fidelity Neumorphic Sliding Theme Switch
*   **Location**: Mobile and Desktop views inside [Navbar.js](file:///d:/SULEMAN/website/reenat-next/src/components/Navbar.js#L42-L51)
*   **Details**: Implemented a realistic curved track with inset neumorphic shadows, recessed background Sun/Moon icons, and a sliding circular white knob that shifts 38px smoothly when toggling themes. Supports full CSS transitions.

### Milestone 4: E-Commerce Compliance Policy Routes
*   **New Routes Created**:
    *   [Shipping Policy](file:///d:/SULEMAN/website/reenat-next/src/app/shipping-policy/page.js) (dispatch timelines, free shipping, COD collect fees)
    *   [Refund Policy](file:///d:/SULEMAN/website/reenat-next/src/app/refund-policy/page.js) (7-day window, unwashed condition rules, bank details transfer timelines)
    *   [Privacy Policy](file:///d:/SULEMAN/website/reenat-next/src/app/privacy-policy/page.js) (data handling, SSL verification, shipping sharing)
    *   [Terms of Service](file:///d:/SULEMAN/website/reenat-next/src/app/terms/page.js) (store use guidelines, handloom texture properties)
    *   [Returns & Exchanges](file:///d:/SULEMAN/website/reenat-next/src/app/returns/page.js) (how to initiate reverse pickup)
*   **Footer Links**: Linked all compliance routes inside the site footer navigation list inside [Footer.js](file:///d:/SULEMAN/website/reenat-next/src/components/Footer.js).

### Milestone 5: Shiprocket Fastrr Checkout API & SDK Integration
*   **Credentials Saved**: Added `SHIPROCKET_MERCHANT_API_KEY` and `SHIPROCKET_MERCHANT_SECRET_KEY` inside `.env.local`.
*   **Backend Token Route** (`/api/checkout/token`): Programmatically formats cart data, signs payloads using the Secret Key via HMAC-SHA256, and fetches Fastrr session tokens.
*   **Webhook Route** (`/api/shiprocket/webhook/order`): Receives transactional order updates, verifies HMAC signatures, and writes new orders and customer profiles to Supabase.
*   **Frontend SDK Launcher** (`/cart`): Loads Fastrr SDK via `<Script>` and triggers checkout on Proceed click, with a fail-safe fallback to the standard form modal if the SDK script is blocked.


