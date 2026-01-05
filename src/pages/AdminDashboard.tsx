import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { UserGrowthChart } from "@/components/admin/UserGrowthChart";
import { InboxActivityChart } from "@/components/admin/InboxActivityChart";
import { TranslationManager } from "@/components/admin/TranslationManager";
import { 
  LayoutDashboard, Users, Mail, DollarSign, Activity, TrendingUp, TrendingDown,
  Wallet, Bitcoin, Bug, MessageSquare, RefreshCw, ArrowLeft,
  CheckCircle, XCircle, Clock, Bell, Plug, Plus, Trash2, Edit, Loader2, Languages, AlertTriangle, Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NotificationType = 'banner' | 'toast' | 'modal';
type TargetAudience = 'all' | 'free' | 'premium' | 'enterprise';

interface SiteNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  target_audience: TargetAudience;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
}

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  connected_at: string | null;
  settings: Record<string, unknown>;
}

interface BugReport {
  id: string;
  reporter_id: string | null;
  reporter_email: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface SupportTicket {
  id: string;
  user_id: string | null;
  user_email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  ai_response: string | null;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminWallet {
  id: string;
  currency: string;
  network: string;
  address: string;
  is_active: boolean;
}

interface CryptoTransaction {
  id: string;
  user_id: string;
  currency: string;
  amount: string;
  amount_usd: number;
  status: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { effectiveIsAdmin, isLoading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "wallets" | "transactions" | "bugs" | "support" | "notifications" | "integrations" | "translations">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [adminWallets, setAdminWallets] = useState<AdminWallet[]>([]);
  const [notifications, setNotifications] = useState<SiteNotification[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);

  // UI states
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState<SiteNotification | null>(null);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'banner' as NotificationType, targetAudience: 'all' as TargetAudience, isActive: true });
  const [connectingIntegration, setConnectingIntegration] = useState<string | null>(null);
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponse, setTicketResponse] = useState("");

