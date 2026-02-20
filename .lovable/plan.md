

# Fix Website Flows and Remove Errors

## Issues Found

### 1. Auth Loading State Stuck (Critical)
The `/account` page shows "Loading..." indefinitely. The `AuthContext` has a race condition where both `onAuthStateChange` and `initializeAuth` compete to set `loading` to `false`. When `onAuthStateChange` fires first (with an existing session), it calls `checkAdmin` which queries `user_roles`. If this query is slow or the listener fires before `initializeAuth`, the `loading` state can get stuck because `setLoading(false)` in `initializeAuth`'s `finally` block may run before the auth state change listener resolves.

**Fix:** Restructure AuthContext to use a single initialization flow. Set `loading` state based on `getSession()` only, and make `onAuthStateChange` handle subsequent changes without double-setting loading. Add a safety timeout fallback.

### 2. CartDrawer Uses `window.location.href` for Checkout Navigation
In `CartDrawer.tsx` line 14, `handleCheckout` uses `window.location.href = "/checkout"` which causes a full page reload, losing app state (including auth session temporarily). This should use React Router's `useNavigate`.

**Fix:** Replace `window.location.href` with `useNavigate()` from React Router.

### 3. Guest Orders Not Viewable
Guest orders (where `user_id` is null) cannot be viewed later since the RLS policy on `orders` requires `user_id = auth.uid()`. Guests can insert but never view their orders, which means the order confirmation page shows a random order number with no way to track it.

**Fix:** This is acceptable for now since guest checkout is intentionally limited. The order confirmation already shows the order ID.

### 4. Checkout Page Missing `placingOrder` Loading State on Button
The "Place Order" button doesn't show a disabled/loading state while the order is being placed, allowing double-clicks.

**Fix:** Add `disabled={placingOrder}` to the submit button and show loading text.

### 5. `container-tight` Class May Not Exist
Multiple pages use `container-tight` class which may not be defined in the CSS.

**Fix:** Verify and add if missing in `index.css`.

---

## Technical Implementation

### File: `src/context/AuthContext.tsx`
- Restructure the `useEffect` to prevent double-loading race condition
- Keep `onAuthStateChange` listener setup BEFORE `getSession()` (per Supabase best practices)
- Remove duplicate `setLoading(false)` calls by only setting it once in `initializeAuth`
- Add a safety timeout (5 seconds) to prevent infinite loading

### File: `src/components/CartDrawer.tsx`
- Import `useNavigate` from react-router-dom
- Replace `window.location.href = "/checkout"` with `navigate("/checkout")`

### File: `src/pages/CheckoutPage.tsx`
- Add `disabled={placingOrder}` and loading text to the "Place Order" button
- Add form validation to ensure shipping fields are filled before allowing payment step

### File: `src/index.css`
- Verify `container-tight` class exists; add it if missing

### File: `src/pages/AccountPage.tsx`
- Add a safety check: if `authLoading` takes longer than 5 seconds, force-show auth page redirect

All changes are focused on fixing the auth loading bug, improving navigation stability, and preventing double-submission on checkout.

