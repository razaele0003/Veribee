# Veribee QA Multi-User Test Suite

**Version 1.0 | Automated End-to-End Testing**

---

## Overview

This Playwright test suite provides **automated end-to-end testing** of the Veribee Delivery app across all three user roles:

- 🏪 **Seller** — Submit products for authentication (SUBMIT stage)
- 🛍 **Buyer** — Browse verified listings & purchase with assurance (ASSURE stage)
- 🏍 **Rider** — Accept & deliver orders with OTP handover (ASSURE delivery)

**Workflow Compliance:** Every test is mapped to **workflow.md** stages:
1. **SUBMIT** — Seller uploads product + authentication evidence
2. **AUTHENTICATE** — Backend AI Scanner + VSI evaluation (auto-mocked)
3. **ASSURE** — Buyer sees verified badge + Rider completes OTP handover

**QA Test Plan Alignment:** Tests are derived from [Veribee_QA_TestPlan.md](../Veribee_QA_TestPlan.md) and verify all buttons, navigation, and user interactions across 8 phases.

---

## Test Structure

```
PHASE 1 — AUTH FLOW
  A-003: Login for all three roles

PHASE 2 — SELLER FLOW (SUBMIT)
  B-001: Dashboard + Add Product button
  B-002: 3-step product form (Step 1 → Step 2 → Step 3)
  B-004: Products inventory list with filters
  B-005: VSI Score breakdown screen

PHASE 2b — AUTHENTICATE (Backend/Reviewer)
  B-003: Auth status screen (pending → verified → rejected)

PHASE 3 — BUYER FLOW (ASSURE)
  C-001: Home feed + category filters
  C-002: Product detail + verification badge (Auth Report modal)
  C-003: Shopping cart + quantity controls
  C-004: Checkout with payment selection
  C-005: Order tracking (real-time readiness)
  C-006: Dispute filing (assurance fallback)

PHASE 4 — RIDER FLOW (ASSURE Delivery)
  D-001: Job feed + online toggle
  D-002: Navigation to pickup (map + location broadcast)
  D-003: Pickup confirmation checklist
  D-004: Navigation to delivery (real-time tracking)
  D-005: OTP entry for handover completion
  D-006: Earnings screen + tab filters

PHASE 7 — PROFILES & ROLE SWITCHING
  G-001: All role profiles (Buyer, Seller, Rider)
  G-002: Role switcher bottom sheet

FINAL REPORT
  Automated summary with pass/fail rates by role and workflow stage
```

---

## Quick Start

### Option 1: Automated Run (Recommended)

Simply double-click:
```
run-qa-multiuser-tests.bat
```

This will:
1. ✓ Install Playwright + Chromium (if needed)
2. ✓ Start Expo web on http://localhost:8084
3. ✓ Run all test suites (5–10 minutes)
4. ✓ Generate HTML report + JSON results
5. ✓ Auto-open report in browser

### Option 2: Manual Run

```bash
cd veribee/

# Install dependencies (one-time)
npm install --save-dev @playwright/test
npx playwright install chromium

# Start Expo web
npm run web -- --port 8084

# In another terminal, run tests
npx playwright test veribee_qa_multiuser.spec.ts --config=playwright.qa-multiuser.config.ts

# View report
start qa-multiuser-report/index.html
```

---

## Test Accounts

The suite uses three pre-configured test accounts (seed these in Supabase before running):

| Role | Phone | Password | Active Role |
|---|---|---|---|
| Seller | 9170000001 | Test@12345 | seller |
| Buyer | 9170000002 | Test@12345 | buyer |
| Rider | 9170000003 | Test@12345 | rider |

**Setup:**
1. Go to Supabase dashboard
2. Under `auth` → `Users`, create these three accounts with the above credentials
3. For each, create rows in:
   - `seller_profiles` (if seller role)
   - `rider_profiles` with `kyc_status = 'approved'` (if rider role)
4. Pre-seed at least 1 verified product in `products` table

