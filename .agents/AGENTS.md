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
