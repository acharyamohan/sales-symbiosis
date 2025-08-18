import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Features } from "@/components/Features";
import { CampaignForm } from "@/components/CampaignForm";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <Features />
      <CampaignForm />
      <Dashboard />
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            © 2024 LinkedinAI Pro. All rights reserved. 
            <span className="text-primary ml-2">Transform your outreach today.</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
