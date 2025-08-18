import { serve } from "std/server";
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
  outreach_goal: string;
  brand_voice: string;
  optional_triggers: string[];
};

type SerperOrganic = {
  title?: string;
  link?: string;
  snippet?: string;
};

type DiscoverResponse = {
  inserted: number;
  attempted: number;
  queries: string[];
};

function assertEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function buildQueries(campaign: Campaign): string[] {
  const roles = campaign.ideal_job_roles?.length
    ? campaign.ideal_job_roles
    : ["sales", "recruiter", "hr", "founder"]; // fallback
  const region = campaign.region || "";
  const industry = campaign.target_industry || "";

  const queries: string[] = [];
  for (const role of roles) {
    // Google dorking to find LinkedIn profiles
    const q = `site:linkedin.com/in ("${role}") ("${industry}") ${region}`.trim();
    queries.push(q);
  }
  return queries.slice(0, 5);
}

function extractName(title: string): string {
  const parts = title.split(/[\-|–|\|]/);
  return parts[0]?.trim() || title.trim();
}

function extractCompanyAndRole(titleOrSnippet: string): { name?: string; company?: string } {
  // Very naive heuristics; real enrichment should use a provider like Proxycurl
  const atIdx = titleOrSnippet.indexOf(" at ");
  if (atIdx > -1) {
    const role = titleOrSnippet.slice(0, atIdx).trim();
    const company = titleOrSnippet.slice(atIdx + 4).split("|")[0].split("-")[0].trim();
    return { name: role, company };
  }
  return {};
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  } as const;

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const SUPABASE_URL = assertEnv("SUPABASE_URL");
    const SUPABASE_ANON_KEY = assertEnv("SUPABASE_ANON_KEY");
    const SERPER_API_KEY = assertEnv("SERPER_API_KEY");

    const authHeader = req.headers.get("Authorization") ?? "";
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { campaignId } = (await req.json()) as { campaignId?: string };
    if (!campaignId) {
      return new Response(JSON.stringify({ error: "campaignId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const { data: campaign, error: cErr } = await client
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single<Campaign>();
    if (cErr || !campaign) throw cErr ?? new Error("Campaign not found");

    const queries = buildQueries(campaign);
    const toInsert: Array<{
      campaign_id: string;
      name: string;
      job_title: string;
      company: string;
      linkedin_url: string;
      status: string;
    }> = [];

    for (const q of queries) {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({ q, num: 10 }),
      });
      if (!res.ok) throw new Error(`Serper error: ${res.status}`);
      const json = (await res.json()) as { organic?: SerperOrganic[] };
      const rows = json.organic ?? [];

      for (const r of rows) {
        const link = r.link ?? "";
        if (!link.includes("linkedin.com/in")) continue;
        const title = r.title ?? "";
        const snippet = r.snippet ?? "";
        const personName = extractName(title);
        const { name: roleFromTitle, company } = extractCompanyAndRole(title + " " + snippet);

        toInsert.push({
          campaign_id: campaign.id,
          name: personName || "Unknown",
          job_title: roleFromTitle || campaign.ideal_job_roles?.[0] || "",
          company: company || "",
          linkedin_url: link,
          status: "pending",
        });
      }
    }

    // Deduplicate by linkedin_url within this batch
    const unique = new Map<string, (typeof toInsert)[number]>();
    for (const p of toInsert) {
      unique.set(p.linkedin_url, p);
    }
    const batch = Array.from(unique.values()).slice(0, 50);

    let inserted = 0;
    if (batch.length) {
      const { error: iErr, count } = await client
        .from("prospects")
        .insert(batch, { count: "exact" });
      if (iErr) throw iErr;
      inserted = count ?? batch.length;
    }

    const resp: DiscoverResponse = {
      inserted,
      attempted: toInsert.length,
      queries,
    };

    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("discover-prospects error", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
