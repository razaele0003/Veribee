# Veribee Free Live Integrations Setup

This file documents what is now wired in the app and what still needs dashboard configuration before deployment.

## Maps and Rider Location

| Need | Free implementation | Status |
|---|---|---|
| Rider current location | `expo-location` foreground permission, `getLastKnownPositionAsync`, `getCurrentPositionAsync`, and `watchPositionAsync` | Implemented |
| Buyer live tracking | Supabase Realtime subscription on `deliveries` updates | Implemented |
| Route open in maps | Google Maps URLs with origin/destination coordinates | Implemented, no API key |
| Route estimate | OSRM public route endpoint with local haversine fallback | Implemented |
| Address search/geocoding | OpenStreetMap Nominatim | Not implemented yet; use only on user action, max 1 request/sec, cache results |

Current implementation files:

- `lib/maps.ts`
- `lib/locationTracking.ts`
- `components/rider/MapCard.tsx`
- `app/(rider)/navigation-pickup.tsx`
- `app/(rider)/navigation-delivery.tsx`
- `app/(buyer)/order-tracking/[id].tsx`

Google Maps URLs are not the paid Google Maps Platform SDK. They open Google Maps with route parameters and do not require an API key.

## Google Authentication

| Need | Free implementation | Status |
|---|---|---|
| Google sign-in | Supabase Auth Google OAuth | Code added |
| OAuth callback | `/callback` route resolves Supabase session and routes user by role | Code added |

Current implementation files:

- `lib/authOAuth.ts`
- `lib/supabase.ts`
- `app/(auth)/login.tsx`
- `app/(auth)/callback.tsx`

Supabase dashboard setup still required:

1. In Google Cloud, create an OAuth client.
2. In Supabase Dashboard, enable Authentication Providers > Google.
3. Add the Google Client ID and Client Secret.
4. Add redirect URLs:
   - Local web: `http://localhost:8085/callback` or your active local port
   - Expo/native deep link: `veribee://callback`
   - Production web: `https://YOUR_DOMAIN/callback`

## ID Verification

There is no reliable free API that verifies Philippine government IDs against an official identity database. Free-only MVP path:

| Need | Free implementation | Status |
|---|---|---|
| Capture ID front/back | `expo-image-picker` | Implemented |
| Local pre-check | Resolution + both-sides evidence scoring | Implemented |
| OCR extraction | Tesseract.js or Google ML Kit alternative | Next |
| Real government/database validation | Paid vendor or official integration | Not free |

Current implementation files:

- `lib/idVerification.ts`
- `app/(auth)/register.tsx`
- `app/(auth)/add-role.tsx`

For production, treat the current free ID flow as `ready_for_review`, not fully verified. It should create a KYC review queue before seller/rider approval.

## Sources

- Expo Location: https://docs.expo.dev/versions/latest/sdk/location/
- Google Maps URLs: https://developers.google.com/maps/documentation/urls/guide
- OpenStreetMap Nominatim policy: https://operations.osmfoundation.org/policies/nominatim/
- OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/
- Supabase Google Auth: https://supabase.com/docs/guides/auth/social-login/auth-google
