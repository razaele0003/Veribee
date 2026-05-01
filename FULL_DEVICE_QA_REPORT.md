# Veribee Full Device QA Report

Date: 2026-05-01

## Summary

Full mobile QA passed after fixes.

- Buyer login and tabs: passed
- Seller login and tabs: passed
- Rider accept job: passed
- Pickup navigation: passed
- Pickup confirmation checklist: passed
- Delivery navigation: passed
- Delivery verification choice: passed
- OTP delivery completion: passed
- Back to rider jobs: passed

Automated mobile result: `29 passed, 0 failed`

Responsive smoke result across small phone, large phone, tablet, and desktop: `28 passed, 0 failed`

## Issues Found and Fixed

1. Rider pickup action button had low contrast.
   - Fixed by using the Veribee red primary button style with white text and icon.

2. Pickup navigation crashed on web after pressing arrival.
   - Root cause: Expo location watcher cleanup on web.
   - Fixed by disabling live watch subscriptions on web and keeping one-time location resolution.

3. Local demo accounts were trying to write to Supabase.
   - Fixed demo/local guards so local buyer/seller/rider flows stay reliable during a three-device demo.

4. Pickup and delivery navigation could show demo route labels instead of the accepted job's address.
   - Fixed navigation screens to prefer the active delivery coordinates and labels.

5. Delivery verification title was inconsistent.
   - Changed `Confirm Delivery` to `Verify Delivery` on the verification-choice screen.

6. OTP and completion success colors had low contrast.
   - Fixed banner/check icon contrast.

## Screenshot Artifacts

Full-flow screenshots were saved locally in:

- `C:\tmp\veribee-full-mobile-qa`

Responsive screenshots were saved locally in:

- `C:\tmp\veribee-responsive-qa`

These are local QA artifacts and are not committed.
