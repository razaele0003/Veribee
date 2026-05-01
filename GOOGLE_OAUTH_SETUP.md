# Google OAuth Setup for Veribee

The app code is wired for Supabase Google OAuth through:

- `lib/authOAuth.ts`
- `app/(auth)/login.tsx`
- `app/(auth)/callback.tsx`
- `lib/supabase.ts`

The Google value shared in chat is an API key. That is not enough for Google OAuth. Google sign-in needs a Google OAuth Client ID and Client Secret from Google Auth Platform, then those credentials must be added in Supabase.

## Required Dashboard Setup

1. Open Google Cloud Console > Google Auth Platform > Clients.
2. Create an OAuth client ID.
3. Choose `Web application`.
4. Add authorized JavaScript origins:
   - `http://localhost:8085`
   - `http://localhost:8090`
   - Your production domain, for example `https://your-domain.com`
5. Add authorized redirect URI:
   - `https://yqtqdarloxcprwhqgfrw.supabase.co/auth/v1/callback`
6. Save the generated Client ID and Client Secret.
7. Open Supabase Dashboard > Authentication > Sign In / Providers > Google.
8. Enable Google.
9. Paste the Google Client ID and Client Secret.
10. Open Supabase Dashboard > Authentication > URL Configuration.
11. Set the Site URL to your production domain when deployed.
12. Add redirect URLs:
    - `http://localhost:8085/callback`
    - `http://localhost:8090/callback`
    - `veribee://callback`
    - `https://your-domain.com/callback`

## Security Notes

- Do not commit the Google OAuth Client Secret.
- Restrict any Google API key by HTTP referrer, Android package, or iOS bundle before production.
- If a key was pasted into chat, rotate it in Google Cloud before production.

## Test Flow

1. Start the app locally.
2. Open `/login`.
3. Tap `Continue with Google`.
4. Complete Google consent.
5. Confirm Supabase returns to `/callback`.
6. A new Google user defaults to the buyer role unless `user_roles` already contains a seller or rider role.
