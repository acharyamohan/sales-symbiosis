import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { 
  Brain, 
  Target, 
  MessageCircle, 
  Clock, 
  Crown, 
  Zap,
  RefreshCw,
  Sparkles,
  TrendingUp
} from "lucide-react"

interface ProspectInsight {
  id: string
  name: string
  title: string
  company: string
  linkedin_url: string
  ai_insights?: {
    personality_traits: string[]
    engagement_score: number
    pain_points: string[]
    recommended_approach: string
    personalized_hooks: string[]
    best_contact_time: string
    decision_maker_score: number
    ai_summary: string
  }
  ai_processed: boolean
}

interface ProspectInsightsProps {
  campaignId: string
}

export const ProspectInsights = ({ campaignId }: ProspectInsightsProps) => {
  const [prospects, setProspects] = useState<ProspectInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { user } = useAuth()

  const fetchProspects = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('id, name, title, company, linkedin_url, ai_insights, ai_processed')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProspects(data || [])
    } catch (error) {
      console.error('Error fetching prospects:', error)
      toast.error('Failed to load prospects')
    } finally {
      setLoading(false)
    }
  }

  const processWithAI = async () => {
    if (!user) return
    
    setProcessing(true)
    try {
      const { data, error } = await supabase.functions.invoke('process-prospects-ai', {
        body: { campaignId, batchSize: 10 }
      })

      if (error) throw error

      toast.success(`Processed ${data.processed} prospects with AI insights`)
      await fetchProspects() // Refresh the data
    } catch (error) {
      console.error('Error processing prospects:', error)
      toast.error('Failed to process prospects with AI')
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    fetchProspects()
  }, [campaignId, user])

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-muted-foreground'
  }

  const processedProspects = prospects.filter(p => p.ai_processed && p.ai_insights)
  const unprocessedCount = prospects.filter(p => !p.ai_processed).length

  return (
    <div className="space-y-6">
      <Card className="shadow-medium bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                AI Prospect Insights
              </CardTitle>
              <CardDescription>
                Mistral AI-powered analysis of your prospects
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              {unprocessedCount > 0 && (
                <Badge variant="secondary" className="bg-accent/20">
                  {unprocessedCount} pending analysis
                </Badge>
              )}
              <Button 
                onClick={processWithAI}
                disabled={processing || unprocessedCount === 0}
                size="sm"
              >
                {processing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {processing ? 'Processing...' : 'Analyze with AI'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-muted/50 rounded-lg" />
                </div>
              ))}
            </div>
          ) : processedProspects.length > 0 ? (
            <div className="grid gap-4">
              {processedProspects.map((prospect) => (
                <Card key={prospect.id} className="bg-muted/30 border border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{prospect.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {prospect.title} at {prospect.company}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {prospect.ai_insights?.ai_summary}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getEngagementColor(prospect.ai_insights?.engagement_score || 0)}`}>
                            {prospect.ai_insights?.engagement_score || 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">Engagement</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getEngagementColor(prospect.ai_insights?.decision_maker_score || 0)}`}>
                            {prospect.ai_insights?.decision_maker_score || 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">Authority</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <Target className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm font-medium">Personality Traits</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prospect.ai_insights?.personality_traits.map((trait, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm font-medium">Pain Points</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prospect.ai_insights?.pain_points.map((point, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm font-medium">Conversation Hooks</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {prospect.ai_insights?.personalized_hooks.map((hook, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                              {hook}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm font-medium">Best Contact Time</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {prospect.ai_insights?.best_contact_time}
                        </p>
                        <div className="flex items-center mb-2 mt-3">
                          <Zap className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm font-medium">Recommended Approach</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {prospect.ai_insights?.recommended_approach}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center space-x-4">
                        <div>
                          <Progress 
                            value={prospect.ai_insights?.engagement_score || 0} 
                            className="w-24 h-2"
                          />
                          <span className="text-xs text-muted-foreground">Engagement Score</span>
                        </div>
                        <div>
                          <Progress 
                            value={prospect.ai_insights?.decision_maker_score || 0} 
                            className="w-24 h-2"
                          />
                          <span className="text-xs text-muted-foreground">Decision Authority</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Generate Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {unprocessedCount > 0 
                  ? "Click 'Analyze with AI' to generate insights for your prospects"
                  : "No prospects found for this campaign"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}