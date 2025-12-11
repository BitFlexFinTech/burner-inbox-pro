import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User,
  Mail,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  ArrowLeft,
  Crown,
  Trash2,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [currentPlan] = useState<"free" | "pro">("free");
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    realtime: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant={currentPlan === "pro" ? "neon" : "default"}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        currentPlan === "pro" ? "bg-primary/20" : "bg-muted"
                      }`}>
                        <Crown className={`h-5 w-5 ${
                          currentPlan === "pro" ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>
                          {currentPlan === "pro"
                            ? "Unlimited access to all features"
                            : "Limited to 1 inbox"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={currentPlan === "pro" ? "pro" : "free"}>
                      {currentPlan.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentPlan === "free" ? (
                    <Button variant="neon" asChild>
                      <Link to="/pricing">Upgrade to Pro - $5/mo</Link>
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline">Manage Subscription</Button>
                      <Button variant="ghost" className="text-destructive">
                        Cancel Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>Your account information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue="Demo User" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="demo.user@demoinbox.app"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave}>Save Changes</Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>
                        Configure how you receive updates
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Browser notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.browser}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, browser: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real-time updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Live message streaming
                      </p>
                    </div>
                    <Switch
                      checked={notifications.realtime}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, realtime: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>Protect your account</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Update Email
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Payment Methods
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-destructive/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle>Danger Zone</CardTitle>
                      <CardDescription>
                        Irreversible actions for your account
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out All Devices
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
