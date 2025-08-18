import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import OpenAI from 'https://deno.land/x/openai@v4.58.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { profileData, campaignContext } = await req.json()

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const hfKey = Deno.env.get('HF_API_KEY')
    const system = `You extract concise, actionable insights from a LinkedIn profile for sales outreach.`
    const prompt = `Profile Data:\n${profileData}\n\nCampaign Context:\n${JSON.stringify(campaignContext)}\n\nReturn a compact JSON with: personalityInsights[], recentActivity[], commonInterests[], recommendedApproach, engagementScore (0-100), bestContactTime, personalizedHooks[].`

    let text = ''
    if (openaiKey) {
      const openai = new OpenAI({ apiKey: openaiKey })
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 350,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      })
      text = resp.choices?.[0]?.message?.content?.trim() || '{}'
    } else if (hfKey) {
      const model = Deno.env.get('HF_TEXT_MODEL') || 'mistralai/Mistral-7B-Instruct-v0.2'
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `${system}\n\nUser: ${prompt}\nAssistant:`,
          parameters: { max_new_tokens: 350, temperature: 0.5, do_sample: true },
        }),
      })
      if (!res.ok) throw new Error(`HF error ${res.status}`)
      const json = await res.json()
      text = Array.isArray(json)
        ? (json[0]?.generated_text || '').split('Assistant:').pop()?.trim() || '{}'
        : (json?.generated_text || json?.[0]?.generated_text || '{}').trim()
    } else {
      text = JSON.stringify({
        personalityInsights: ["Curious professional"],
        recentActivity: [],
        commonInterests: [],
        recommendedApproach: 'Friendly, concise',
        engagementScore: 75,
        bestContactTime: 'Mid-week mornings',
        personalizedHooks: [],
      })
    }
    let analysis
    try { analysis = JSON.parse(text) } catch { analysis = { raw: text } }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const msg = typeof error === 'object' && error && 'message' in error ? (error as Error).message : String(error)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})