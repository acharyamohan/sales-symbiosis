import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Zap, 
  Target,
  Search,
  Clock,
  Shield
} from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Profile Analyzer",
      description: "Advanced NLP analyzes LinkedIn profiles, posts, and work history to identify the perfect prospects and conversation starters.",
      highlight: "98% accuracy"
    },
    {
      icon: MessageSquare,
      title: "Hyper-Personalized Messaging",
      description: "GPT-powered message generation creates unique, contextual outreach that feels genuinely human and relevant.",
      highlight: "3x higher response rates"
    },
    {
      icon: Target,
      title: "Smart Prospecting",
      description: "Intelligent filtering based on your ICP, recent activity, job changes, and behavioral triggers for optimal timing.",
      highlight: "10x faster prospecting"
    },
    {
      icon: Clock,
      title: "Automated Sequences",
      description: "Human-like delays and follow-up sequences that maintain authenticity while scaling your outreach efforts.",
      highlight: "Save 10+ hours/week"
    },
    {
      icon: BarChart3,
      title: "Response Dashboard",
      description: "Real-time analytics on connection rates, response rates, and campaign ROI with actionable insights.",
      highlight: "Data-driven optimization"
    },
    {
      icon: Shield,
      title: "LinkedIn Safe",
      description: "Built-in safety measures and rate limiting ensure your LinkedIn account stays secure and compliant.",
      highlight: "100% compliant"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-accent/50 rounded-full px-4 py-2 border border-accent mb-6">
            <Zap className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">Powerful Features</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything You Need to 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Dominate LinkedIn</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform combines advanced prospect analysis, personalized messaging, 
            and intelligent automation to transform your LinkedIn outreach.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="shadow-soft bg-gradient-card border-0 hover:shadow-medium transition-all duration-300 group hover:-translate-y-1"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <div className="inline-block bg-accent/80 text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
                  {feature.highlight}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample Conversation Flow */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              See It In Action
            </h3>
            <p className="text-lg text-muted-foreground">
              Watch how our AI analyzes prospects and crafts personalized messages
            </p>
          </div>

          <Card className="max-w-4xl mx-auto shadow-strong bg-gradient-card border-0">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-muted-foreground/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">User Input</span>
                  </div>
                  <p className="text-foreground">
                    "Looking to pitch our HR SaaS to 50-200 employee firms in India. Focus on HR heads. Friendly tone."
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-px h-8 bg-gradient-primary"></div>
                </div>

                <div className="bg-accent/20 p-4 rounded-lg border border-accent">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-4 w-4 text-accent-foreground" />
                    <span className="text-sm font-medium text-accent-foreground">AI Analysis</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Top prospects found:</span> 72
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Best match:</span> Anjali Mehta, HR Manager @HirePulse
                    </p>
                    <div className="bg-background p-3 rounded border">
                      <p className="text-sm text-muted-foreground mb-2">Generated Message:</p>
                      <p className="text-foreground">
                        "Hi Anjali, loved your recent post on hybrid hiring. I work with startups helping HRs 
                        simplify onboarding with our AI tool. Thought it could be a great fit — open to a quick chat?"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};