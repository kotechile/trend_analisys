# OAuth PKCE Code Verifier Fix

## Issue
The OAuth callback was failing with: `invalid request: both auth code and code verifier should be non-empty`

This happens when Supabase uses PKCE (Proof Key for Code Exchange) flow, but the code verifier stored in sessionStorage is lost during the redirect.

## Changes Made

### 1. Updated Supabase Client Configuration
- **File**: `src/lib/supabase.ts`
- **Change**: Removed explicit `flowType: 'pkce'` to let Supabase auto-detect the flow type
- This allows Supabase to handle both PKCE and implicit flows automatically

### 2. Enhanced AuthCallback Component
- **File**: `src/components/auth/AuthCallback.tsx`
- **Changes**:
  - Added check for URL hash first (implicit flow tokens)
  - Added fallback handling when PKCE code verifier is missing
  - Improved error messages with helpful configuration guidance
  - Added retry logic with delay to allow Supabase to process the session

### 3. Fixed Redirect URL Port
- **File**: `src/components/auth/GoogleAuth.tsx`
- **Change**: Updated default port from 5173 to 3000 to match current frontend port

## Supabase Configuration Required

To fully resolve this issue, you need to configure Supabase properly:

### Option 1: Use Implicit Flow (Recommended for Self-Hosted)
1. Access your Supabase dashboard: `https://sbcontent.aichieve.net`
2. Go to **Authentication** → **URL Configuration**
3. Ensure these redirect URLs are added:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`
   - `http://localhost:5173/auth/callback` (if using Vite default port)
   - `http://localhost:5173`
4. In **Authentication** → **Providers** → **Google**:
   - Make sure the redirect URI in Google Cloud Console matches: `https://sbcontent.aichieve.net/auth/v1/callback`

### Option 2: Ensure PKCE Works (More Secure)
If you want to keep PKCE (more secure), ensure:
1. The redirect URL in your code **exactly matches** what's configured in Supabase
2. The redirect URL in Google Cloud Console is: `https://sbcontent.aichieve.net/auth/v1/callback`
3. No domain changes occur during the redirect (Supabase → localhost should work, but sessionStorage must be preserved)

## Testing

After making these changes:
1. Restart your frontend server
2. Try signing in with Google
3. Check the browser console for any errors
4. The callback should now handle both PKCE and implicit flows

## Current Status

✅ Code updated to handle PKCE errors gracefully
✅ Fallback to implicit flow if PKCE fails
✅ Better error messages
⚠️ Supabase configuration may need adjustment (see above)

## Next Steps

1. **Test the OAuth flow** - Try signing in with Google
2. **Check Supabase logs** - If it still fails, check Supabase logs for more details
3. **Verify redirect URLs** - Ensure all redirect URLs match exactly in:
   - Supabase dashboard
   - Google Cloud Console
   - Your frontend code

If issues persist, the Supabase configuration (redirect URLs, OAuth provider settings) likely needs adjustment.





