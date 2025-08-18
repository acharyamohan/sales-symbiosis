import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Features } from "@/components/Features";
import { CampaignForm } from "@/components/CampaignForm";
import { CampaignList } from "@/components/CampaignList";
import { Dashboard } from "@/components/Dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="create">Create Campaign</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="campaigns" className="space-y-6">
            <CampaignList />
          </TabsContent>
          
          <TabsContent value="create" className="space-y-6">
            <CampaignForm />
          </TabsContent>
          
          <TabsContent value="about" className="space-y-6">
            <HeroSection />
            <Features />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-12">
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
