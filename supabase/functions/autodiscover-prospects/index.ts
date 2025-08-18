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
  status: 'draft' | 'active' | 'paused' | 'completed';
};

function assertEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function buildQueries(c: Campaign): string[] {
  const roles = c.ideal_job_roles?.length ? c.ideal_job_roles : ["cto", "head of hr", "recruiter", "vp sales"]; // safe defaults
  const region = c.region || "";
  const industry = c.target_industry || "";
  const queries: string[] = [];
  for (const role of roles) {
    const q = `site:linkedin.com/in (\"${role}\") (\"${industry}\") ${region}`.trim();
    queries.push(q);
  }
  return queries.slice(0, 5);
}

function extractName(title: string): string {
  const parts = title.split(/[\-|–|\|]/);
  return parts[0]?.trim() || title.trim();
}

function extractCompanyAndRole(text: string): { role?: string; company?: string } {
  const atIdx = text.toLowerCase().indexOf(" at ");
  if (atIdx > -1) {
    const role = text.slice(0, atIdx).trim();
    const company = text.slice(atIdx + 4).split("|")[0].split("-")[0].trim();
    return { role, company };
  }
  return {};
}

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = assertEnv("SUPABASE_URL");
    // Prefer service role for scheduled job to avoid client RLS issues
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || "";
    const ANON = assertEnv("SUPABASE_ANON_KEY");
    const SERPER_API_KEY = assertEnv("SERPER_API_KEY");

    const authHeader = req.headers.get("Authorization") ?? "";
    const useService = Boolean(SERVICE_ROLE);
    const supabase = createClient(SUPABASE_URL, useService ? SERVICE_ROLE : ANON, {
      global: { headers: { Authorization: useService ? `Bearer ${SERVICE_ROLE}` : authHeader } },
    });

    // Optional payload: { campaignIds?: string[], maxPerCampaign?: number }
    const body = await req.json().catch(() => ({})) as { campaignIds?: string[]; maxPerCampaign?: number };
    const maxPerCampaign = Math.max(1, Math.min(50, body.maxPerCampaign ?? 25));

    let query = supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active");
    if (body.campaignIds?.length) query = query.in("id", body.campaignIds);

    const { data: campaigns, error: cErr } = await query;
    if (cErr) throw cErr;

    let totalInserted = 0;
    const details: Array<{ campaignId: string; inserted: number; attempted: number }> = [];

    for (const c of (campaigns as unknown as Campaign[]) || []) {
      const queries = buildQueries(c);
      const toInsert: Array<{ campaign_id: string; name: string; job_title: string; company: string; linkedin_url: string; status: string } > = [];

      for (const q of queries) {
        const res = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: { "X-API-KEY": SERPER_API_KEY, "content-type": "application/json" },
          body: JSON.stringify({ q, num: 10 }),
        });
        if (!res.ok) continue;
        const json = await res.json() as { organic?: Array<{ title?: string; link?: string; snippet?: string }> };
        for (const r of json.organic ?? []) {
          const link = r.link ?? "";
          if (!link.includes("linkedin.com/in")) continue;
          const title = r.title ?? "";
          const snippet = r.snippet ?? "";
          const person = extractName(title);
          const extra = extractCompanyAndRole(`${title} ${snippet}`);
          toInsert.push({
            campaign_id: c.id,
            name: person || "Unknown",
            job_title: extra.role || (c.ideal_job_roles?.[0] || ""),
            company: extra.company || "",
            linkedin_url: link,
            status: "pending",
          });
        }
      }

      // dedupe & cap per campaign
      const unique = new Map<string, (typeof toInsert)[number]>();
      for (const p of toInsert) unique.set(p.linkedin_url, p);
      const batch = Array.from(unique.values()).slice(0, maxPerCampaign);

      let inserted = 0;
      if (batch.length) {
        const { error: iErr, count } = await supabase.from("prospects").insert(batch, { count: "exact" });
        if (iErr) {
          // ignore RLS/service mismatch silently to continue other campaigns
          console.error("insert error", iErr);
        } else {
          inserted = count ?? batch.length;
        }
      }

      totalInserted += inserted;
      details.push({ campaignId: c.id, inserted, attempted: toInsert.length });
    }

    return new Response(JSON.stringify({ totalInserted, details }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    const msg = typeof err === 'object' && err && 'message' in err ? (err as any).message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "content-type": "application/json" } });
  }
});


