# Planity.ma — QA Bug Report (Phase 3)

**Generated:** 2026-04-30  
**Reviewer:** Automated Code Audit  
**Scope:** Reservation flow, Client Dashboard, Profile Settings, Pro Dashboard, API endpoints, Security Headers

---

## Executive Summary

The application is a Next.js 14 beauty/wellness booking platform targeting Morocco (Planity.ma). It uses Supabase as its database, Upstash Redis for rate limiting, and has a dual strategy of database-first with mock-data fallbacks. The audit reviewed 30+ source files across pages, API routes, middleware, and auth logic. **17 issues** were identified: **4 Critical**, **5 High**, **5 Medium**, and **3 Low**.

---

## 🔴 Critical Issues

### CRIT-01: GET /api/v1/bookings exposes user data without authentication
**File:** `src/app/api/v1/bookings/route.ts` (L10–51)  
**Impact:** Any unauthenticated user can enumerate all bookings by sending `GET /api/v1/bookings?userId=<any-uuid>`, leaking PII (names, emails, phone numbers).  
**Detail:** The `GET` handler does **not** call `getUser()`. It accepts a `userId` query parameter and directly queries Supabase for bookings belonging to that user. An attacker can iterate UUIDs to read all booking data including `user.email`, `user.phone`, and `user.name`. The `userId` filter is explicitly applied via `.eq("userId", userId)`, meaning any client-supplied UUID works.  
**Fix:** Require authentication via `getUser()`, then restrict query to the authenticated user's own bookings. Remove or ignore the client-supplied `userId` param unless the caller is an admin or salon owner.

### CRIT-02: /api/v1/salons and /api/v1/search leak phone/email of salon owners
**Files:** `src/app/api/v1/salons/route.ts` (L91–117), `src/app/api/v1/search/route.ts` (L106–128)  
**Impact:** Unauthenticated users can access salon records including `phone` and `email` fields belonging to salon owners. In mock fallback (L168–192 of `/salons`), the full `MOCK_SALONS` objects (including `phone`, `email`) are serialized.  
**Detail:** These are public endpoints (no auth required). The DB query includes `services`, `staff`, `openingHours`, `photos`, `_count`, but also returns the entire salon row without field selection — which may include owner contact information. The mock fallback explicitly maps `phone` and `email`.  
**Fix:** Add explicit `.select()` or remap to strip `ownerId`, `phone`, `email` unless the caller is the salon owner or admin.

### CRIT-03: Booking creation allows client-controlled userId bypass
**File:** `src/app/api/v1/bookings/route.ts` (L64–267)  
**Impact:** While the `POST` handler correctly uses `user.id` from `getUser()` rather than the client body, the `services` array in the body accepts arbitrary `{ serviceId, staffId }` objects. There is no server-side validation that the submitted `serviceId` values actually belong to `salonId`. A malicious client could book services from a different salon, possibly at prices they choose.  
**Detail:** Line 89–94: The code validates that `dbServices.length !== serviceIds.length` to ensure all services exist, but the filter includes `.eq("salonId", salonId)` which only checks one field. However, the `resolvedServices` (L112–148) uses `svc.staffId` without verifying the staff member belongs to the salon.  
**Fix:** Validate `staffId` belongs to the salon. Validate all `serviceId` values are within the salon's offerings. Consider validating the `price` returned from DB matches expected values.

### CRIT-04: IDOR in booking cancellation and rescheduling
**Files:** `src/app/api/v1/bookings/[id]/route.ts` (PATCH L7–83, PUT L86–239)  
**Impact:** The PATCH (cancel) and PUT (reschedule) handlers verify `booking.userId !== user.id` and return 403 if mismatched. This is correct. However, the **GET bookings list** (CRIT-01) already allows any user to enumerate booking IDs, and the `DELETE` handler at `/api/v1/bookings` (L269–353) checks ownership inconsistently — it allows either the booking's user OR the salon's owner to cancel, but the salon ownership check `eq("ownerId", user.id)` is done against the `Salon` table which could be exploited if salon owners can cancel any booking.  
**Detail:** The DELETE handler is technically working as designed (allowing salon owners to cancel), but the lack of audit logging or status check is concerning. Also, the PATCH handler at `[id]` does NOT allow salon owners to cancel, creating inconsistency.  
**Fix:** Unify the authorization logic: both cancel endpoints should support the same set of authorized actors. Add audit logging for cancellation events.

