import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import OpenAI from 'https://deno.land/x/openai@v4.58.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

type MessageType = 'connection' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { prospect, campaign, messageType, profileAnalysis } = await req.json()

    const voice = String(campaign?.brand_voice || 'friendly')
    const type: MessageType = ['connection','follow_up_1','follow_up_2','follow_up_3'].includes(messageType) ? messageType : 'connection'

    const system = `You are an expert SDR writing short, personalized LinkedIn ${type.replaceAll('_',' ')} messages.
Rules:
- 280 characters max.
- No fluff. Specific, respectful, value-forward.
- Adapt tone to brand voice: ${voice}.
- If follow-up, reference prior context briefly.
- Never invent facts; use provided details only.`

    const context = {
      prospect,
      campaign,
      profileAnalysis: profileAnalysis ?? null,
      messageType: type,
    }

    const prompt = `Write the message only (no quotes). Data: ${JSON.stringify(context)}`

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (openaiKey) {
      const openai = new OpenAI({ apiKey: openaiKey })
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        max_tokens: 200,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      })
      const message = resp.choices?.[0]?.message?.content?.trim() || ''
      return new Response(JSON.stringify({ message, confidence: 90, personalizationScore: 85 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fallback: Hugging Face Inference API
    const hfKey = Deno.env.get('HF_API_KEY')
    if (hfKey) {
      const model = Deno.env.get('HF_TEXT_MODEL') || 'mistralai/Mistral-7B-Instruct-v0.2'
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `${system}\n\nUser: ${prompt}\nAssistant:`,
          parameters: { max_new_tokens: 200, temperature: 0.5, do_sample: true },
        }),
      })
      if (!res.ok) throw new Error(`HF error ${res.status}`)
      const json = await res.json()
      // Response can be array or object depending on model pipeline
      const message = Array.isArray(json)
        ? (json[0]?.generated_text || '').split('Assistant:').pop()?.trim() || ''
        : (json?.generated_text || json?.[0]?.generated_text || '').trim()
      return new Response(JSON.stringify({ message, confidence: 85, personalizationScore: 80 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Last resort static template
    const template = `Hi ${prospect?.name || 'there'}, I saw your work in ${campaign?.target_industry}. We help teams with ${campaign?.product_service}. Would you be open to a quick chat?`
    return new Response(JSON.stringify({ message: template, confidence: 85, personalizationScore: 75 }), {
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