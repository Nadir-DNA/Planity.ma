# Planity.ma — QA Report v2 (Security Remediation Status)

**Generated:** 2026-04-30  
**Previous Report:** qa-report.md (17 issues: 4 Critical, 5 High, 5 Medium, 3 Low)  
**Scope:** Verification of 6 applied security fixes against original QA findings

---

## Executive Summary

Of the **17 issues** identified in the original QA audit, **6 security fixes** have been applied. All 4 Critical issues are now resolved. Two High-severity issues were also addressed (HIGH-03 and HIGH-04). The remaining **11 issues** are partially or fully outstanding — including HIGH-01 (secrets exposure), HIGH-02 (CSRF), and HIGH-05 (silent rate-limit bypass), plus all Medium and Low items.

**Fix Rate:** 6/17 (35%) — All Critical issues resolved. Production deployment remains blocked by 2 High-severity items.

---

## ✅ Fixed Issues (6/17)

### CRIT-01: GET /api/v1/bookings no longer exposes user data without authentication ✅ FIXED

**File:** `src/app/api/v1/bookings/route.ts` (L10–69)

**What was fixed:**
- Authentication is now required via `getUser()` — returns 401 if unauthenticated
- The `userId` query parameter is no longer accepted from clients
- Booking queries are scoped to the authenticated user's own ID: `.eq("userId", user.id)`
- PII stripping added: response removes embedded `user` objects from booking results (L53)

**Verification:** The `GET` handler wraps everything in an auth check. Client-supplied `userId` is ignored. The query uses `user.id` from the session. PII is stripped before returning.

**Residual concern:** Line 53 destructures `{ user: _u, ...rest }` which only strips top-level `user` key. Nested user data within `items` or `salon` relations could still leak PII in edge cases. Recommend explicit field selection instead of broad `.select("*")`.

---

### CRIT-02: Public salon endpoints no longer leak owner PII ✅ FIXED

**Files:** `src/app/api/v1/salons/route.ts`, `src/app/api/v1/search/route.ts`

**What was fixed:**
- `stripSalonPII()` function introduced in both files, removing `ownerId` and `passwordHash` from salon objects before response
- Mock fallback in `/salons` no longer includes `phone`, `email`, or `ownerId` — explicit field mapping (L80–86)
- Mock fallback in `/search` delegates to `searchMockSalons()` which returns pre-filtered data

**Verification:** Both DB-path and mock-path responses strip sensitive fields. The explicit mock mapping is a good approach.

**Residual concern:** The DB query in `/salons` still uses `.select("id, name, slug, category, ...")` with explicit column listing, which is good but includes `staff:StaffMember(*)`. If staff members contain email/phone fields, those would still leak. Recommend reviewing nested relation selections.

---

### CRIT-03: Booking creation validates staff belongs to salon ✅ FIXED

**File:** `src/app/api/v1/bookings/route.ts` (L158–173)

**What was fixed:**
- After resolving staff assignments, the code now validates each `staffId` against the salon
- Checks that the staff member exists, belongs to `salonId`, and `isActive === true`
- Returns 400 error: `"Professionnel invalide pour ce salon"` if validation fails

**Verification:** The validation loop iterates over `resolvedServices` and queries `StaffMember` with both `id` and `salonId` constraints. This prevents cross-salon booking injection.

**Residual concern:** The `services` validation at L97–109 uses `.in("id", serviceIds).eq("salonId", salonId)`, which is correct. However, the `notes` field (L256) is still stored without sanitization (see MED-02).

---

### CRIT-04: Booking cancellation and rescheduling authorization is now consistent ✅ FIXED

**File:** `src/app/api/v1/bookings/[id]/route.ts` (PATCH L38–53, PUT L151–166)

**What was fixed:**
- Both PATCH (cancel) and PUT (reschedule) now allow the booking owner OR the salon owner
- PATCH: checks `booking.userId !== user.id`, then falls back to salon ownership query
- PUT: same dual-authorization pattern with explicit 403 response
- The DELETE handler in `/bookings/route.ts` also uses this same pattern consistently
- Added `cancelledBy: user.id` field for audit tracking in PATCH (L68)

