import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Inbox,
  Settings,
  LogOut,
  Copy,
  Search,
  RefreshCw,
  Crown,
  Phone,
  MessageSquare,
  Code,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Forward,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/hooks/useQuota";
import { db } from "@/lib/mockDatabase";
import { FeatureGate } from "@/components/FeatureGate";
import { mockDataGenitService } from "@/services/sms/mockDataGenitService";
import type { SMSMessage } from "@/types/database";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PhoneNumber {
  number: string;
  country: string;
  carrier: string;
  expiresAt: string;
}

interface UsageStats {
  smsReceived: number;
  smsForwarded: number;
  activeNumbers: number;
  monthlyLimit: number;
}

export default function SMSDashboard() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { isUnlimited } = useQuota();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNumber, setFilterNumber] = useState<string | null>(null);
  const [provisioning, setProvisioning] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState<string | null>(null);

  const currentPlan = user?.plan || "free";

  // Load data
  useEffect(() => {
    loadSMSData();
  }, [user?.id]);

  const loadSMSData = async () => {
    setLoading(true);
    try {
      // Load phone numbers (mock - one number per user)
      const existingNumber = await mockDataGenitService.provisionPhoneNumber(user?.id || "guest");
      setPhoneNumbers([existingNumber]);

      // Load SMS messages from database
      const allMessages = db.getAllSMSMessages(user?.id || "guest");
      setSmsMessages(allMessages);

      // Load usage stats
      const stats = await mockDataGenitService.getUsageStats(user?.id || "guest");
      setUsageStats(stats);
    } catch (error) {
      toast({
        title: "Error loading SMS data",
        description: "Failed to load SMS messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const provisionNewNumber = async () => {
    setProvisioning(true);
    try {
      const newNumber = await mockDataGenitService.provisionPhoneNumber(user?.id || "guest");
      setPhoneNumbers((prev) => [...prev, newNumber]);
      toast({
        title: "Phone number provisioned!",
        description: `${newNumber.number} is now active.`,
      });
    } catch (error) {
      toast({
        title: "Failed to provision number",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setProvisioning(false);
    }
  };

  const releaseNumber = async (phoneNumber: string) => {
    try {
      await mockDataGenitService.releasePhoneNumber(phoneNumber);
      setPhoneNumbers((prev) => prev.filter((p) => p.number !== phoneNumber));
      toast({
        title: "Phone number released",
        description: "The number has been released.",
      });
    } catch (error) {
      toast({
        title: "Failed to release number",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setShowReleaseDialog(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const filteredMessages = useMemo(() => {
    return smsMessages.filter((msg) => {
      const matchesSearch =
        msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.fromNumber.includes(searchQuery);
      const matchesFilter = !filterNumber || msg.phoneNumber === filterNumber;
      return matchesSearch && matchesFilter;
    });
  }, [smsMessages, searchQuery, filterNumber]);

  const formatTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
  };

  const formatExpiration = (dateString: string) => {
    const diff = new Date(dateString).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  // SMS upgrade prompt for free users
  const SMSUpgradePrompt = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-md w-full border-primary/20 bg-card/50 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">SMS Features</CardTitle>
          <p className="text-muted-foreground mt-2">
            Unlock virtual phone numbers and SMS verification code extraction
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-neon-green" />
              <span className="text-sm">Virtual US phone numbers</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-neon-green" />
              <span className="text-sm">Auto-extract verification codes</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-neon-green" />
              <span className="text-sm">Forward SMS to email</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-neon-green" />
              <span className="text-sm">API access for automation</span>
            </div>
          </div>
          <Button variant="neon" className="w-full shimmer" asChild>
            <Link to="/pricing">
              Upgrade to Premium
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

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
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <Inbox className="h-4 w-4" />
              Inboxes
            </Link>
            <Link
              to="/sms"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary"
            >
              <MessageSquare className="h-4 w-4" />
              SMS
              <Badge variant="pro" className="ml-auto text-[10px]">
                PRO
              </Badge>
            </Link>
            <Link
              to="/api-docs"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <Code className="h-4 w-4" />
              API Docs
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
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={currentPlan === "free" ? "free" : "pro"}>
                  {currentPlan !== "free" && <Crown className="w-3 h-3 mr-1" />}
                  {currentPlan.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {isUnlimited ? "Unlimited SMS access" : "Upgrade for SMS features"}
              </p>
              {currentPlan === "free" && (
                <Button variant="neon" size="sm" className="w-full" asChild>
                  <Link to="/pricing">Upgrade</Link>
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4 justify-start text-muted-foreground"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen flex flex-col">
          <FeatureGate feature="sms" fallback={<SMSUpgradePrompt />}>
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
              <div className="flex items-center justify-between p-4">
                <div>
                  <h1 className="text-2xl font-bold">SMS Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Receive SMS verification codes on virtual phone numbers
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={loadSMSData}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant="neon"
                    onClick={provisionNewNumber}
                    disabled={provisioning}
                    className="shimmer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {provisioning ? "Provisioning..." : "New Number"}
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-4 space-y-6">
              {/* Phone Numbers Card */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Your Phone Numbers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : phoneNumbers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No phone numbers provisioned</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={provisionNewNumber}
                      >
                        Provision Number
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {phoneNumbers.map((phone) => (
                        <div
                          key={phone.number}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                            <div>
                              <p className="font-mono font-medium">{phone.number}</p>
                              <p className="text-xs text-muted-foreground">
                                {phone.country} · {phone.carrier}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatExpiration(phone.expiresAt)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyToClipboard(phone.number, "Phone number")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setShowReleaseDialog(phone.number)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Search & Filter */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search SMS messages..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {phoneNumbers.length > 1 && (
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={filterNumber || ""}
                    onChange={(e) => setFilterNumber(e.target.value || null)}
                  >
                    <option value="">All Numbers</option>
                    {phoneNumbers.map((p) => (
                      <option key={p.number} value={p.number}>
                        {p.number}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* SMS Message List */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    SMS Messages
                    <Badge variant="outline" className="ml-2">
                      {filteredMessages.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No SMS messages yet</p>
                      <p className="text-sm mt-1">
                        Messages will appear here when received
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {filteredMessages.map((msg, index) => {
                        const code = mockDataGenitService.extractVerificationCode(msg.body);
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className={`flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors ${
                              !msg.isRead ? "bg-primary/5" : ""
                            }`}
                          >
                            {/* Status */}
                            <div className="pt-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  !msg.isRead ? "bg-neon-green animate-pulse" : "bg-muted-foreground/50"
                                }`}
                              />
                            </div>

                            {/* From Number */}
                            <div className="w-32 flex-shrink-0">
                              <p className="font-mono text-sm truncate">{msg.fromNumber}</p>
                              <p className="text-xs text-muted-foreground">{formatTime(msg.receivedAt)}</p>
                            </div>

                            {/* Message Body */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm line-clamp-2">{msg.body}</p>
                            </div>

                            {/* Verification Code Badge */}
                            {code && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(code, "Verification code")}
                                className="flex-shrink-0 font-mono text-neon-green border-neon-green/30 hover:bg-neon-green/10"
                              >
                                <Copy className="h-3 w-3 mr-1.5" />
                                {code}
                              </Button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              {usageStats && (
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold text-primary">{usageStats.smsReceived}</p>
                        <p className="text-xs text-muted-foreground">SMS Received</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold text-primary">{usageStats.smsForwarded}</p>
                        <p className="text-xs text-muted-foreground">SMS Forwarded</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold text-primary">{usageStats.activeNumbers}</p>
                        <p className="text-xs text-muted-foreground">Active Numbers</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold text-primary">{usageStats.monthlyLimit}</p>
                        <p className="text-xs text-muted-foreground">Monthly Limit</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Usage</span>
                        <span>
                          {usageStats.smsReceived} / {usageStats.monthlyLimit}
                        </span>
                      </div>
                      <Progress
                        value={(usageStats.smsReceived / usageStats.monthlyLimit) * 100}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </FeatureGate>
        </main>
      </div>

      {/* Release Number Dialog */}
      <AlertDialog open={!!showReleaseDialog} onOpenChange={() => setShowReleaseDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Phone Number?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently release {showReleaseDialog} and you won't be able to receive
              SMS on it anymore. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showReleaseDialog && releaseNumber(showReleaseDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Release Number
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}