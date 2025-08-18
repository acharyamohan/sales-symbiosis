import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Play, Pause, MoreHorizontal, Users, MessageSquare, TrendingUp } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Campaign = {
  id: string
  name: string
  product_service: string
  target_industry: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  created_at: string
}

export function CampaignList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCampaigns()
    }
  }, [user])

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch campaigns.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId)

      if (error) throw error

      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, status: newStatus as any } : c
      ))

      toast({
        title: 'Campaign Updated',
        description: `Campaign status changed to ${newStatus}.`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update campaign.',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusAction = (campaign: Campaign) => {
    if (campaign.status === 'active') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateCampaignStatus(campaign.id, 'paused')}
        >
          <Pause className="w-4 h-4 mr-1" />
          Pause
        </Button>
      )
    } else if (campaign.status === 'paused' || campaign.status === 'draft') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateCampaignStatus(campaign.id, 'active')}
        >
          <Play className="w-4 h-4 mr-1" />
          Start
        </Button>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Campaigns</h2>
        <Badge variant="outline" className="text-muted-foreground">
          {campaigns.length} total
        </Badge>
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first campaign to start automating your LinkedIn outreach.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>{campaign.target_industry}</span>
                      <span>•</span>
                      <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(campaign.status)} text-white border-0`}
                    >
                      {campaign.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete Campaign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-3 h-3" />
                      Prospects
                    </div>
                    <p className="text-lg font-semibold">12</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="w-3 h-3" />
                      Messages Sent
                    </div>
                    <p className="text-lg font-semibold">8</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      Response Rate
                    </div>
                    <p className="text-lg font-semibold">25%</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Progress</div>
                    <Progress value={33} className="h-2" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {campaign.product_service}
                  </p>
                  {getStatusAction(campaign)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}