**Verification:** Authorization logic is now unified across all booking mutation endpoints — both cancel and reschedule support owner + salon-owner access. The `cancelledBy` field provides audit information.

**Residual concern:** No audit log table for cancellation events. Consider adding a `BookingAudit` table for compliance.

---

### HIGH-03: Login endpoint no longer leaks internal error details ✅ FIXED

**File:** `src/app/api/v1/auth/login/route.ts` (L94–101)

**What was fixed:**
- The catch block now returns `{ error: "Erreur interne du serveur" }` with status 500
- The `details: message` field has been removed entirely
- Error is still logged server-side with `console.error("Login error:", message)` (L96)

**Verification:** No `details` field in error responses. Server-side logging preserved for debugging.

---

### HIGH-04: Pro API endpoints now have role-based access control ✅ FIXED

**Files:** `src/app/api/v1/pro/stats/route.ts`, `pro/bookings/route.ts`, `pro/services/route.ts`, `pro/staff/route.ts`

**What was fixed:**
- All 4 pro endpoints now include explicit role check: `if (!["PRO_OWNER", "PRO_STAFF", "ADMIN"].includes(user.role))` returning 403
- Applied consistently to both GET and POST (where applicable) in each file
- Returns `{ error: "Accès réservé aux professionnels" }` with status 403

**Verification:** Every pro endpoint handler begins with auth + role check before any data access. A `CONSUMER` user gets 403 instead of 404.

**Residual concern:** `PRO_STAFF` users pass the role check but still get 404 since salon is queried by `ownerId: user.id`. Staff members don't own salons. See LOW-03.

---

## ❌ Unfixed Issues (11/17)

### HIGH-01: .env file with real secrets in repository 🔴 STILL CRITICAL

