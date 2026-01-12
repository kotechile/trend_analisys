# Fixing Supabase OAuth Redirect to Localhost

## Problem
After Google OAuth login, you're being redirected to `https://sbcontent.aichieve.net/#access_token=...` instead of your app at `http://localhost:5173/auth/callback`.

## Root Cause
Supabase needs to be configured to allow redirects to your app's URL. By default, Supabase may only allow redirects to its own domain for security reasons.

## Solution

### Option 1: Configure Supabase Dashboard (Recommended)

1. **Access your Supabase Dashboard** (or self-hosted admin panel)
   - For self-hosted: Usually at `https://sbcontent.aichieve.net` or your admin URL
   - For Supabase Cloud: `https://supabase.com/dashboard`

2. **Navigate to Authentication Settings**
   - Go to **Authentication** → **URL Configuration** (or **Settings** → **Auth**)

3. **Add Redirect URLs**
   Add these URLs to the "Redirect URLs" or "Site URL" configuration:
   ```
   http://localhost:5173
   http://localhost:5173/auth/callback
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```
   (Add your production domain when ready)

4. **Save the configuration**

### Option 2: Configure via Environment Variables (Self-hosted)

If you're self-hosting Supabase, you can configure this in your `config.toml`:

```toml
[auth]
site_url = "http://localhost:5173"
additional_redirect_urls = [
  "http://localhost:5173/auth/callback",
  "http://localhost:3000/auth/callback"
]
```

Then restart your Supabase instance.

### Option 3: Use Supabase API (Advanced)

You can also configure this programmatically via the Supabase Management API, but the dashboard method is easier.

## Verification

After configuring:

1. **Clear your browser cache and cookies**
2. **Try Google OAuth login again**
3. **You should be redirected to**: `http://localhost:5173/auth/callback#access_token=...`

## Troubleshooting

### Still redirecting to Supabase domain?

1. **Check the redirect URL in code**:
   - Open browser console
   - Look for: `GoogleAuth: Redirect URL set to: ...`
   - It should show: `http://localhost:5173/auth/callback`

2. **Check Supabase logs**:
   - Look for OAuth redirect errors
   - Verify the redirect URL is in the allowed list

3. **Try the redirect HTML file**:
   - If Supabase still redirects to its domain, you can host the `oauth-redirect.html` file on the Supabase domain
   - Place it at: `https://sbcontent.aichieve.net/oauth-redirect.html`
   - Update the file to point to your app URL

### Port Issues

If your app runs on a different port (not 5173):
- Update the redirect URL in `GoogleAuth.tsx`
- Or set it via environment variable: `VITE_APP_PORT=3000`

## Production Setup

When deploying to production:

1. **Update redirect URLs** to your production domain:
   ```
   https://yourdomain.com
   https://yourdomain.com/auth/callback
   ```

2. **Update Google OAuth settings** in Google Cloud Console:
   - Add your production callback URL to authorized redirect URIs

3. **Update environment variables**:
   ```env
   VITE_SUPABASE_URL=https://sbcontent.aichieve.net
   VITE_SUPABASE_ANON_KEY=your-key
   ```

## Code Changes Made

The code has been updated to:
- Explicitly use `localhost:5173` for development
- Better handle redirects from Supabase domain
- Add logging to debug redirect issues
- Create a fallback redirect HTML file

The main fix still requires Supabase configuration as described above.

