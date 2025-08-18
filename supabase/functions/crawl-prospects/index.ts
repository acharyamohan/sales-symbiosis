// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type Campaign = {
  id: string;
  user_id: string;
  name: string;
  product_service: string;
  target_industry: string;
  ideal_job_roles: string[];
  company_size: string;
  region: string;
};

function env(name: string, optional = false): string | undefined {
  const v = Deno.env.get(name);
  if (!v && !optional) throw new Error(`Missing env: ${name}`);
  return v;
}

function buildQueries(c: Campaign): string[] {
  const roles = c.ideal_job_roles?.length ? c.ideal_job_roles : ["cto", "head of hr", "recruiter", "vp sales"]; // defaults
  const location = c.region || "";
  const industry = c.target_industry || "";
  const queries: string[] = [];
  for (const role of roles) {
    const q = `${role} ${industry} ${location}`.trim();
    queries.push(q);
  }
  return queries.slice(0, 5);
}

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  } as const;

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  
  try {
    const SUPABASE_URL = env("SUPABASE_URL") as string;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || "";
    const ANON = env("SUPABASE_ANON_KEY") as string;
    const APIFY_TOKEN = env("APIFY_TOKEN") as string;
    const APIFY_SEARCH_ACTOR_ID = env("APIFY_SEARCH_ACTOR_ID") as string;
    const LINKEDIN_LI_AT = env("LINKEDIN_LI_AT") as string;

    // Enhanced JSON parsing with better error handling
    let requestBody;
    try {
      const text = await req.text();
      if (!text || text.trim() === '') {
        throw new Error("Request body is empty");
      }
      requestBody = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Invalid JSON in request body: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }

    const { campaignId, maxResults = 30 } = requestBody as { campaignId: string; maxResults?: number };
    
    if (!campaignId) {
      throw new Error("campaignId is required in request body");
    }

    const useService = Boolean(SERVICE_ROLE);
    const supabase = createClient(SUPABASE_URL, useService ? SERVICE_ROLE : ANON);

    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single<Campaign>();
    if (cErr || !campaign) throw cErr ?? new Error("Campaign not found");

    const queries = buildQueries(campaign);

    const runRes = await fetch(`https://api.apify.com/v2/actors/${APIFY_SEARCH_ACTOR_ID}/runs?waitForFinish=240`, {
      method: "POST",
      headers: { Authorization: `Bearer ${APIFY_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify({ queries, maxResults, li_at: LINKEDIN_LI_AT }),
    });
    if (!runRes.ok) throw new Error(`Apify HTTP ${runRes.status}`);
    const runJson = await runRes.json();
    if (runJson?.data?.status !== "SUCCEEDED") throw new Error(`Apify status ${runJson?.data?.status}`);

    // fetch dataset items
    const datasetId = runJson?.data?.defaultDatasetId;
    if (!datasetId) throw new Error("No dataset id from actor run");
    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json`, {
      headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
    });
    if (!itemsRes.ok) throw new Error(`Dataset HTTP ${itemsRes.status}`);
    const items = (await itemsRes.json()) as Array<{
      name?: string; title?: string; company?: string; profileUrl?: string;
    }>;

    const toInsert = items
      .filter(i => i.profileUrl && i.profileUrl.includes("linkedin.com/in"))
      .map(i => ({
        campaign_id: campaign.id,
        name: i.name || i.title?.split(" at ")?.[0] || "Unknown",
        job_title: i.title || "",
        company: i.company || "",
        linkedin_url: i.profileUrl!,
        status: "pending" as const,
      }));

    // dedupe by url
    const unique = new Map<string, (typeof toInsert)[number]>();
    for (const p of toInsert) unique.set(p.linkedin_url, p);
    const batch = Array.from(unique.values());

    let inserted = 0;
    if (batch.length) {
      const { error: iErr, count } = await supabase.from("prospects").insert(batch, { count: "exact" });
      if (iErr) throw iErr;
      inserted = count ?? batch.length;
    }

    return new Response(JSON.stringify({ inserted, attempted: toInsert.length, queries }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (err) {
    const msg = typeof err === 'object' && err && 'message' in err ? (err as any).message : String(err);
    console.error('Crawl prospects error:', err);
    
    // Provide more specific error messages
    let statusCode = 500;
    let errorMessage = msg;
    
    if (msg.includes('Missing env:')) {
      statusCode = 500;
      errorMessage = `Configuration error: ${msg}. Please check your Supabase secrets.`;
    } else if (msg.includes('Apify HTTP')) {
      statusCode = 502;
      errorMessage = `Apify API error: ${msg}. Please check your APIFY_TOKEN and APIFY_SEARCH_ACTOR_ID.`;
    } else if (msg.includes('Campaign not found')) {
      statusCode = 404;
      errorMessage = msg;
    } else if (msg.includes('campaignId is required')) {
      statusCode = 400;
      errorMessage = msg;
    } else if (msg.includes('Invalid JSON') || msg.includes('Request body is empty')) {
      statusCode = 400;
      errorMessage = `Bad request: ${msg}`;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: msg,
      timestamp: new Date().toISOString()
    }), { 
      status: statusCode, 
      headers: { ...cors, "content-type": "application/json" } 
    });
  }
});
