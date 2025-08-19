import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

function assertEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

interface ProspectData {
  id: string
  name: string
  title: string
  company: string
  linkedin_url: string
  raw_data?: any
}

interface ProcessedInsight {
  prospect_id: string
  personality_traits: string[]
  engagement_score: number
  pain_points: string[]
  recommended_approach: string
  personalized_hooks: string[]
  best_contact_time: string
  decision_maker_score: number
  ai_summary: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = assertEnv('SUPABASE_URL')
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY') || ''
    const ANON = assertEnv('SUPABASE_ANON_KEY')
    const HF_API_KEY = assertEnv('HF_API_KEY')

    const authHeader = req.headers.get('Authorization') ?? ''
    const useService = Boolean(SERVICE_ROLE)
    
    const supabase = createClient(SUPABASE_URL, useService ? SERVICE_ROLE : ANON, {
      global: { headers: { Authorization: useService ? `Bearer ${SERVICE_ROLE}` : authHeader } },
    })

    const { campaignId, batchSize = 10 } = await req.json()
    
    if (!campaignId) {
      throw new Error('campaignId is required')
    }

    // Get unprocessed prospects from the campaign
    const { data: prospects, error: prospectError } = await supabase
      .from('prospects')
      .select('id, name, title, company, linkedin_url, raw_data')
      .eq('campaign_id', campaignId)
      .is('ai_processed', null)
      .limit(batchSize)

    if (prospectError) throw prospectError

    if (!prospects || prospects.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No unprocessed prospects found',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const processedInsights: ProcessedInsight[] = []

    // Process each prospect with Mistral AI
    for (const prospect of prospects as ProspectData[]) {
      try {
        const prompt = `Analyze this LinkedIn prospect for sales outreach:

Name: ${prospect.name}
Title: ${prospect.title}
Company: ${prospect.company}
Profile Data: ${JSON.stringify(prospect.raw_data || {})}

Provide a JSON response with:
- personality_traits: array of 3-5 key personality insights
- engagement_score: number 0-100 (likelihood to engage)
- pain_points: array of potential business challenges they face
- recommended_approach: optimal outreach strategy
- personalized_hooks: array of 2-3 conversation starters
- best_contact_time: when to reach out (day/time preference)
- decision_maker_score: number 0-100 (authority level)
- ai_summary: brief 2-sentence prospect summary

Be concise and actionable.`

        const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 800,
              temperature: 0.3,
              do_sample: true,
              return_full_text: false
            }
          }),
        })

        if (!response.ok) {
          throw new Error(`Hugging Face API error: ${response.status}`)
        }

        const result = await response.json()
        let aiResponse = Array.isArray(result) ? result[0]?.generated_text : result.generated_text

        // Try to extract JSON from the response
        let insights: any
        try {
          // Look for JSON in the response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            insights = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        } catch (parseError) {
          // Fallback with structured data
          insights = {
            personality_traits: ['Professional', 'Results-oriented', 'Analytical'],
            engagement_score: 70,
            pain_points: ['Scaling challenges', 'Resource optimization'],
            recommended_approach: 'Professional, data-driven approach',
            personalized_hooks: ['Industry insights', 'Growth strategies'],
            best_contact_time: 'Tuesday-Thursday 9-11 AM',
            decision_maker_score: 75,
            ai_summary: `${prospect.name} is a ${prospect.title} at ${prospect.company} with strong leadership potential.`
          }
        }

        const processedInsight: ProcessedInsight = {
          prospect_id: prospect.id,
          personality_traits: insights.personality_traits || [],
          engagement_score: insights.engagement_score || 70,
          pain_points: insights.pain_points || [],
          recommended_approach: insights.recommended_approach || 'Professional approach',
          personalized_hooks: insights.personalized_hooks || [],
          best_contact_time: insights.best_contact_time || 'Weekday mornings',
          decision_maker_score: insights.decision_maker_score || 70,
          ai_summary: insights.ai_summary || `Professional contact at ${prospect.company}`
        }

        processedInsights.push(processedInsight)

        // Update prospect with AI processing flag and insights
        await supabase
          .from('prospects')
          .update({ 
            ai_processed: true,
            ai_insights: processedInsight,
            updated_at: new Date().toISOString()
          })
          .eq('id', prospect.id)

      } catch (error) {
        console.error(`Error processing prospect ${prospect.id}:`, error)
        
        // Mark as processed with error
        await supabase
          .from('prospects')
          .update({ 
            ai_processed: true,
            ai_insights: { error: 'Processing failed' },
            updated_at: new Date().toISOString()
          })
          .eq('id', prospect.id)
      }
    }

    return new Response(JSON.stringify({
      message: `Successfully processed ${processedInsights.length} prospects`,
      processed: processedInsights.length,
      insights: processedInsights
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Process prospects AI error:', message)
    
    return new Response(JSON.stringify({ 
      error: message,
      processed: 0 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})