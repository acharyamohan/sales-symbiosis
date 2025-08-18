# Message Queue (LinkedIn automation via Apify)

Required Supabase SQL:

```
create table if not exists public.messages_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  linkedin_url text not null,
  message text not null,
  status text not null default 'queued' check (status in ('queued','sent','error')),
  error text,
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.messages_queue enable row level security;
create policy "mq select own" on public.messages_queue for select using (auth.uid() = user_id);
create policy "mq modify own" on public.messages_queue for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Deploy function:

```
supabase secrets set APIFY_TOKEN=***
supabase secrets set APIFY_ACTOR_ID=***   # your Actor ID
supabase secrets set LINKEDIN_LI_AT=***   # session cookie (risk!)

supabase functions deploy process-queue
```

Invoke:

```
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "content-type: application/json" \
  -d '{"batchSize":5}' \
  https://<project>.supabase.co/functions/v1/process-queue
```

Note: Automating LinkedIn messages may violate LinkedIn ToS; use responsibly at low volume.


