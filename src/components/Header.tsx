import { Button } from "@/components/ui/button";
import { Target, Users, BarChart3 } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">LinkedinAI Pro</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost">Sign In</Button>
            <Button variant="primary">Start Free Trial</Button>
          </div>
        </div>
      </div>
    </header>
  );
};