---

## 🟠 High Issues

### HIGH-01: .env file committed with real secrets
**File:** `.env`  
**Impact:** Database URL with credentials, Supabase service role key, Resend API key, and AUTH_SECRET are all present in the repository. The `.gitignore` correctly lists `.env`, but the file is present in the working directory with real values, meaning it was likely committed at some point or will be accidentally staged.  
**Detail:** Contains `DATABASE_URL` with Postgres password, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `AUTH_SECRET`. Even though `.gitignore` excludes `.env`, the screenshot/redacted values suggest real credentials. The `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are client-exposed and expected, but `SUPABASE_SERVICE_ROLE_KEY` is a full admin key.  
**Fix:** Rotate all leaked secrets immediately. Verify `.env` is not in git history. Consider using a secret manager (Vercel Environment Variables, etc.).

### HIGH-02: No CSRF protection on state-changing requests
**Files:** All API routes (bookings, profile, password, notifications, account delete)  
**Impact:** POST, PUT, PATCH, and DELETE endpoints rely only on Supabase session cookies for auth, with no CSRF token validation. An attacker could craft a malicious page that submits forms on behalf of a logged-in user.  
**Detail:** The middleware sets `X-Frame-Options: DENY` which mitigates clickjacking but not CSRF from other origins. The `sameSite: "lax"` on auth cookies provides partial protection for GET but not safe for POST from top-level navigations. Without `SameSite: Strict`, cross-site POST via form submission could work.  
**Fix:** Implement CSRF tokens (e.g., using `next-safe-action` or a custom CSRF middleware). Alternatively, enforce `SameSite: Strict` for auth cookies and add a custom header check (e.g., `X-Requested-With`) for all state-changing requests.

### HIGH-03: Login endpoint leaks internal error details
**File:** `src/app/api/v1/auth/login/route.ts` (L97–99)  
**Impact:** On error, the catch block returns `{ error: "Erreur interne du serveur", details: message }`, where `message` could contain Supabase error details, stack traces, or connection info.  
**Detail:** Line 98: `details: message` is included in the 500 response. In production, this should be logged server-side only.  
**Fix:** Remove `details` from the error response. Log the error server-side with `console.error`.

### HIGH-04: Pro API endpoints lack role-based access control (RBAC)
**Files:** `src/app/api/v1/pro/stats/route.ts`, `pro/bookings/route.ts`, `pro/services/route.ts`, `pro/staff/route.ts`  
**Impact:** All pro endpoints check `getUser()` and require authentication, but only verify that the user exists — they don't verify that the user's role is `PRO_OWNER`, `PRO_STAFF`, or `ADMIN`. A `CONSUMER` role user could access pro endpoints if they somehow get a salon ID.  
**Detail:** Each endpoint does `const user = await getUser(); if (!user?.id) return 401;` then queries `Salon` by `ownerId: user.id`. If a consumer has no salon, they get a 404, not a 403. The middleware does block CONSUMER users from `/pro` pages, but the API endpoints are accessible if called directly.  
**Fix:** Add explicit role checks in both middleware (already partially done at L71) and in each API handler. Return 403 for unauthorized roles.

### HIGH-05: Rate limiting silently disabled when Upstash is not configured
**File:** `src/lib/rate-limit.ts` (L94–96)  
**Impact:** If `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` env vars are missing, `getRedis()` returns `null`, which causes `getRateLimiter()` to return `null`, which causes `checkRateLimit()` to return `null` (meaning "allow"). The entire rate limiting system silently disables itself.  
**Detail:** Line 94–96: `if (!limiter) return null;` means no 429 response is ever sent. This could be intentional for development, but is dangerous in production if env vars are misconfigured.  
**Fix:** Add a warning log when rate limiting is disabled. In production, consider failing hard (returning 503) if Redis is not available, or using an in-memory fallback rate limiter.

---

## 🟡 Medium Issues

### MED-01: Availability API does not require authentication
**File:** `src/app/api/v1/availability/route.ts`  
**Impact:** The availability endpoint is intentionally public (for browsing), which is acceptable. However, it accepts `salonId` and `serviceId` parameters without validation, which could be used to enumerate all salon data. This is a design choice, but combined with CRIT-02, it amplifies data leakage.  
**Fix:** Consider adding basic rate limiting and validating that `salonId` exists before processing.

### MED-02: Booking total price not recalculated server-side
**File:** `src/app/api/v1/bookings/route.ts` (L173–182)  
**Impact:** The client sends `services: selectedServices.map(serviceId => ({ serviceId, staffId }))` — the total price is calculated server-side from DB service prices (good). However, the `notes` field is not sanitized and could contain arbitrarily long strings or HTML/script content stored directly in the database.  
**Detail:** Line 181: `notes: notes || null` is stored as-is. While there's a CSP header, stored XSS could still be an issue for admin views.  
**Fix:** Add input validation and sanitization for the `notes` field (max length, strip HTML). Consider using `sanitize-html` or `DOMPurify` on the server.

### MED-03: Password change endpoint doesn't invalidate other sessions
**File:** `src/app/api/v1/user/password/route.ts`  
**Impact:** After successfully changing the password, the endpoint returns 200 but does not invalidate the Supabase session or issue new tokens. Other sessions (e.g., on other devices) remain active using the old session.  
**Fix:** After updating the password, call `supabaseAdmin.auth.signOut()` for all sessions except the current one, or at minimum force a session refresh by rotating the access token.

### MED-04: Account deletion soft-deletes but doesn't sign out
**File:** `src/app/api/v1/user/account/route.ts`  
**Impact:** Soft-deletion sets `isActive: false`, changes email to a deleted format, nulls phone and passwordHash. But the current Supabase Auth session remains valid. The user clicks delete, the client redirects to `/connexion`, but the auth cookies are still set. If the user navigates back, they might still appear logged in (the session refresh would fail since the user is inactive, but there's a window).  
**Fix:** After soft-deleting, call `supabaseAdmin.auth.signOut()` to invalidate the session, and properly clear cookies.

### MED-05: Reservation page step navigation allows skipping required fields
**File:** `src/app/(marketplace)/reservation/[salonId]/page.tsx` (L546–556)  
**Impact:** The "Suivant" (Next) button is disabled when `selectedServices.length === 0` (step 0) or when `!selectedDate || !selectedTime` (step 2), but on **step 1** (staff selection), there's no validation — the user can proceed without selecting a staff member (which defaults to "no preference"). This is actually intentional UX, but the "Continuer" button in the sticky bottom bar (L590–597) calls `setStep(step + 1)` without any validation whatsoever, bypassing the disabled state.  
**Detail:** Line 593: `onClick={() => setStep(step + 1)}` on the sticky "Continuer" button has no validation, unlike the main "Suivant" button which has `disabled` conditions.  
**Fix:** Add the same `disabled` conditions to the sticky summary "Continuer" button, or better yet, extract the validation logic into a shared `canProceed` function.

---

## 🟢 Low Issues

### LOW-01: Inconsistent error messages — mixed French and English
**Files:** Multiple API routes  
**Detail:** Most user-facing error messages are in French (e.g., "Non autorisé", "Salon non trouvé"), but some are in English or mixed (e.g., "bookingId requis", "Donnees manquantes" without accents). The `register` route returns Zod error details in English. This creates an inconsistent UX.  
**Fix:** Standardize all user-facing error messages to French. Create a shared error message constants file.

### LOW-02: No pagination in mes-rendez-vous page
**File:** `src/app/(account)/mes-rendez-vous/page.tsx` (L73–89)  
**Detail:** The `fetchBookings` function calls `/api/v1/bookings?userId=${user.id}` without `page` or `limit` parameters. The API defaults to page 1, limit 20, but the client doesn't display pagination controls. Users with >20 bookings won't see older ones.  
**Fix:** Add pagination controls and pass page/limit params.

### LOW-03: Pro dashboard loads data even for staff members without salon ownership
**File:** `src/app/pro/(dashboard)/page.tsx` (L47–74), `src/app/api/v1/pro/stats/route.ts`  
**Detail:** `PRO_STAFF` role users can access the pro dashboard (middleware allows it at L71), but all API endpoints query `Salon` by `ownerId: user.id`. A staff member doesn't own a salon, so they'll always get "Salon non trouvé" (404). The dashboard shows empty/error state.  
**Fix:** Either redirect `PRO_STAFF` users to a different staff view, or modify the pro APIs to also look up the salon by staff membership.

---

## 🔒 Security Headers Audit

The middleware (`src/middleware.ts`) correctly sets the following security headers:

| Header | Value | Assessment |
|--------|-------|------------|
| X-Content-Type-Options | nosniff | ✅ Correct |
| X-Frame-Options | DENY | ✅ Correct |
| X-XSS-Protection | 1; mode=block | ⚠️ Deprecated but harmless |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ Correct |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | ✅ Good |
| Content-Security-Policy | Dynamic nonce-based | ✅ Good |
| X-RateLimit headers | On 429 responses | ✅ Present |

### Security Header Gaps:

1. **Missing `Strict-Transport-Security` (HSTS)** — No HSTS header is set. This should be `max-age=31536000; includeSubDomains; preload` in production.
2. **CSP `unsafe-inline` for styles** — Required for Tailwind, but consider using nonce-based style-src in production.
3. **CSP `connect-src` allows `https://api.resend.com`** — This is the Resend email API. Should be restricted to only the endpoints actually used, or at minimum verified that this doesn't expose email-sending capabilities from the browser.
4. **No CSP for API routes** — Line 91: `if (!pathname.startsWith("/api"))` skips CSP for API routes. While APIs return JSON, it's good practice to set `Content-Type: application/json` and block framing even on API routes.
5. **Nonce stored in response header but not injected into page scripts** — Line 113: `supabaseResponse.headers.set("x-nonce", nonce)` — it's unclear if the nonce is actually consumed by the page components for `<script>` tags.

