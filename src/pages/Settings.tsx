import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  Key,
  Loader2,
  Wallet,
  Unlink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { WalletAddressBadge } from "@/components/WalletAddressBadge";

export default function Settings() {
  const { toast } = useToast();
  const { user, logout, unlinkWallet } = useAuth();
  
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    realtime: true,
  });

  // Profile form state
  const [profileName, setProfileName] = useState(user?.displayName || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Dialog states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSignOutAllDialog, setShowSignOutAllDialog] = useState(false);
  const [showUnlinkWalletDialog, setShowUnlinkWalletDialog] = useState(false);
  // Form states for dialogs
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = user?.plan || "free";

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setSavingProfile(false);
    toast({
      title: "Settings saved",
      description: "Your profile has been updated.",
    });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsProcessing(false);
    setShowPasswordDialog(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsProcessing(false);
    setShowEmailDialog(false);
    setNewEmail("");
    toast({
      title: "Verification email sent",
      description: `A verification link has been sent to ${newEmail}.`,
    });
  };

  const handleSignOutAll = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsProcessing(false);
    setShowSignOutAllDialog(false);
    toast({
      title: "Signed out everywhere",
      description: "You've been signed out of all other devices.",
    });
  };

  const handleDeleteAccount = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(false);
    setShowDeleteDialog(false);
    logout();
    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted.",
    });
  };

  const handleUnlinkWallet = async () => {
    setIsProcessing(true);
    const result = await unlinkWallet();
    setIsProcessing(false);
    setShowUnlinkWalletDialog(false);
    
    if (result.success) {
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been unlinked from your account.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to disconnect wallet.",
        variant: "destructive",
      });
    }
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
              <Card variant={currentPlan !== "free" ? "neon" : "default"}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        currentPlan !== "free" ? "bg-primary/20" : "bg-muted"
                      }`}>
                        <Crown className={`h-5 w-5 ${
                          currentPlan !== "free" ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>
                          {currentPlan === "enterprise"
                            ? "Full access to all features including SMS"
                            : currentPlan === "premium"
                            ? "Unlimited access to all features"
                            : "Limited to 1 inbox"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={currentPlan === "free" ? "free" : "pro"}>
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
                      <Input 
                        id="name" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Connected Wallet */}
            {user?.walletAddress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Connected Wallet</CardTitle>
                        <CardDescription>Your linked Web3 wallet</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Wallet Address</Label>
                        <div className="mt-1">
                          <WalletAddressBadge address={user.walletAddress} />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setShowUnlinkWalletDialog(true)}
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

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
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowEmailDialog(true)}
                  >
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
                    onClick={() => setShowSignOutAllDialog(true)}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out All Devices
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setShowDeleteDialog(true)}
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

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Email</DialogTitle>
            <DialogDescription>
              Enter your new email address. We'll send a verification link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your@newemail.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmail} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Out All Devices Dialog */}
      <AlertDialog open={showSignOutAllDialog} onOpenChange={setShowSignOutAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out of all other devices and sessions. You'll stay signed in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOutAll} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sign Out All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount} 
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlink Wallet Dialog */}
      <AlertDialog open={showUnlinkWalletDialog} onOpenChange={setShowUnlinkWalletDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unlink your wallet from your account. You can reconnect it later from the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnlinkWallet} 
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}