  // Verify admin access on mount
  useEffect(() => {
    const verifyAdmin = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        navigate('/auth');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: hasRole } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!hasRole) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setIsAdminVerified(true);
      loadAllData();
    };

    verifyAdmin();
  }, [authLoading, isAuthenticated, navigate]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadWallets(),
        loadNotifications(),
        loadIntegrations(),
        loadTransactions(),
        loadBugReports(),
        loadSupportTickets(),
        loadStats(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWallets = async () => {
    const { data } = await supabase.from('admin_wallets').select('*');
    if (data) setAdminWallets(data);
  };

  const loadNotifications = async () => {
    const { data } = await supabase.from('site_notifications').select('*').order('created_at', { ascending: false });
    if (data) setNotifications(data as SiteNotification[]);
  };

  const loadIntegrations = async () => {
    const { data } = await supabase.from('integrations').select('*');
    if (data) setIntegrations(data as Integration[]);
  };

  const loadTransactions = async () => {
    const { data } = await supabase.from('crypto_transactions').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setTransactions(data);
  };

  const loadBugReports = async () => {
    const { data } = await supabase.from('bug_reports').select('*').order('created_at', { ascending: false });
    if (data) setBugReports(data);
  };

  const loadSupportTickets = async () => {
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (data) setSupportTickets(data);
  };

  const loadStats = async () => {
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: inboxes } = await supabase.from('inboxes').select('*', { count: 'exact', head: true });
    setUserCount(users || 0);
    setInboxCount(inboxes || 0);
  };

  const saveWallet = async (walletId: string) => {
    await supabase.from('admin_wallets').update({ address: walletAddress }).eq('id', walletId);
    setEditingWallet(null);
    loadWallets();
    toast({ title: "Wallet updated", description: "Address saved successfully." });
  };

  const saveNotification = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (editingNotif) {
      await supabase.from('site_notifications').update({
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
        target_audience: notifForm.targetAudience,
        is_active: notifForm.isActive,
      }).eq('id', editingNotif.id);
    } else {
      await supabase.from('site_notifications').insert({
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
        target_audience: notifForm.targetAudience,
        is_active: notifForm.isActive,
        created_by: user?.id,
      });
    }
    
    setShowNotifModal(false);
    setEditingNotif(null);
    setNotifForm({ title: '', message: '', type: 'banner', targetAudience: 'all', isActive: true });
    loadNotifications();
    toast({ title: editingNotif ? "Notification updated" : "Notification created" });
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('site_notifications').delete().eq('id', id);
    loadNotifications();
    toast({ title: "Notification deleted" });
  };

  const toggleIntegration = async (integration: Integration) => {
    setConnectingIntegration(integration.id);
    
    const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';
    await supabase.from('integrations').update({ 
      status: newStatus, 
      connected_at: newStatus === 'connected' ? new Date().toISOString() : null 
    }).eq('id', integration.id);
    
    setConnectingIntegration(null);
    loadIntegrations();
    toast({ title: newStatus === 'connected' ? `${integration.name} connected` : `${integration.name} disconnected` });
  };

  const updateBugStatus = async (bugId: string, status: string) => {
    await supabase.from('bug_reports').update({ 
      status, 
      updated_at: new Date().toISOString(),
      resolved_at: status === 'resolved' ? new Date().toISOString() : null 
    }).eq('id', bugId);
    loadBugReports();
    setSelectedBug(null);
    toast({ title: "Bug status updated" });
  };

  const respondToTicket = async (ticketId: string) => {
    await supabase.from('support_tickets').update({ 
      admin_response: ticketResponse,
      status: 'resolved',
      updated_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
    }).eq('id', ticketId);
    setTicketResponse("");
    setSelectedTicket(null);
    loadSupportTickets();
    toast({ title: "Response sent" });
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "translations", label: "Translations", icon: Languages },
    { id: "wallets", label: "Wallet Config", icon: Wallet },
    { id: "transactions", label: "Crypto Payments", icon: Bitcoin },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Plug },
    { id: "bugs", label: "Bug Reports", icon: Bug },
    { id: "support", label: "Support Tickets", icon: MessageSquare },
  ];

  const kpis = [
    { title: "Monthly Revenue", value: "$0.00", change: "+0%", trend: "up", icon: DollarSign },
    { title: "Active Users", value: userCount.toString(), change: "+0%", trend: "up", icon: Users },
    { title: "Total Inboxes", value: inboxCount.toString(), change: "+0%", trend: "up", icon: Mail },
    { title: "Open Tickets", value: supportTickets.filter(t => t.status === 'open').length.toString(), change: "0", trend: "up", icon: Activity },
  ];

  // Show loading while verifying admin
  if (authLoading || !isAdminVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-secondary" />
          <span className="text-lg font-bold"><span className="text-secondary">Admin</span> Panel</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === item.id ? "bg-secondary/20 text-secondary" : "text-muted-foreground hover:bg-muted"}`}>
            <item.icon className="h-4 w-4" />{item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-border/50">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" />Back to App</Link>
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border/50 bg-card/30 backdrop-blur-xl">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Monitor and manage BurnerMail operations</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ModeToggle />
                <Badge variant="neon-green">Admin</Badge>
                <Button variant="outline" size="icon" onClick={loadAllData} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Overview */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {kpis.map((kpi, i) => (
                    <Card key={kpi.title} variant={i === 0 ? "neon" : "default"}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <kpi.icon className={`h-5 w-5 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                          <Badge variant={kpi.trend === "up" ? "neon-green" : "neon-orange"} className="text-xs">
                            {kpi.trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}{kpi.change}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold">{kpi.value}</p>
                        <p className="text-sm text-muted-foreground">{kpi.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="text-lg font-medium">Revenue Trend</CardTitle></CardHeader>
                    <CardContent><RevenueChart data={[]} /></CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-lg font-medium">User Growth</CardTitle></CardHeader>
                    <CardContent><UserGrowthChart data={[]} /></CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-lg font-medium">Inbox Activity</CardTitle></CardHeader>
                  <CardContent><InboxActivityChart data={[]} /></CardContent>
                </Card>
              </motion.div>
            )}

            {/* Wallets */}
            {activeTab === "wallets" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
                {adminWallets.map(wallet => (
                  <Card key={wallet.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">{wallet.currency} Wallet</CardTitle>
                      <CardDescription>Network: {wallet.network}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {editingWallet === wallet.id ? (
                        <>
                          <Input value={walletAddress} onChange={e => setWalletAddress(e.target.value)} className="font-mono text-sm" />
                          <div className="flex gap-2">
                            <Button onClick={() => saveWallet(wallet.id)}>Save</Button>
                            <Button variant="ghost" onClick={() => setEditingWallet(null)}>Cancel</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <code className="block p-3 bg-muted rounded-lg text-xs font-mono break-all">{wallet.address}</code>
                          <Button variant="outline" onClick={() => { setEditingWallet(wallet.id); setWalletAddress(wallet.address); }}>
                            <Edit className="h-4 w-4 mr-2" />Edit Address
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}

            {/* Transactions */}
            {activeTab === "transactions" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead className="border-b border-border"><tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Currency</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border">
                        {transactions.length === 0 ? (
                          <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No transactions yet</td></tr>
                        ) : transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-muted/30">
                            <td className="p-4 text-sm">{tx.user_id.slice(0, 8)}...</td>
                            <td className="p-4"><Badge variant={tx.currency === 'BTC' ? 'neon-orange' : 'neon-green'}>{tx.currency}</Badge></td>
                            <td className="p-4 text-sm font-mono">{tx.amount} (${tx.amount_usd})</td>
                            <td className="p-4"><Badge variant={tx.status === 'confirmed' ? 'neon-green' : tx.status === 'pending' ? 'neon-orange' : 'destructive'}>
                              {tx.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {tx.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {tx.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}{tx.status}
                            </Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Site Notifications</h2>
                  <Button variant="neon" onClick={() => { setEditingNotif(null); setNotifForm({ title: '', message: '', type: 'banner', targetAudience: 'all', isActive: true }); setShowNotifModal(true); }}>
                    <Plus className="h-4 w-4 mr-2" />Create Notification
                  </Button>
                </div>
                <div className="grid gap-4">
                  {notifications.map(n => (
                    <Card key={n.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{n.title}</span>
                            <Badge variant={n.is_active ? 'neon-green' : 'outline'}>{n.is_active ? 'Active' : 'Inactive'}</Badge>
                            <Badge variant="outline">{n.type}</Badge>
                            <Badge variant="outline">{n.target_audience}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{n.message}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { 
                            setEditingNotif(n); 
                            setNotifForm({ 
                              title: n.title, 
                              message: n.message, 
                              type: n.type, 
                              targetAudience: n.target_audience, 
                              isActive: n.is_active 
                            }); 
                            setShowNotifModal(true); 
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteNotification(n.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Integrations */}
            {activeTab === "integrations" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-semibold">Integrations</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {integrations.map(int => (
                    <Card key={int.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Plug className="h-5 w-5" /></div>
                          <div>
                            <p className="font-medium">{int.name}</p>
                            <Badge variant={int.status === 'connected' ? 'neon-green' : 'outline'}>{int.status}</Badge>
                          </div>
                        </div>
                        <Button variant={int.status === 'connected' ? 'outline' : 'neon'} size="sm" onClick={() => toggleIntegration(int)} disabled={connectingIntegration === int.id}>
                          {connectingIntegration === int.id ? <Loader2 className="h-4 w-4 animate-spin" /> : int.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Translations */}
            {activeTab === "translations" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TranslationManager />
              </motion.div>
            )}

            {/* Bug Reports */}
            {activeTab === "bugs" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Bug Reports</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{bugReports.filter(b => b.status === 'open').length} Open</Badge>
                    <Badge variant="outline">{bugReports.filter(b => b.status === 'in_progress').length} In Progress</Badge>
                    <Badge variant="neon-green">{bugReports.filter(b => b.status === 'resolved').length} Resolved</Badge>
                  </div>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead className="border-b border-border"><tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reporter</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border">
                        {bugReports.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No bug reports yet</td></tr>
                        ) : bugReports.map(bug => (
                          <tr key={bug.id} className="hover:bg-muted/30">
                            <td className="p-4 text-sm">{bug.reporter_email}</td>
                            <td className="p-4 text-sm font-medium">{bug.title}</td>
                            <td className="p-4">
                              <Badge variant={
                                bug.priority === 'critical' ? 'destructive' : 
                                bug.priority === 'high' ? 'neon-orange' : 
                                bug.priority === 'medium' ? 'outline' : 'secondary'
                              }>{bug.priority}</Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant={
                                bug.status === 'resolved' ? 'neon-green' : 
                                bug.status === 'in_progress' ? 'neon-orange' : 'outline'
                              }>{bug.status}</Badge>
                            </td>
                            <td className="p-4">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedBug(bug)}>View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Support Tickets */}
            {activeTab === "support" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Support Tickets</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{supportTickets.filter(t => t.status === 'open').length} Open</Badge>
                    <Badge variant="neon-green">{supportTickets.filter(t => t.status === 'resolved').length} Resolved</Badge>
                  </div>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead className="border-b border-border"><tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Subject</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border">
                        {supportTickets.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No support tickets yet</td></tr>
                        ) : supportTickets.map(ticket => (
                          <tr key={ticket.id} className="hover:bg-muted/30">
                            <td className="p-4 text-sm">{ticket.user_email}</td>
                            <td className="p-4 text-sm font-medium">{ticket.subject}</td>
                            <td className="p-4">
                              <Badge variant={ticket.status === 'resolved' ? 'neon-green' : 'outline'}>{ticket.status}</Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Notification Modal */}
      <Dialog open={showNotifModal} onOpenChange={setShowNotifModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingNotif ? 'Edit' : 'Create'} Notification</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input placeholder="Title" value={notifForm.title} onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} />
            <Textarea placeholder="Message" value={notifForm.message} onChange={e => setNotifForm({ ...notifForm, message: e.target.value })} />
            <div className="flex gap-4">
              <Select value={notifForm.type} onValueChange={v => setNotifForm({ ...notifForm, type: v as NotificationType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="banner">Banner</SelectItem><SelectItem value="toast">Toast</SelectItem><SelectItem value="modal">Modal</SelectItem></SelectContent>
              </Select>
              <Select value={notifForm.targetAudience} onValueChange={v => setNotifForm({ ...notifForm, targetAudience: v as TargetAudience })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Users</SelectItem><SelectItem value="free">Free Only</SelectItem><SelectItem value="premium">Premium Only</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={notifForm.isActive} onCheckedChange={v => setNotifForm({ ...notifForm, isActive: v })} /><span>Active</span></div>
            <Button variant="neon" className="w-full" onClick={saveNotification}>Save Notification</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bug Detail Modal */}
      <Dialog open={!!selectedBug} onOpenChange={() => setSelectedBug(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bug Report: {selectedBug?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Reporter</p>
              <p>{selectedBug?.reporter_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{selectedBug?.description}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm text-muted-foreground">Status:</p>
              <Badge>{selectedBug?.status}</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => selectedBug && updateBugStatus(selectedBug.id, 'in_progress')}>Mark In Progress</Button>
              <Button variant="neon" onClick={() => selectedBug && updateBugStatus(selectedBug.id, 'resolved')}>Mark Resolved</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Support Ticket Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Support Ticket: {selectedTicket?.subject}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p>{selectedTicket?.user_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Message</p>
              <p className="text-sm bg-muted p-3 rounded-lg">{selectedTicket?.message}</p>
            </div>
            {selectedTicket?.ai_response && (
              <div>
                <p className="text-sm text-muted-foreground">AI Response</p>
                <p className="text-sm bg-primary/10 p-3 rounded-lg">{selectedTicket.ai_response}</p>
              </div>
            )}
            {selectedTicket?.admin_response && (
              <div>
                <p className="text-sm text-muted-foreground">Admin Response</p>
                <p className="text-sm bg-secondary/10 p-3 rounded-lg">{selectedTicket.admin_response}</p>
              </div>
            )}
            {selectedTicket?.status !== 'resolved' && (
              <div className="space-y-2">
                <Textarea 
                  placeholder="Write your response..." 
                  value={ticketResponse} 
                  onChange={e => setTicketResponse(e.target.value)} 
                />
                <Button variant="neon" onClick={() => selectedTicket && respondToTicket(selectedTicket.id)} disabled={!ticketResponse}>
                  Send Response & Resolve
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