**Status:** NOT FIXED  
**File:** `.env` exists in working directory  
**Detail:** The `.env` file contains `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `AUTH_SECRET`. While `.gitignore` correctly lists `.env`, the file is present in the working directory, and there's no confirmation it was never committed to git history. All secrets should be rotated.

**Recommended action:**
1. Audit git history for `.env` commits: `git log --all --full-history -- .env`
2. Rotate ALL secrets immediately (Supabase keys, auth secret, Resend API key, DB password)
3. Use Vercel Environment Variables or a secret manager for production
4. Add `.env.example` with placeholder values for documentation

---

### HIGH-02: No CSRF protection on state-changing requests 🔴 HIGH

**Status:** NOT FIXED  
**Detail:** All POST, PUT, PATCH, and DELETE endpoints rely solely on Supabase session cookies for authentication. The middleware sets `X-Frame-Options: DENY` (mitigates clickjacking) but does not implement CSRF tokens. Login cookies are set with `sameSite: "lax"` (L81–90 of login route), which provides partial protection for GET but not for cross-site POST requests from top-level navigations.

**Attack vector:** A malicious site could submit forms on behalf of a logged-in user (e.g., cancel bookings, change password, delete account).

**Recommended action:**
- Implement CSRF token middleware (e.g., `next-safe-action` or double-submit cookie pattern)
- OR enforce `SameSite: Strict` on all auth cookies
- OR add `X-Requested-With` header requirement for all state-changing requests

---

### HIGH-05: Rate limiting silently bypassed when Upstash is unavailable 🟠 HIGH

**Status:** PARTIALLY FIXED  
**File:** `src/lib/rate-limit.ts` (L94–96)

**What changed:** A `console.warn("Upstash Redis credentials not configured - rate limiting disabled")` was added at line 14 when credentials are missing.

**Remaining issue:** When Redis is unavailable, `checkRateLimit()` returns `null` (meaning "allow"), effectively disabling all rate limiting silently. In production, this means:
- No 429 responses are ever sent
- Auth endpoints have no brute-force protection
- Public endpoints can be scraped without limits

**Recommended action:**
- In production (`NODE_ENV=production`), fail closed: return 503 if Redis is unavailable
- Add an in-memory rate limiter as fallback (e.g., `rate-limiter-flexible` with memory store)
- Alert on startup when Redis is not configured

---

### MED-01: Availability API does not require authentication 🟡 MEDIUM

**Status:** NOT FIXED (by design — intentionally public)  
**Detail:** `/api/v1/availability` remains public without rate limiting. The endpoint accepts arbitrary `salonId` values and can be used to enumerate all salon data.

**Recommended action:** Add rate limiting to this endpoint (it's currently covered by the middleware's generic `/api/v1/` limiter, but only when Upstash is available — see HIGH-05). Consider adding `salonId` validation.

---

### MED-02: Booking `notes` field not sanitized 🟡 MEDIUM

**Status:** NOT FIXED  
**File:** `src/app/api/v1/bookings/route.ts` (L256)  
**Detail:** `notes: notes || null` is stored as-is. No length limit, no HTML/JS stripping. While CSP headers mitigate some XSS risk, stored XSS in admin views and booking details is still possible.

**Recommended action:**
- Add max length validation (e.g., 500 chars)
- Strip HTML tags server-side (e.g., `sanitize-html` or simple regex)
- Add `DOMPurify` on the server for rendering admin booking views

---

### MED-03: Password change doesn't invalidate other sessions 🟡 MEDIUM

**Status:** NOT FIXED  
**File:** `src/app/api/v1/user/password/route.ts`  
**Detail:** After successfully changing the password (L80–83), only the password hash is updated. No call to `supabaseAdmin.auth.signOut()` or session rotation. Other devices remain logged in indefinitely.

**Recommended action:**
```typescript
// After updating password hash:
await supabaseAdmin.auth.admin.signOut(authUser.id); // Kill all sessions
// Or sign out all sessions except current
```

---

### MED-04: Account deletion soft-deletes but doesn't invalidate session 🟡 MEDIUM

**Status:** NOT FIXED  
**File:** `src/app/api/v1/user/account/route.ts`  
**Detail:** After soft-deletion (L31–39), the Supabase Auth session remains active. The user is redirected to `/connexion` client-side, but cookies persist. If the user navigates back, they may briefly appear logged in before the session refresh fails.

**Recommended action:**
```typescript
// After soft-delete, invalidate the session:
const accessToken = req.headers.get("authorization")?.replace("Bearer ", "");
if (accessToken) {
  await supabaseAdmin.auth.admin.signOut(accessToken);
}
// Also clear cookies in the response
```

---

### MED-05: Sticky "Continuer" button bypasses step validation 🟡 MEDIUM

**Status:** NOT FIXED  
**File:** `src/app/(marketplace)/reservation/[salonId]/page.tsx` (L590–597, L610–616)  
**Detail:** The main "Suivant" button (L548–551) correctly disables when `step === 0 && selectedServices.length === 0` or `step === 2 && (!selectedDate || !selectedTime)`. However, both sticky "Continuer" buttons:
- Desktop sticky (L590–597): `onClick={() => setStep(step + 1)}` — no disabled prop
- Mobile sticky (L610–616): `onClick={() => setStep(step + 1)}` — no disabled prop

Users can bypass the validation by clicking the sticky buttons.

**Recommended action:** Extract a `canProceed` function:
```typescript
const canProceed = (step === 0 && selectedServices.length === 0)
  ? false
  : (step === 2 && (!selectedDate || !selectedTime))
  ? false
  : true;