---

## Workflow.md Mapping

Every test is tagged with its workflow stage:

| Stage | What It Tests | Key Files |
|---|---|---|
| **SUBMIT** | Seller uploads product + evidence (Steps 1→2→3) | `add-product/step1.tsx`, `step2-auth.tsx`, `step3-review.tsx` |
| **AUTHENTICATE** | Backend evaluation (mocked as instant in Phase 1) | `auth-status/[id].tsx`, `auth_jobs` table |
| **ASSURE** | Buyer sees verified badge + Rider OTP handover | `product/[id].tsx` (auth modal), `otp-entry.tsx` |

### Example: The ASSURE Bridge

When a buyer places an order (C-004), the test verifies:
- ✓ Order created with `status = 'pending'`
- ✓ Delivery record created
- ✓ Buyer navigates to order tracking
- ✓ OTP placeholder visible (ready for rider)

Later, when rider arrives (D-004), the test checks:
- ✓ Rider can enter OTP
- ✓ Confirmation triggers delivery complete
- ✓ Buyer sees order as delivered (real-time)

---

## Button Coverage

The suite tests **100+ button interactions** across all screens:

### By Type
- **Navigation:** Back arrows, tab switching, link taps
- **Forms:** Input fields, select dropdowns, photo uploads, checkboxes
- **Modals:** Close buttons (X), sheet swipe-down, overlay tap-outside
- **Action:** Submit, Publish, Confirm, Place Order, Accept Job, etc.
- **Toggles:** Online/offline, payment method, filters, role switcher

### By Role
- **Seller (35+ buttons):** Add, Edit, Delete, Filter, Switch role
- **Buyer (40+ buttons):** Browse, Filter, Cart, Checkout, Rate, Dispute
- **Rider (25+ buttons):** Online, Accept, Navigate, Confirm, OTP entry

---

## Artifacts & Reports

After each run, the suite generates:

```
qa-multiuser-artifacts/
  ├── 01-seller-dashboard.png
  ├── 01-buyer-home.png
  ├── 01-rider-job-feed.png
  ├── 02-step1-basic-form.png
  ├── 02-step2-auth-form.png
  ├── 02-step3-review-form.png
  ├── 03-product-detail.png
  ├── 03-auth-report-modal.png
  ├── 03-order-tracking-detail.png
  ├── 04-otp-entry.png
  └── ... (80+ screenshots)

qa-multiuser-report/
  └── index.html (interactive HTML report)

qa-multiuser-results.json (machine-readable results)
```

### Report Contents

The HTML report shows:
- ✓ Overall pass/fail rate by role
- ✓ Breakdown by workflow stage (SUBMIT, AUTHENTICATE, ASSURE)
- ✓ Detailed test results with screenshots
- ✓ Error traces for failed buttons
- ✓ Duration and performance metrics

---

## What Gets Tested

### ✓ Functionality
- [ ] All button clicks are responsive
- [ ] Navigation flows correctly (no dead links)
- [ ] Forms accept input and validate
- [ ] Modals open/close cleanly
- [ ] Real-time updates propagate (deliveries)

### ✓ Workflow Compliance
- [ ] Seller SUBMIT step 1→2→3 progression
- [ ] Product enters `pending` auth status
- [ ] Buyer can see verified badge
- [ ] Rider can accept job and navigate
- [ ] OTP handover completes delivery

### ✓ Data Integrity
- [ ] Orders saved to Supabase
- [ ] Deliveries linked to orders
- [ ] Earnings recorded for rider
- [ ] VSI score updates (mock)
- [ ] Disputes create new rows

### ✓ User Flows
- [ ] Multi-role login/logout
- [ ] Role switching
- [ ] Profile editing
- [ ] Order history
- [ ] Real-time location broadcast (readiness check)

---

## What Does NOT Get Tested

