import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  Send, 
  Eye, 
  ThumbsUp,
  Calendar,
  Brain,
  BarChart3,
  Settings
} from "lucide-react";
import { DiagnosticPanel } from "./DiagnosticPanel";
import { useState } from "react";

export const Dashboard = () => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const campaigns = [
    {
      id: 1,
      name: "HR SaaS Outreach",
      status: "active",
      sent: 45,
      responses: 18,
      responseRate: 40,
      prospects: 72
    },
    {
      id: 2,
      name: "Tech CTO Campaign",
      status: "completed", 
      sent: 120,
      responses: 35,
      responseRate: 29,
      prospects: 150
    }
  ];

  const recentMessages = [
    {
      prospect: "Anjali Mehta",
      company: "HirePulse",
      role: "HR Manager",
      message: "Hi Anjali, loved your recent post on hybrid hiring...",
      status: "sent",
      time: "2 hours ago"
    },
    {
      prospect: "Rahul Sharma", 
      company: "TechFlow",
      role: "CTO",
      message: "Hi Rahul, noticed your team is expanding...",
      status: "replied",
      time: "4 hours ago"
    }
  ];

  return (
    <section className="py-20 bg-gradient-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-accent/50 rounded-full px-4 py-2 border border-accent mb-6">
            <BarChart3 className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">Campaign Dashboard</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Track Your 
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Outreach Performance</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Monitor response rates, analyze prospect engagement, and optimize your campaigns in real-time.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="ml-4"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
            </Button>
          </div>
        </div>

        {/* Diagnostics Panel */}
        {showDiagnostics && (
          <div className="mb-8">
            <DiagnosticPanel />
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft bg-gradient-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Prospects</p>
                  <p className="text-3xl font-bold text-foreground">1,247</p>
                  <p className="text-xs text-success flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% this week
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-gradient-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages Sent</p>
                  <p className="text-3xl font-bold text-foreground">892</p>
                  <p className="text-xs text-success flex items-center">
                    <Send className="h-3 w-3 mr-1" />
                    165 today
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-gradient-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-3xl font-bold text-foreground">34%</p>
                  <p className="text-xs text-success flex items-center">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Above average
                  </p>
                </div>
                <Target className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-gradient-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Meetings Booked</p>
                  <p className="text-3xl font-bold text-foreground">47</p>
                  <p className="text-xs text-success flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    8 this week
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Campaigns */}
          <Card className="shadow-medium bg-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                Active Campaigns
              </CardTitle>
              <CardDescription>Monitor your ongoing outreach campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{campaign.name}</h4>
                    <Badge 
                      variant={campaign.status === 'active' ? 'default' : 'secondary'}
                      className={campaign.status === 'active' ? 'bg-success text-white' : ''}
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Prospects Found</p>
                      <p className="font-semibold">{campaign.prospects}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Messages Sent</p>
                      <p className="font-semibold">{campaign.sent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Responses</p>
                      <p className="font-semibold text-success">{campaign.responses}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response Rate</p>
                      <p className="font-semibold text-success">{campaign.responseRate}%</p>
                    </div>
                  </div>
                  <Progress 
                    value={(campaign.sent / campaign.prospects) * 100} 
                    className="mt-3 h-2"
                  />
                </div>
              ))}
              <Button variant="primary" className="w-full">
                Create New Campaign
              </Button>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="shadow-medium bg-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Recent Messages
              </CardTitle>
              <CardDescription>Latest outreach activity and responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMessages.map((message, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{message.prospect}</h4>
                      <p className="text-sm text-muted-foreground">{message.role} at {message.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={message.status === 'replied' ? 'default' : 'secondary'}
                        className={message.status === 'replied' ? 'bg-success text-white' : ''}
                      >
                        {message.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{message.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded border">
                    "{message.message}"
                  </p>
                  <div className="flex items-center space-x-2 mt-3">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Send className="h-4 w-4 mr-1" />
                      Follow Up
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};