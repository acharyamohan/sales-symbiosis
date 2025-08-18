# Sales Symbiosis Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Supabase CLI
- Docker (for local development)
- Apify account and API token
- LinkedIn session cookie

## Environment Variables Setup

### 1. Frontend Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Edge Function Secrets

Set the following secrets for your Supabase project:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref your_project_ref

# Set the required secrets
supabase secrets set APIFY_TOKEN=your_apify_token
supabase secrets set APIFY_SEARCH_ACTOR_ID=your_apify_search_actor_id
supabase secrets set LINKEDIN_LI_AT=your_linkedin_session_cookie
```

### 3. Required Services Setup

#### Apify Setup
1. Create an account at [Apify](https://apify.com)
2. Get your API token from the Apify console
3. Find or create a LinkedIn search actor and note its ID

#### LinkedIn Session Cookie
1. Log into LinkedIn in your browser
2. Open Developer Tools (F12)
3. Go to Application/Storage tab
4. Find the `li_at` cookie value
5. Copy this value for the `LINKEDIN_LI_AT` secret

## Deployment

### Deploy Edge Functions

```bash
# Deploy all Edge Functions
supabase functions deploy

# Or deploy specific functions
supabase functions deploy crawl-prospects
supabase functions deploy discover-prospects
supabase functions deploy analyze-profile
supabase functions deploy generate-message
supabase functions deploy process-queue
```

### Start Development Server

```bash
npm install
npm run dev
```

## Troubleshooting

### Edge Function "non-2xx status code" Error

This error typically occurs when:

1. **Missing Environment Variables**: Ensure all required secrets are set
2. **Edge Function Not Deployed**: Deploy the functions using `supabase functions deploy`
3. **Invalid API Credentials**: Verify your Apify token and LinkedIn session cookie
4. **Rate Limiting**: Check if you've hit API limits

### Check Edge Function Logs

```bash
# View logs for a specific function
supabase functions logs crawl-prospects

# View all function logs
supabase functions logs
```

### Verify Secrets

```bash
# List all secrets
supabase secrets list
```

### Test Edge Function Locally

```bash
# Start Supabase locally
supabase start

# Test the function
curl -X POST http://localhost:54321/functions/v1/crawl-prospects \
  -H "Authorization: Bearer your_anon_key" \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "test-campaign-id", "maxResults": 10}'
```

## Database Schema

The application requires the following tables:
- `profiles`
- `campaigns` 
- `prospects`
- `messages`

These should be created automatically when you run the Supabase migrations.

## Common Issues

1. **Docker not running**: Ensure Docker is running for local development
2. **Permission errors**: Run Docker with elevated privileges on Windows
3. **Invalid session cookie**: LinkedIn session cookies expire - refresh regularly
4. **API rate limits**: Monitor your Apify usage and LinkedIn API limits
