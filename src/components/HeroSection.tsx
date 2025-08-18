import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Target } from "lucide-react";
import heroImage from "@/assets/hero-automation.jpg";

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-surface py-20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-accent/50 rounded-full px-4 py-2 border border-accent">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
              <span className="text-sm font-medium text-accent-foreground">AI-Powered Sales Automation</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Transform Your
              <span className="bg-gradient-primary bg-clip-text text-transparent"> LinkedIn </span>
              Outreach
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Generate hyper-personalized messages, automate prospect analysis, and scale your LinkedIn outreach with AI. 
              Close more deals while saving 10+ hours per week.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="secondary" size="lg">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">5000+ Sales Professionals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-success" />
                <span className="text-sm text-muted-foreground">89% Response Rate</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-strong">
              <img 
                src={heroImage} 
                alt="LinkedIn AI Automation Dashboard" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -inset-4 bg-gradient-primary opacity-20 rounded-3xl blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};