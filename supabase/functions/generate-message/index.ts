import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prospect, campaign, messageType, profileAnalysis } = await req.json()
    
    // Simulate AI message generation (in real implementation, use OpenAI API)
    const messageTemplates = {
      connection: [
        `Hi ${prospect.name}, I noticed your experience in ${campaign.target_industry} at ${prospect.company}. I work with companies like yours helping with ${campaign.product_service}. Would love to connect and share some insights!`,
        `Hello ${prospect.name}, your background in ${prospect.job_title} caught my attention. I specialize in helping ${campaign.target_industry} companies with ${campaign.product_service}. Let's connect!`,
        `Hi ${prospect.name}, saw your recent post about ${campaign.target_industry}. I help companies like ${prospect.company} with ${campaign.product_service}. Would be great to connect and exchange ideas!`
      ],
      follow_up_1: [
        `Hi ${prospect.name}, I sent a connection request last week about ${campaign.product_service}. Just wanted to follow up - would you be interested in a quick 15-minute chat about how we're helping ${campaign.target_industry} companies?`,
        `Hello ${prospect.name}, following up on my connection request. I've been working with similar ${prospect.job_title}s in ${campaign.target_industry} on ${campaign.product_service}. Would love to share some insights with you.`
      ],
      follow_up_2: [
        `Hi ${prospect.name}, I know you're busy, but wanted to share a quick success story. We recently helped a ${campaign.target_industry} company similar to ${prospect.company} achieve great results with ${campaign.product_service}. Interested in learning more?`,
        `Hello ${prospect.name}, just wanted to reach out one more time about ${campaign.product_service}. If now isn't the right time, I completely understand. Feel free to reach out when it makes sense for you.`
      ],
      follow_up_3: [
        `Hi ${prospect.name}, this will be my last message. I really believe ${campaign.product_service} could benefit ${prospect.company}. If you're ever interested in learning more, feel free to reach out. Best of luck with your ${campaign.target_industry} initiatives!`
      ]
    }

    const messages = messageTemplates[messageType] || []
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)]

    // Adjust tone based on brand voice
    let finalMessage = selectedMessage
    if (campaign.brand_voice === 'formal') {
      finalMessage = selectedMessage.replace(/Hi /g, 'Dear ').replace(/!/g, '.')
    } else if (campaign.brand_voice === 'enthusiastic') {
      finalMessage = selectedMessage + ' 🚀'
    }

    return new Response(JSON.stringify({ 
      message: finalMessage,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100
      personalizationScore: Math.floor(Math.random() * 30) + 70 // 70-100
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})