❌ **Not Covered (by design for Phase 1):**
- Actual AI Scanner integration (mocked)
- Real OTP generation/SMS
- Firebase FCM push notifications
- Google OAuth login
- Payment gateway (GCash, COD, credit card)
- Biometric unlock (OTP only for Phase 1)
- Image storage (CloudFront, etc.)
- Map tiles beyond OpenStreetMap (Mapbox, etc.)

These are integration points tested manually in Phase 2/3 or via separate integration test files.

---

## Common Issues & Fixes

### Issue: "Cannot find Chromium browser"
**Fix:**
```bash
npx playwright install chromium
```

### Issue: "Port 8084 already in use"
**Fix:**
```bash
# Kill the process on port 8084
netstat -ano | findstr :8084
taskkill /PID <PID> /F

# Or use a different port
npm run web -- --port 8085
# Then update playwright.qa-multiuser.config.ts baseURL
```

### Issue: "Test accounts not logging in"
**Fix:**
1. Verify accounts exist in Supabase `auth.users`
2. Check password hash is correct
3. Confirm accounts have roles in `public.users` table:
   ```sql
   SELECT id, email, roles FROM public.users WHERE phone IN ('9170000001', '9170000002', '9170000003');
   ```
4. Re-run test

### Issue: "Tests timeout on navigation"
**Fix:**
- Increase timeouts in `playwright.qa-multiuser.config.ts` (currently 90s per test)
- Check Expo build for errors: `npm run web`
- Verify database connectivity

---

## Extending the Test Suite

### Add a New Test

```typescript
test.describe('PHASE X — NEW FLOW', () => {
  let page: Page;

  test.beforeAll(async ({ context }) => {
    page = await context.newPage();
    await login(page, TEST_ACCOUNTS.seller); // or buyer/rider
  });

  test('NEW-001: Your test name', async () => {
    console.log('\n=== YOUR SECTION ===\n');
    
    // Navigate
    await page.goto(`${BASE_URL}/seller/your-screen`);
    await takeScreenshot(page, 'XX-your-screenshot');

    // Test a button
    await testButton(
      page,
      'button:has-text("Your Button")',
      'Your Button Label',
      'Expected action on click',
      'seller', // role
      'YOUR_STAGE', // workflow stage
      'Your Screen Name'
    );
  });
});
```

### Add a New Account Role

Update `TEST_ACCOUNTS` in `veribee_qa_multiuser.spec.ts`:
```typescript
const TEST_ACCOUNTS = {
  // ... existing
  support_admin: { phone: '9170000099', password: 'Test@12345', role: 'support_admin' },
};
```

Then add tests in a new describe block (Phase 9+).

---

## Performance & Scalability

**Current Setup:**
- **Workers:** 1 (sequential, to avoid account conflicts)
- **Duration:** ~5–10 minutes for full suite
- **Memory:** ~300MB per test
- **Network:** ~50MB (screenshots + video)

**To Scale:**
- Increase `workers` in config (need unique test accounts per worker)
- Use Playwright Cloud (GitHub Actions, etc.)
- Split into smaller suites (seller, buyer, rider each separate)

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Veribee QA Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start Expo server
        run: npm run web -- --port 8084 &
      
      - name: Wait for server
        run: sleep 10
      
      - name: Run QA tests
        run: npx playwright test veribee_qa_multiuser.spec.ts --config=playwright.qa-multiuser.config.ts
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: qa-report
          path: qa-multiuser-report/
```

---

## Support

**Questions or issues?**
- Check `qa-multiuser-report/` for detailed failures
- Review test code comments in `veribee_qa_multiuser.spec.ts`
- Re-run with `--debug` flag: `npx playwright test --debug`
- Enable video recording for playback

---

## Version History

| Version | Date | Notes |
|---|---|---|
| 1.0 | Phase 1 Launch | Initial multi-user suite covering SUBMIT → AUTHENTICATE → ASSURE |

---

**Last Updated:** April 30, 2026  
**Maintained by:** Veribee QA Team  
**Related Files:** `workflow.md`, `Veribee_QA_TestPlan.md`, `Design.md`