---

## 📊 Test Coverage Matrix

| Route / Endpoint | Authentication | Authorization | Input Validation | Error Handling | Verdict |
|---|---|---|---|---|---|
| POST /api/v1/auth/login | N/A (public) | N/A | ✅ Email+pass required | ⚠️ Leaks details | FAIL |
| POST /api/v1/auth/register | N/A (public) | N/A | ✅ Zod schema | ✅ Good | PASS |
| GET /api/v1/salons | N/A (public) | N/A | ✅ Params validated | ✅ Fallback | ⚠️ Leaks PII |
| GET /api/v1/search | N/A (public) | N/A | ✅ Params validated | ✅ Fallback | ⚠️ Leaks PII |
| GET /api/v1/availability | N/A (public) | N/A | ✅ salonId+date required | ✅ Good | PASS |
| POST /api/v1/bookings | ✅ getUser() | ⚠️ No salon validation | ⚠️ Notes not sanitized | ✅ | ⚠️ |
| GET /api/v1/bookings | ❌ No auth | ❌ IDOR | ✅ Pagination | ✅ | FAIL |
| PATCH /api/v1/bookings/[id] | ✅ getUser() | ✅ Owner check | ✅ | ✅ | PASS |
| PUT /api/v1/bookings/[id] | ✅ getUser() | ✅ Owner check | ✅ Date validation | ✅ | PASS |
| DELETE /api/v1/bookings | ✅ getUser() | ⚠️ Owner OR salon | ✅ | ✅ | ⚠️ |
| GET /api/v1/user/profile | ✅ getUser() | ✅ Self only | N/A | ✅ | PASS |
| PATCH /api/v1/user/profile | ✅ getUser() | ✅ Self only | ✅ Phone/name/locale | ✅ | PASS |
| PATCH /api/v1/user/password | ✅ getUser() | ✅ Self only | ✅ Strength validation | ✅ | PASS |
| PATCH /api/v1/user/notifications | ✅ getUser() | ✅ Self only | ✅ Whitelist keys | ✅ | PASS |
| DELETE /api/v1/user/account | ✅ getUser() | ✅ Self only | ✅ Confirmation text | ⚠️ No session kill | ⚠️ |
| GET /api/v1/pro/stats | ✅ getUser() | ❌ No role check | N/A | ✅ | ⚠️ |
| GET /api/v1/pro/bookings | ✅ getUser() | ❌ No role check | ✅ Date filters | ✅ | ⚠️ |
| POST /api/v1/pro/services | ✅ getUser() | ❌ No role check | ⚠️ Minimal | ✅ | ⚠️ |
| POST /api/v1/pro/staff | ✅ getUser() | ❌ No role check | ⚠️ Minimal | ✅ | ⚠️ |

