import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Mail, 
  Inbox, 
  Settings, 
  LogOut,
  Copy,
  Trash2,
  Search,
  RefreshCw,
  Crown,
  MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for demo
const mockInboxes = [
  {
    id: "1",
    email: "netflix_test_7x9@demoinbox.app",
    messageCount: 3,
    lastActivity: "2 min ago",
    active: true,
  },
  {
    id: "2",
    email: "spotify_trial_42@demoinbox.app",
    messageCount: 1,
    lastActivity: "1 hour ago",
    active: false,
  },
  {
    id: "3",
    email: "github_signup_88@demoinbox.app",
    messageCount: 5,
    lastActivity: "3 hours ago",
    active: false,
  },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [inboxes, setInboxes] = useState(mockInboxes);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPlan] = useState<"free" | "pro">("free");

  const filteredInboxes = inboxes.filter((inbox) =>
    inbox.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createInbox = () => {
    if (currentPlan === "free" && inboxes.length >= 1) {
      toast({
        title: "Inbox limit reached",
        description: "Upgrade to Pro for unlimited inboxes.",
        variant: "destructive",
      });
      return;
    }

    const randomWord = ["alpha", "beta", "gamma", "delta", "omega"][
      Math.floor(Math.random() * 5)
    ];
    const randomDigits = Math.floor(Math.random() * 900) + 100;
    const newEmail = `${randomWord}_${randomDigits}@demoinbox.app`;

    setInboxes([
      {
        id: Date.now().toString(),
        email: newEmail,
        messageCount: 0,
        lastActivity: "Just now",
        active: true,
      },
      ...inboxes,
    ]);

    toast({
      title: "Inbox created!",
      description: newEmail,
    });
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({
      title: "Copied!",
      description: "Email address copied to clipboard.",
    });
  };

  const deleteInbox = (id: string) => {
    setInboxes(inboxes.filter((inbox) => inbox.id !== id));
    toast({
      title: "Inbox deleted",
      description: "The inbox has been permanently removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border/50 bg-card/30 backdrop-blur-xl">
          <div className="p-4 border-b border-border/50">
            <Link to="/" className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                Burner<span className="text-primary">MAIL</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary"
            >
              <Inbox className="h-4 w-4" />
              Inboxes
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>

          <div className="p-4 border-t border-border/50">
            <Card variant="neon" className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={currentPlan === "pro" ? "pro" : "free"}>
                  {currentPlan === "pro" && <Crown className="w-3 h-3 mr-1" />}
                  {currentPlan.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {currentPlan === "free"
                  ? "1 inbox limit"
                  : "Unlimited inboxes"}
              </p>
              {currentPlan === "free" && (
                <Button variant="neon" size="sm" className="w-full" asChild>
                  <Link to="/pricing">Upgrade</Link>
                </Button>
              )}
            </Card>

            <Button
              variant="ghost"
              className="w-full mt-4 justify-start text-muted-foreground"
              asChild
            >
              <Link to="/auth">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-2xl font-bold">Your Inboxes</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your disposable email addresses
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="neon"
                  onClick={createInbox}
                  className="shimmer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Inbox
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inboxes..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Inbox Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredInboxes.map((inbox, index) => (
                <motion.div
                  key={inbox.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    variant={inbox.active ? "neon" : "default"}
                    className="group cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              inbox.active
                                ? "bg-neon-green animate-pulse"
                                : "bg-muted-foreground"
                            }`}
                          />
                          <Badge variant="outline" className="text-xs">
                            {inbox.messageCount} messages
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Link to={`/inbox/${inbox.id}`}>
                        <p className="font-mono text-sm mb-2 truncate hover:text-primary transition-colors">
                          {inbox.email}
                        </p>
                      </Link>
                      <p className="text-xs text-muted-foreground mb-4">
                        Last activity: {inbox.lastActivity}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => copyEmail(inbox.email)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteInbox(inbox.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Create New Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filteredInboxes.length * 0.05 }}
              >
                <Card
                  variant="glass"
                  className="h-full min-h-[200px] flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group"
                  onClick={createInbox}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium">Create New Inbox</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Generate a new disposable email
                    </p>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Empty State */}
            {filteredInboxes.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No inboxes found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
