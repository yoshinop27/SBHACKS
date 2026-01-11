# Deploy Edge Function

## Quick Setup (Dashboard Method)

1. **Set 12 Labs API Key Secret**
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Add secret: `TWELVE_LABS_API_KEY` = your 12 Labs API key

2. **Create Function in Dashboard**
   - Go to Edge Functions → Create new function
   - Name: `process-video`
   - Copy contents of `supabase/functions/process-video/index.ts`
   - Paste into code editor
   - Click Deploy

## CLI Method (Recommended)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Set the secret
supabase secrets set TWELVE_LABS_API_KEY=your-api-key-here

# Deploy the function
supabase functions deploy process-video
```

## Important Notes

- The Edge Function code has placeholder code for 12 Labs API (lines 55-89)
- You need to update the API endpoint, request format, and response transformation based on actual 12 Labs API documentation
- The function expects `TWELVE_LABS_API_KEY` to be set as a secret