// Apply to all Navigation buttons:
<Button disabled={!canProceed} onClick={() => setStep(step + 1)}>Continuer</Button>
```

---

### LOW-01: Inconsistent error messages — mixed French and English 🟢 LOW

**Status:** NOT FIXED  
**Detail:** Error messages remain inconsistent. Examples found:
- `"bookingId requis"` (Fr/En mix)
- `"Donnees manquantes"` (missing accent on "Données")
- `"Non autorise"` (missing accent on "autorisé")
- Zod validation errors in English (register endpoint)

**Recommended action:** Create `src/lib/errors.ts` with a centralized error dictionary in French.

---

### LOW-02: No pagination in mes-rendez-vous page 🟢 LOW

**Status:** PARTIALLY ADDRESSED  
**Detail:** The GET `/api/v1/bookings` endpoint now supports `page` and `limit` parameters (L25–28), but the client page still doesn't pass these or display pagination controls. Users with >20 bookings won't see older ones.

**Recommended action:** Add pagination UI to the mes-rendez-vous page and fetch all pages or implement infinite scroll.

---

### LOW-03: PRO_STAFF dashboard access returns 404 🟢 LOW

**Status:** NOT FIXED  
**Detail:** `PRO_STAFF` role users pass the auth + role check (HIGH-04 fix) but all pro APIs query `Salon` by `ownerId: user.id`. A staff member doesn't own a salon, so they get `"Salon non trouvé"` (404) on every request.

**Recommended action:** Modify pro APIs to also look up the salon by staff membership:
```typescript
// First try owner, then staff membership
const salonQuery = supabaseAdmin.from("Salon").select("id")
  .eq("ownerId", user.id).maybeSingle();
// If null, try:
// .eq("staffMember.ownerId", user.id) via StaffMember relation
```

---

## 🔒 Security Headers Audit (Updated)

| Header | Value | Original Status | Current Status |
|--------|-------|----------------|----------------|
| X-Content-Type-Options | nosniff | ✅ Correct | ✅ Unchanged |
| X-Frame-Options | DENY | ✅ Correct | ✅ Unchanged |
| X-XSS-Protection | 1; mode=block | ⚠️ Deprecated | ⚠️ Unchanged |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ Correct | ✅ Unchanged |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | ✅ Good | ✅ Unchanged |
| Content-Security-Policy | Dynamic nonce-based | ✅ Good | ✅ Unchanged |
| Strict-Transport-Security | — | ❌ Missing | ❌ Still missing |
| X-RateLimit headers | On 429 responses | ✅ Present | ✅ Unchanged |

### Unresolved Security Header Gaps:

1. **Missing HSTS** — No `Strict-Transport-Security` header. Add `max-age=31536000; includeSubDomains; preload` in middleware.
2. **CSP `unsafe-inline` for styles** — Still required for Tailwind. Consider nonce-based `style-src` in production.
3. **CSP `connect-src` allows `https://api.resend.com`** — Should verify this is scoped to only the email-sending endpoint.
4. **No CSP for API routes** — `{pathname.startsWith("/api")}` check at L91 skips CSP entirely. API routes should at minimum set `Content-Type: application/json`.
5. **Nonce usage unclear** — `x-nonce` header set at L113 but no evidence of consumption in page `<script>` tags.

---

## 📊 Updated Test Coverage Matrix

