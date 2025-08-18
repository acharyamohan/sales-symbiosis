// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
} as const;

function assertEnv(name: string, optional = false): string | undefined {
  const v = Deno.env.get(name);
  if (!v && !optional) throw new Error(`Missing env: ${name}`);
  return v;
}

type QueueItem = {
  id: string;
  user_id: string;
  campaign_id: string;
  prospect_id: string;
  linkedin_url: string;
  message: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  try {
    const SUPABASE_URL = assertEnv("SUPABASE_URL") as string;
    const SERVICE_ROLE_KEY = (assertEnv("SUPABASE_SERVICE_ROLE_KEY", true) || assertEnv("SERVICE_ROLE_KEY", true)) as string | undefined;
    const ANON = assertEnv("SUPABASE_ANON_KEY") as string;
    const APIFY_TOKEN = assertEnv("APIFY_TOKEN", true);
    const APIFY_ACTOR_ID = assertEnv("APIFY_ACTOR_ID", true);
    const LINKEDIN_LI_AT = assertEnv("LINKEDIN_LI_AT", true);

    const authHeader = req.headers.get("Authorization") ?? "";
    const useService = Boolean(SERVICE_ROLE_KEY);
    const supabase = createClient(SUPABASE_URL, useService ? SERVICE_ROLE_KEY! : ANON, {
      global: { headers: { Authorization: useService ? `Bearer ${SERVICE_ROLE_KEY}` : authHeader } },
    });

    const { batchSize = 5 } = (await req.json().catch(() => ({}))) as { batchSize?: number };

    // pull oldest queued
    const { data: items, error: qErr } = await supabase
      .from("messages_queue")
      .select("id,user_id,campaign_id,prospect_id,message,linkedin_url")
      .eq("status", "queued")
      .order("scheduled_at", { ascending: true })
      .limit(Math.max(1, Math.min(20, batchSize)));
    if (qErr) throw qErr;

    const results: Array<{ id: string; status: string; error?: string }> = [];
    for (const it of (items as unknown as QueueItem[]) || []) {
      try {
        if (!APIFY_TOKEN || !APIFY_ACTOR_ID) throw new Error("APIFY_TOKEN/APIFY_ACTOR_ID not set");
        if (!LINKEDIN_LI_AT) throw new Error("LINKEDIN_LI_AT not set");

        const run = await fetch(`https://api.apify.com/v2/actors/${APIFY_ACTOR_ID}/runs?waitForFinish=120`, {
          method: "POST",
          headers: { Authorization: `Bearer ${APIFY_TOKEN}`, "content-type": "application/json" },
          body: JSON.stringify({
            profileUrl: it.linkedin_url,
            message: it.message,
            li_at: LINKEDIN_LI_AT,
          }),
        });
        if (!run.ok) throw new Error(`Apify HTTP ${run.status}`);
        const runJson = await run.json();
        if (runJson?.data?.status !== "SUCCEEDED") {
          throw new Error(`Apify status: ${runJson?.data?.status ?? "UNKNOWN"}`);
        }

        await supabase
          .from("messages_queue")
          .update({ status: "sent", sent_at: new Date().toISOString(), error: null })
          .eq("id", it.id);
        results.push({ id: it.id, status: "sent" });
      } catch (err) {
        const msg = typeof err === "object" && err && "message" in err ? String((err as any).message) : String(err);
        await supabase
          .from("messages_queue")
          .update({ status: "error", error: msg })
          .eq("id", it.id);
        results.push({ id: it.id, status: "error", error: msg });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err) {
    const msg = typeof err === "object" && err && "message" in err ? String((err as any).message) : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});


