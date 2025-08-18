import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export const CampaignForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: "",
    product: "",
    industry: "",
    jobRoles: "",
    companySize: "",
    region: "",
    goal: "",
    brandVoice: "",
    triggers: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      return toast({
        title: "Sign in required",
        description: "Please sign in to create a campaign.",
        variant: "destructive",
      });
    }

    // Basic validation
    if (!campaignData.name || !campaignData.product || !campaignData.industry) {
      return toast({
        title: "Missing details",
        description: "Please fill in campaign name, product/service, and industry.",
        variant: "destructive",
      });
    }

    setSubmitting(true);
    try {
      const idealJobRoles = campaignData.jobRoles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
      const optionalTriggers = campaignData.triggers
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { error } = await supabase.from("campaigns").insert({
        user_id: user.id,
        name: campaignData.name,
        product_service: campaignData.product,
        target_industry: campaignData.industry,
        ideal_job_roles: idealJobRoles,
        company_size: campaignData.companySize,
        region: campaignData.region,
        outreach_goal: campaignData.goal,
        brand_voice: campaignData.brandVoice,
        optional_triggers: optionalTriggers,
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "Campaign created",
        description: "Your campaign was created successfully.",
      });

      // notify lists to refresh
      window.dispatchEvent(new CustomEvent("campaign:created"));

      // reset
      setCampaignData({
        name: "",
        product: "",
        industry: "",
        jobRoles: "",
        companySize: "",
        region: "",
        goal: "",
        brandVoice: "",
        triggers: "",
      });
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : String(err);
      console.error("Create campaign error:", err);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-accent/50 rounded-full px-4 py-2 border border-accent mb-6">
            <Target className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">Campaign Setup</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Create Your AI-Powered 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Outreach Campaign</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Define your ideal prospects and let our AI generate personalized messages that get responses.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-medium bg-gradient-card border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Campaign Configuration</CardTitle>
            <CardDescription>
              Provide details about your offering and target audience for better AI personalization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., US HR Leaders Outreach"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Product/Service *</Label>
                  <Input
                    id="product"
                    placeholder="e.g., HR SaaS Platform, Marketing Automation Tool"
                    value={campaignData.product}
                    onChange={(e) => setCampaignData({...campaignData, product: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Target Industry</Label>
                  <Select onValueChange={(value) => setCampaignData({...campaignData, industry: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saas">SaaS & Technology</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="edtech">EdTech</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobRoles">Ideal Job Roles</Label>
                  <Input
                    id="jobRoles"
                    placeholder="e.g., CTO, Head of HR, Growth Manager"
                    value={campaignData.jobRoles}
                    onChange={(e) => setCampaignData({...campaignData, jobRoles: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select onValueChange={(value) => setCampaignData({...campaignData, companySize: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-50)</SelectItem>
                      <SelectItem value="sme">SME (50-200)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (200+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Region/Location</Label>
                  <Select onValueChange={(value) => setCampaignData({...campaignData, region: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal">Outreach Goal</Label>
                  <Select onValueChange={(value) => setCampaignData({...campaignData, goal: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Book a Demo</SelectItem>
                      <SelectItem value="call">Schedule a Call</SelectItem>
                      <SelectItem value="hire">Hire Talent</SelectItem>
                      <SelectItem value="network">Networking</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brandVoice">Brand Voice & Tone</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["Formal", "Friendly", "Enthusiastic", "Professional", "Casual"].map((tone) => (
                    <Badge 
                      key={tone}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                      onClick={() => setCampaignData({...campaignData, brandVoice: tone})}
                    >
                      {tone}
                    </Badge>
                  ))}
                </div>
                <Input
                  id="brandVoice"
                  placeholder="Describe your preferred communication style"
                  value={campaignData.brandVoice}
                  onChange={(e) => setCampaignData({...campaignData, brandVoice: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="triggers">Optional Triggers</Label>
                <Textarea
                  id="triggers"
                  placeholder="e.g., Job change, hiring post, new funding, specific company events"
                  value={campaignData.triggers}
                  onChange={(e) => setCampaignData({...campaignData, triggers: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-center pt-6">
                <Button type="submit" variant="primary" size="lg" className="group" disabled={submitting}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate AI Campaign
                  <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};