| Route / Endpoint | Authentication | Authorization | RBAC | Input Validation | Error Handling | Verdict |
|---|---|---|---|---|---|---|
| POST /api/v1/auth/login | N/A (public) | N/A | N/A | ✅ Email+pass required | ✅ No details leak | ✅ PASS |
| POST /api/v1/auth/register | N/A (public) | N/A | N/A | ✅ Zod schema | ✅ Good | ✅ PASS |
| GET /api/v1/salons | N/A (public) | N/A | N/A | ✅ Params validated | ✅ Fallback | ✅ PASS (PII stripped) |
| GET /api/v1/search | N/A (public) | N/A | N/A | ✅ Params validated | ✅ Fallback | ✅ PASS (PII stripped) |
| GET /api/v1/availability | N/A (public) | N/A | N/A | ✅ salonId+date required | ✅ Good | ⚠️ No rate limiting |
| POST /api/v1/bookings | ✅ getUser() | ✅ Own bookings only | N/A | ⚠️ Notes not sanitized | ✅ | ⚠️ MED-02 open |
| GET /api/v1/bookings | ✅ getUser() | ✅ Own bookings only | N/A | ✅ Pagination | ✅ | ✅ PASS |
| PATCH /api/v1/bookings/[id] | ✅ getUser() | ✅ Owner OR salon owner | N/A | ✅ Status check | ✅ | ✅ PASS |
| PUT /api/v1/bookings/[id] | ✅ getUser() | ✅ Owner OR salon owner | N/A | ✅ Date validation | ✅ | ✅ PASS |
| DELETE /api/v1/bookings | ✅ getUser() | ✅ Owner OR salon owner | N/A | ✅ | ✅ | ✅ PASS |
| GET /api/v1/user/profile | ✅ getUser() | ✅ Self only | N/A | N/A | ✅ | ✅ PASS |
| PATCH /api/v1/user/profile | ✅ getUser() | ✅ Self only | N/A | ✅ Phone/name/locale | ✅ | ✅ PASS |
| PATCH /api/v1/user/password | ✅ getUser() | ✅ Self only | N/A | ✅ Strength validation | ✅ | ⚠️ No session invalidation |
| PATCH /api/v1/user/notifications | ✅ getUser() | ✅ Self only | N/A | ✅ Whitelist keys | ✅ | ✅ PASS |
| DELETE /api/v1/user/account | ✅ getUser() | ✅ Self only | N/A | ✅ Confirmation text | ⚠️ No session kill | ⚠️ MED-04 open |
| GET /api/v1/pro/stats | ✅ getUser() | ✅ Owner | ✅ Role check | N/A | ✅ | ✅ PASS |
| GET /api/v1/pro/bookings | ✅ getUser() | ✅ Owner | ✅ Role check | ✅ Date filters | ✅ | ✅ PASS |
| POST /api/v1/pro/services | ✅ getUser() | ✅ Owner | ✅ Role check | ⚠️ Minimal | ✅ | ⚠️ |
| POST /api/v1/pro/staff | ✅ getUser() | ✅ Owner | ✅ Role check | ⚠️ Minimal | ✅ | ⚠️ |

---

## 📋 Summary

| Severity | Original Count | Fixed | Remaining |
|----------|---------------|-------|-----------|
| 🔴 Critical | 4 | 4 | 0 |
| 🟠 High | 5 | 2 | 3 |
| 🟡 Medium | 5 | 0 | 5 |
| 🟢 Low | 3 | 0 | 3 |
| **Total** | **17** | **6** | **11** |

### Issues Fixed (6)
1. ✅ CRIT-01: Booking list auth — now requires authentication, scopes to own bookings
2. ✅ CRIT-02: Salon PII leak — `ownerId` and `passwordHash` stripped from responses
3. ✅ CRIT-03: Cross-salon staff validation — `staffId` now validated against salon
4. ✅ CRIT-04: Consistent booking authorization — cancel/reschedule both allow owner + salon owner
5. ✅ HIGH-03: Login error details — `details` field removed from error responses
6. ✅ HIGH-04: Pro API RBAC — role check added to all `/pro/*` endpoints

### Issues Still Open (11)
- 🔴 HIGH-01: Exposed `.env` secrets — rotate all keys immediately
- 🔴 HIGH-02: No CSRF protection — implement tokens or `SameSite: Strict`
- 🟠 HIGH-05: Rate limiting silently disabled — add fallback or fail-closed
- 🟡 MED-01: Availability API unauthenticated + no rate limit
- 🟡 MED-02: Booking `notes` not sanitized
- 🟡 MED-03: Password change doesn't invalidate sessions
- 🟡 MED-04: Account deletion doesn't sign out
- 🟡 MED-05: Reservation sticky button bypasses validation
- 🟢 LOW-01: Mixed French/English error messages
- 🟢 LOW-02: No pagination in client dashboard
- 🟢 LOW-03: PRO_STAFF gets 404 on all pro APIs

### Remaining Blockers for Production

**Must fix before deployment:**
1. **HIGH-01** — Rotate all secrets. Audit git history.
2. **HIGH-02** — Implement CSRF protection or enforce `SameSite: Strict`.

**Should fix before deployment:**
3. **HIGH-05** — Add rate-limit fallback or fail-closed behavior.
4. **MED-03** — Invalidate sessions after password change.
5. **MED-04** — Invalidate session after account deletion.