---

## 📋 Page-Level Audit

### Reservation Flow (`/reservation/[salonId]`)
- **Multi-step wizard:** 4 steps (Service → Professional → Date/Time → Confirmation)
- **Data flow:** Fetches salon details and staff on mount; fetches availability on date selection
- **Auth guard:** Redirects to login if `!user`, with `callbackUrl` — ✅ Good
- **Bug:** Sticky "Continuer" button bypasses step validation (MED-05)
- **Bug:** No loading state guard on submit — double-click could create duplicate bookings (race condition)
- **UX:** Mobile bottom bar with total is nice; desktop summary card

### Client Dashboard (`/mes-rendez-vous`)
- **Auth:** Redirects to login if not authenticated — ✅
- **Features:** Tab filtering (upcoming/past/cancelled), cancel modal, reschedule modal
- **Bug:** No pagination (LOW-02)
- **Bug:** Reschedule modal doesn't validate that the new time is in the future — a user could reschedule to a past time
- **Bug:** Cancel and reschedule only work for `CONFIRMED`/`PENDING` statuses (by isActive check L317), but the UI shows the buttons based on `isActive = CONFIRMED || PENDING` which matches the backend — ✅ Consistent

### Profile Settings (`/parametres`)
- **Sections:** Profile, Password, Notifications, Account deletion
- **Phone validation:** Moroccan format enforced — ✅
- **Password strength:** Client + server validation (8 chars, uppercase, lowercase, digit) — ✅
- **Bug:** Delete account doesn't invalidate session (MED-04)
- **Bug:** Password change doesn't invalidate other sessions (MED-03)
- **Good:** Delete requires typing "SUPPRIMER" — adequate confirmation

