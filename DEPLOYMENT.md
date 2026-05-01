# Veribee Deployment Readiness

This project is an Expo Router app targeting web, Android, and iOS.

## Current Branch and Remote

- Branch: `main`
- Remote: `https://github.com/razaele0003/Veribee.git`

## Required Environment Variables

Expo only exposes environment variables that start with `EXPO_PUBLIC_`.

Create a local `.env` file with:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not put service-role keys, private API keys, or other secrets in `EXPO_PUBLIC_` variables because they are bundled into the client app.

## Local Verification

Run this before publishing:

```bash
npm run deploy:check
```

This runs:

```bash
npm run typecheck
npm run build:web
```

The web build outputs to `dist/`.

## Web Deployment

The app is configured with:

```json
"web": {
  "bundler": "metro",
  "output": "single"
}
```

`single` is intentional for now because the app uses dynamic routes such as product and order detail pages. Static export can require generating known route params ahead of time, while a single-page app is simpler for this current demo/deployment stage.

Build:

```bash
npm run build:web
```

Preview:

```bash
npm run preview:web
```

Deploy the `dist/` folder to any static host that supports SPA fallback routing.

Recommended simple hosts:

- Vercel static deployment
- Netlify static deployment
- GitHub Pages with SPA fallback handling
- EAS Hosting when ready

## Mobile Builds with EAS

The app now includes `eas.json` with development, preview, and production profiles.

Preview Android APK:

```bash
npx eas build --platform android --profile preview
```

Production Android build:

```bash
npx eas build --platform android --profile production
```

Production iOS build:

```bash
npx eas build --platform ios --profile production
```

Configured app identifiers:

- Android package: `com.veribee.delivery`
- iOS bundle identifier: `com.veribee.delivery`

## Demo Accounts

Use these for local/demo validation:

| Role | Phone | Password |
|---|---|---|
| Seller | +639171234501 | VeribeeTest123! |
| Buyer | +639171234502 | VeribeeTest123! |
| Rider | +639171234503 | VeribeeTest123! |

OTP for demo flows: `123456`.

For a three-device role demo, use `THREE_DEVICE_DEMO_PROFILES.md`. It keeps the buyer, seller, rider, order, route, OTP, coordinates, and map behavior aligned around order `VB-9982`.

## Deployment Caveats

- The current AI Scanner is represented as demo-ready data and scoring logic, not a production ML service yet.
- Free AI/API choices are documented in `VERIBEE_UNIQUE_FEATURES_FREE_STACK.md`.
- The Supabase anon key is safe to use client-side only if Row Level Security policies are correctly configured.
- Before public launch, review Supabase RLS, storage bucket policies, privacy copy, dispute handling, and account deletion requirements.

## Reference Docs

- Expo web export: https://docs.expo.dev/guides/publishing-websites/
- Expo Router static rendering caveats: https://docs.expo.dev/router/web/static-rendering/
- Expo environment variables: https://docs.expo.dev/guides/environment-variables/
- EAS build config: https://docs.expo.dev/build-reference/build-configuration/
