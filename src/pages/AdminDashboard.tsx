import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { db } from "@/lib/mockDatabase";
import { useToast } from "@/hooks/use-toast";
import type { SiteNotification, NotificationType, TargetAudience, Integration } from "@/types/database";
import { 
  LayoutDashboard, Users, Mail, DollarSign, Activity, TrendingUp, TrendingDown,
  Wallet, Bitcoin, Bug, MessageSquare, Search, RefreshCw, ArrowLeft,
  CheckCircle, XCircle, Clock, AlertTriangle, Bell, Plug, Plus, Trash2, Edit, Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "wallets" | "transactions" | "bugs" | "support" | "notifications" | "integrations">("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  // Wallet state
  const adminWallets = db.getAdminWallets();
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState("");

  // Notifications state
  const notifications = db.getSiteNotifications();
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState<SiteNotification | null>(null);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'banner' as NotificationType, targetAudience: 'all' as TargetAudience, isActive: true });

  // Integrations state
  const integrations = db.getIntegrations();
  const [connectingIntegration, setConnectingIntegration] = useState<string | null>(null);

  // Transactions from DB
  const transactions = db.getCryptoTransactions();

  // KPIs from DB
  const users = db.getUsers();
  const inboxes = db.getInboxes();
  const kpis = [
    { title: "Monthly Revenue", value: `$${transactions.filter(t => t.status === 'confirmed').reduce((sum, t) => sum + t.amountUsd, 0).toFixed(2)}`, change: "+12.5%", trend: "up", icon: DollarSign },
    { title: "Active Users", value: users.length.toString(), change: "+8.2%", trend: "up", icon: Users },
    { title: "Total Inboxes", value: inboxes.length.toString(), change: "+15.3%", trend: "up", icon: Mail },
    { title: "Churn Rate", value: "2.4%", change: "-0.3%", trend: "down", icon: Activity },
  ];

  const saveWallet = (walletId: string) => {
    db.updateAdminWallet(walletId, { address: walletAddress });
    setEditingWallet(null);
    setRefreshKey(prev => prev + 1);
    toast({ title: "Wallet updated", description: "Address saved successfully." });
  };

  const saveNotification = () => {
    if (editingNotif) {
      db.updateSiteNotification(editingNotif.id, notifForm);
    } else {
      db.createSiteNotification({ ...notifForm, startDate: new Date().toISOString(), createdBy: 'admin' });
    }
    setShowNotifModal(false);
    setEditingNotif(null);
    setNotifForm({ title: '', message: '', type: 'banner', targetAudience: 'all', isActive: true });
    setRefreshKey(prev => prev + 1);
    toast({ title: editingNotif ? "Notification updated" : "Notification created" });
  };

  const deleteNotification = (id: string) => {
    db.deleteSiteNotification(id);
    setRefreshKey(prev => prev + 1);
    toast({ title: "Notification deleted" });
  };

  const toggleIntegration = async (integration: Integration) => {
    setConnectingIntegration(integration.id);
    await new Promise(r => setTimeout(r, 1500));
    const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';
    db.updateIntegration(integration.id, { status: newStatus, connectedAt: newStatus === 'connected' ? new Date().toISOString() : undefined });
    setConnectingIntegration(null);
    setRefreshKey(prev => prev + 1);
    toast({ title: newStatus === 'connected' ? `${integration.name} connected` : `${integration.name} disconnected` });
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "wallets", label: "Wallet Config", icon: Wallet },
    { id: "transactions", label: "Crypto Payments", icon: Bitcoin },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Plug },
    { id: "bugs", label: "Bug Reports", icon: Bug },
    { id: "support", label: "AI Support", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border/50 bg-card/30 backdrop-blur-xl">
          <div className="p-4 border-b border-border/50">
            <Link to="/" className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-secondary" />
              <span className="text-lg font-bold"><span className="text-secondary">Admin</span> Panel</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {tabs.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id as any)}
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between p-4">
              <div><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-sm text-muted-foreground">Monitor and manage BurnerMail operations</p></div>
              <div className="flex items-center gap-3">
                <ModeToggle />
                <Badge variant="neon-magenta">Demo Admin</Badge>
                <Button variant="outline" size="icon" onClick={() => setRefreshKey(prev => prev + 1)}><RefreshCw className="h-4 w-4" /></Button>
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
                        {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-muted/30">
                            <td className="p-4 text-sm">{tx.userId}</td>
                            <td className="p-4"><Badge variant={tx.currency === 'BTC' ? 'neon-orange' : 'neon-green'}>{tx.currency}</Badge></td>
                            <td className="p-4 text-sm font-mono">{tx.amount} (${tx.amountUsd})</td>
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
                            <Badge variant={n.isActive ? 'neon-green' : 'outline'}>{n.isActive ? 'Active' : 'Inactive'}</Badge>
                            <Badge variant="outline">{n.type}</Badge>
                            <Badge variant="outline">{n.targetAudience}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{n.message}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingNotif(n); setNotifForm({ title: n.title, message: n.message, type: n.type, targetAudience: n.targetAudience, isActive: n.isActive }); setShowNotifModal(true); }}>
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

            {/* Bugs & Support - simplified */}
            {activeTab === "bugs" && <div className="text-muted-foreground">Bug reports coming soon...</div>}
            {activeTab === "support" && <div className="text-muted-foreground">AI Support triage coming soon...</div>}
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
    </div>
  );
}