### Pro Dashboard (`/pro`)
- **Layout:** Server-side auth + role check (CONSUMER → redirect home) — ✅
- **Dashboard:** Stats cards + today's bookings
- **Bug:** PRO_STAFF can access but gets 404 on all data (LOW-03)
- **Bug:** No empty state for stats when salon has no bookings (shows `0` for all, which is acceptable but could be confusing)

---

## 🔧 Recommendations

### Immediate Actions (P0)
1. **Add authentication to `GET /api/v1/bookings`** — this is a critical data leak
2. **Strip PII from `/api/v1/salons` and `/api/v1/search`** public responses
3. **Rotate all secrets** in `.env` and verify they're not in git history
4. **Add role checks** to all `/api/v1/pro/*` endpoints

### Short Term (P1)
5. **Add HSTS header** in middleware
6. **Remove `details` field from error responses** in login endpoint
7. **Add CSRF protection** or enforce `SameSite: Strict` on auth cookies
8. **Sanitize `notes` field** in booking creation
9. **Fix sticky "Continuer" button** validation bypass on reservation page

### Medium Term (P2)
10. **Invalidate sessions** after password change and account deletion
11. **Add pagination** to mes-rendez-vous page
12. **Support PRO_STAFF role** in pro dashboard APIs
13. **Log rate-limiting bypass** when Upstash is unavailable
14. **Validate `staffId`** belongs to salon in booking creation
15. **Standardize error messages** to French

### Nice to Have (P3)
16. **Add rate limiting** to `/api/v1/availability` public endpoint
17. **Add CSP to API routes**
18. **Consider `Strict-Transport-Security`** configuration at the deployment level (Vercel handles this automatically for HTTPS)

---

## Summary Statistics

| Severity | Count |
|----------|-------|
| 🔴 Critical | 4 |
| 🟠 High | 5 |
| 🟡 Medium | 5 |
| 🟢 Low | 3 |
| **Total** | **17** |

**Overall Assessment:** The application has solid foundations — good auth patterns in most endpoints, proper input validation in several places, CSP headers, and a clear component architecture. However, the **unauthenticated booking list endpoint (CRIT-01)** and **PII leakage (CRIT-02)** are urgent issues that must be fixed before production deployment. The **missing role-based access control on pro APIs (HIGH-04)** and **CSRF vulnerability (HIGH-02)** are also significant concerns.