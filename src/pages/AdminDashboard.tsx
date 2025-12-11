import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  LayoutDashboard,
  Users,
  Mail,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Wallet,
  Bitcoin,
  Bug,
  MessageSquare,
  Settings,
  Search,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

// Mock KPI data
const kpis = [
  {
    title: "Monthly Revenue",
    value: "$12,450",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Active Users",
    value: "2,847",
    change: "+8.2%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Total Inboxes",
    value: "5,231",
    change: "+15.3%",
    trend: "up",
    icon: Mail,
  },
  {
    title: "Churn Rate",
    value: "2.4%",
    change: "-0.3%",
    trend: "down",
    icon: Activity,
  },
];

// Mock crypto transactions
const cryptoTransactions = [
  {
    id: "1",
    user: "user@email.com",
    currency: "BTC",
    amount: "0.00012",
    usdAmount: "$5.00",
    status: "confirmed",
    txHash: "abc123...def456",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    user: "test@email.com",
    currency: "USDT",
    amount: "5.00",
    usdAmount: "$5.00",
    status: "pending",
    txHash: "xyz789...uvw012",
    timestamp: "30 min ago",
  },
  {
    id: "3",
    user: "demo@email.com",
    currency: "BTC",
    amount: "0.00011",
    usdAmount: "$4.80",
    status: "failed",
    txHash: "123abc...456def",
    timestamp: "1 day ago",
  },
];

// Mock bug reports
const bugReports = [
  {
    id: "1",
    title: "Webhook retry failing for Stripe events",
    severity: "high",
    status: "auto-fixed",
    timestamp: "3 hours ago",
  },
  {
    id: "2",
    title: "Realtime connection drops intermittently",
    severity: "medium",
    status: "investigating",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    title: "Email parsing error for certain formats",
    severity: "low",
    status: "resolved",
    timestamp: "2 days ago",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "wallets" | "transactions" | "bugs" | "support">("overview");
  const [btcAddress, setBtcAddress] = useState("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
  const [usdtAddress, setUsdtAddress] = useState("TN9R6DxWoLUVPVcSYwVJ8bYJpn2kGYqXw4");

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Background effects */}
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
              <span className="text-lg font-bold">
                <span className="text-secondary">Admin</span> Panel
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "wallets", label: "Wallet Config", icon: Wallet },
              { id: "transactions", label: "Crypto Payments", icon: Bitcoin },
              { id: "bugs", label: "Bug Reports", icon: Bug },
              { id: "support", label: "AI Support", icon: MessageSquare },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-secondary/20 text-secondary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border/50">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Monitor and manage BurnerMail operations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="neon-magenta">Demo Admin</Badge>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* KPIs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {kpis.map((kpi, index) => (
                    <motion.div
                      key={kpi.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card variant={index === 0 ? "neon" : "default"}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <kpi.icon className={`h-5 w-5 ${
                              index === 0 ? "text-primary" : "text-muted-foreground"
                            }`} />
                            <Badge
                              variant={kpi.trend === "up" ? "neon-green" : "neon-orange"}
                              className="text-xs"
                            >
                              {kpi.trend === "up" ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {kpi.change}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold">{kpi.value}</p>
                          <p className="text-sm text-muted-foreground">{kpi.title}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Charts placeholder */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Over Time</CardTitle>
                      <CardDescription>Monthly recurring revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground">Chart visualization</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>Daily active users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground">Chart visualization</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Wallets Tab */}
            {activeTab === "wallets" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 max-w-2xl"
              >
                <Card variant="neon-magenta">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bitcoin className="h-5 w-5 text-neon-orange" />
                      Bitcoin Wallet
                    </CardTitle>
                    <CardDescription>
                      Configure your BTC receiving address
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">BTC Address</label>
                      <Input
                        value={btcAddress}
                        onChange={(e) => setBtcAddress(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-center">
                      <div className="w-32 h-32 bg-foreground rounded-lg flex items-center justify-center">
                        <span className="text-background text-xs">QR Code</span>
                      </div>
                    </div>
                    <Button variant="secondary">Update Address</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-neon-green" />
                      USDT Wallet (TRC-20)
                    </CardTitle>
                    <CardDescription>
                      Configure your USDT receiving address
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">USDT Address</label>
                      <Input
                        value={usdtAddress}
                        onChange={(e) => setUsdtAddress(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="neon-green">TRC-20</Badge>
                      <Badge variant="outline">ERC-20</Badge>
                    </div>
                    <Button variant="outline">Update Address</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search transactions..." className="pl-10" />
                  </div>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-border">
                          <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Currency</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">TX Hash</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {cryptoTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-muted/30">
                              <td className="p-4 text-sm">{tx.user}</td>
                              <td className="p-4">
                                <Badge variant={tx.currency === "BTC" ? "neon-orange" : "neon-green"}>
                                  {tx.currency}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm font-mono">
                                {tx.amount} ({tx.usdAmount})
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={
                                    tx.status === "confirmed"
                                      ? "neon-green"
                                      : tx.status === "pending"
                                      ? "neon-orange"
                                      : "destructive"
                                  }
                                >
                                  {tx.status === "confirmed" && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {tx.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                  {tx.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                                  {tx.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm font-mono text-muted-foreground">
                                {tx.txHash}
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{tx.timestamp}</td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">Verify</Button>
                                  {tx.status === "pending" && (
                                    <Button variant="outline" size="sm">Confirm</Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Bugs Tab */}
            {activeTab === "bugs" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Bug Reports & Auto-Fix</h2>
                    <p className="text-sm text-muted-foreground">
                      System health monitoring and automatic remediation
                    </p>
                  </div>
                  <Button variant="secondary">
                    <Bug className="h-4 w-4 mr-2" />
                    Run Detector
                  </Button>
                </div>

                <div className="grid gap-4">
                  {bugReports.map((bug) => (
                    <Card key={bug.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            bug.severity === "high"
                              ? "bg-destructive/20"
                              : bug.severity === "medium"
                              ? "bg-neon-orange/20"
                              : "bg-muted"
                          }`}>
                            <AlertTriangle className={`h-5 w-5 ${
                              bug.severity === "high"
                                ? "text-destructive"
                                : bug.severity === "medium"
                                ? "text-neon-orange"
                                : "text-muted-foreground"
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{bug.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  bug.severity === "high"
                                    ? "destructive"
                                    : bug.severity === "medium"
                                    ? "neon-orange"
                                    : "outline"
                                }
                              >
                                {bug.severity}
                              </Badge>
                              <Badge
                                variant={
                                  bug.status === "auto-fixed"
                                    ? "neon-green"
                                    : bug.status === "resolved"
                                    ? "neon"
                                    : "outline"
                                }
                              >
                                {bug.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {bug.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Support Tab */}
            {activeTab === "support" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold">AI Support Triage</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage AI-handled support conversations
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    { user: "user123", topic: "Billing Question", sentiment: "neutral", status: "resolved" },
                    { user: "test456", topic: "Inbox Not Receiving", sentiment: "frustrated", status: "escalated" },
                    { user: "demo789", topic: "Feature Request", sentiment: "positive", status: "pending" },
                  ].map((thread, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{thread.topic}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">{thread.user}</span>
                              <Badge
                                variant={
                                  thread.sentiment === "positive"
                                    ? "neon-green"
                                    : thread.sentiment === "frustrated"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {thread.sentiment}
                              </Badge>
                              <Badge
                                variant={
                                  thread.status === "resolved"
                                    ? "neon"
                                    : thread.status === "escalated"
                                    ? "neon-orange"
                                    : "outline"
                                }
                              >
                                {thread.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="outline" size="sm">Resolve</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
