import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Inbox, Settings, LogOut, Crown, Phone, MessageSquare, Plus, RefreshCw, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/hooks/useQuota";
import { FeatureGate } from "@/components/FeatureGate";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function SMSDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isUnlimited } = useQuota();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPlan = user?.plan || "free";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }
    setLoading(false);
  }, [authLoading, isAuthenticated]);

  const SMSUpgradePrompt = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">SMS Features</CardTitle>
          <p className="text-muted-foreground mt-2">Unlock virtual phone numbers and SMS verification</p>
        </CardHeader>
        <CardContent>
          <Button variant="neon" className="w-full" asChild>
            <Link to="/pricing">Upgrade to Premium</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Burner<span className="text-primary">MAIL</span></span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
          <Inbox className="h-4 w-4" />Inboxes
        </Link>
        <Link to="/sms" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="h-4 w-4" />SMS<Badge variant="pro" className="ml-auto text-[10px]">PRO</Badge>
        </Link>
        <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
          <Settings className="h-4 w-4" />Settings
        </Link>
      </nav>
      <div className="p-4 border-t border-border/50">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Badge variant={currentPlan === "free" ? "free" : "pro"}>
            {currentPlan !== "free" && <Crown className="w-3 h-3 mr-1" />}{currentPlan.toUpperCase()}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2 mb-3">{isUnlimited ? "Unlimited SMS" : "Upgrade for SMS"}</p>
          {currentPlan === "free" && <Button variant="neon" size="sm" className="w-full" asChild><Link to="/pricing">Upgrade</Link></Button>}
        </div>
        <Button variant="ghost" className="w-full mt-4 justify-start text-muted-foreground" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />Sign Out
        </Button>
      </div>
    </>
  );

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex">
        <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border/50 bg-card/30 backdrop-blur-xl">
          <SidebarContent />
        </aside>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0"><SidebarContent /></SheetContent>
        </Sheet>

        <main className="flex-1 min-h-screen flex flex-col">
          <FeatureGate feature="sms" fallback={<SMSUpgradePrompt />}>
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">SMS Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Receive SMS verification codes</p>
                  </div>
                </div>
                <Button variant="neon"><Plus className="h-4 w-4 mr-2" />New Number</Button>
              </div>
            </header>

            <div className="flex-1 p-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-primary" />Your Phone Numbers</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No phone numbers provisioned yet</p>
                    <Button variant="outline" size="sm" className="mt-2">Provision Number</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FeatureGate>
        </main>
      </div>
    </div>
  );
}
