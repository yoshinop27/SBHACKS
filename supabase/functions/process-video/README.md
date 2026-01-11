# Process Video Edge Function

This Supabase Edge Function processes video links using the 12 Labs API.

## Setup

### 1. Set 12 Labs API Key as Supabase Secret

In your Supabase Dashboard:
1. Go to Project Settings → Edge Functions → Secrets
2. Add secret: `TWELVE_LABS_API_KEY` with your 12 Labs API key value

### 2. Deploy the Function

Using Supabase CLI:
```bash
supabase functions deploy process-video
```

Or using the Supabase Dashboard:
1. Go to Edge Functions
2. Create new function: `process-video`
3. Copy the contents of `index.ts`

### 3. Update 12 Labs API Integration

**IMPORTANT:** The Edge Function currently has placeholder code for the 12 Labs API. You need to:

1. Update the `twelveLabsUrl` in `index.ts` with the actual 12 Labs API endpoint
2. Update the request body format to match 12 Labs API requirements
3. Update the response transformation to extract `text` and `questions` from the actual 12 Labs response format

Example structure (adjust based on actual API):
```typescript
const response = await fetch('https://api.twelvelabs.io/v1.2/videos/transcribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': twelveLabsApiKey,
  },
  body: JSON.stringify({
    video_url: video_link,
    // Add other required fields
  }),
})

const data = await response.json()
// Transform data.text and data.questions to match expected format
```

## Usage

From the frontend:
```typescript
const { data, error } = await supabase.functions.invoke('process-video', {
  body: { video_link: 'https://...' }
})
```

## Response Format

Returns:
```json
{
  "text": "key topics from video...",
  "questions": ["question 1", "question 2", ...]
}
```

