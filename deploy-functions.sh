#!/bin/bash

# Sales Symbiosis Edge Functions Deployment Script
# This script helps deploy all Edge Functions to Supabase

echo "🚀 Deploying Sales Symbiosis Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged into Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

# Deploy all functions
echo "📦 Deploying Edge Functions..."

echo "Deploying crawl-prospects..."
supabase functions deploy crawl-prospects

echo "Deploying discover-prospects..."
supabase functions deploy discover-prospects

echo "Deploying analyze-profile..."
supabase functions deploy analyze-profile

echo "Deploying generate-message..."
supabase functions deploy generate-message

echo "Deploying process-queue..."
supabase functions deploy process-queue

echo "✅ All Edge Functions deployed successfully!"

echo ""
echo "🔧 Next steps:"
echo "1. Set your environment secrets:"
echo "   supabase secrets set APIFY_TOKEN=your_token"
echo "   supabase secrets set APIFY_SEARCH_ACTOR_ID=your_actor_id"
echo "   supabase secrets set LINKEDIN_LI_AT=your_session_cookie"
echo ""
echo "2. Create a .env file with your Supabase credentials:"
echo "   VITE_SUPABASE_URL=your_project_url"
echo "   VITE_SUPABASE_ANON_KEY=your_anon_key"
echo ""
echo "3. Start your development server:"
echo "   npm run dev"
