import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
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
  MoreHorizontal,
  AlertCircle,
  Forward,
  X,
  Code,
  MessageSquare,
  Menu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/hooks/useQuota";
import { ExpirationTimer } from "@/components/ExpirationTimer";
import { TagBadge, getTagById } from "@/components/TagBadge";
import { TagSelector, BulkTagSelector } from "@/components/TagSelector";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InboxData {
  id: string;
  email_address: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  forwarding_enabled: boolean;
  forwarding_email: string | null;
  tags: string[] | null;
}

interface MessageData {
  id: string;
  inbox_id: string;
  received_at: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const { canCreateInbox, remainingInboxes, incrementQuota, isUnlimited, planConfig } = useQuota();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inboxes, setInboxes] = useState<InboxData[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (user?.id) {
      loadInboxes();
    }
  }, [user?.id, authLoading, isAuthenticated]);

  const loadInboxes = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    
    const { data: inboxData } = await supabase
      .from('inboxes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (inboxData) {
      setInboxes(inboxData);
      
      // Load message counts for all inboxes
      const inboxIds = inboxData.map(i => i.id);
      if (inboxIds.length > 0) {
        const { data: msgData } = await supabase
          .from('messages')
          .select('id, inbox_id, received_at')
          .in('inbox_id', inboxIds);
        if (msgData) setMessages(msgData);
      }
    }
    
    setIsLoading(false);
  };

  const filteredInboxes = inboxes.filter((inbox) =>
    inbox.email_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected = filteredInboxes.length > 0 && filteredInboxes.every(i => selectedIds.has(i.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInboxes.map(i => i.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const createInbox = async () => {
    if (!canCreateInbox) {
      setShowUpgradeModal(true);
      return;
    }
    if (!user?.id) return;

    const randomWord = ["alpha", "beta", "gamma", "delta", "omega"][
      Math.floor(Math.random() * 5)
    ];
    const randomDigits = Math.floor(Math.random() * 900) + 100;
    const newEmail = `${randomWord}_${randomDigits}@burnermail.app`;

    const expiresAt = new Date(Date.now() + (planConfig?.lifespanMinutes || 5) * 60 * 1000);

    const { error } = await supabase.from('inboxes').insert({
      user_id: user.id,
      email_address: newEmail,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    });

    if (!error) {
      await incrementQuota();
      loadInboxes();
      toast({
        title: "Inbox created!",
        description: newEmail,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create inbox",
        variant: "destructive",
      });
    }
  };

  const copyEmail = (email: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(email);
    toast({
      title: "Copied!",
      description: "Email address copied to clipboard.",
    });
  };

  const deleteInbox = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await supabase.from('inboxes').delete().eq('id', id);
    selectedIds.delete(id);
    setSelectedIds(new Set(selectedIds));
    loadInboxes();
    toast({
      title: "Inbox deleted",
      description: "The inbox has been permanently removed.",
    });
  };

  const bulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    await supabase.from('inboxes').delete().in('id', idsToDelete);
    setSelectedIds(new Set());
    loadInboxes();
    setShowBulkDeleteDialog(false);
    toast({
      title: `${idsToDelete.length} inbox${idsToDelete.length !== 1 ? 'es' : ''} deleted`,
      description: "Selected inboxes have been permanently removed.",
    });
  };

  const bulkAddTags = async (tagIds: string[]) => {
    const idsToUpdate = Array.from(selectedIds);
    for (const id of idsToUpdate) {
      const inbox = inboxes.find(i => i.id === id);
      const currentTags = inbox?.tags || [];
      const newTags = [...new Set([...currentTags, ...tagIds])];
      await supabase.from('inboxes').update({ tags: newTags }).eq('id', id);
    }
    loadInboxes();
    toast({
      title: "Tags added",
      description: `Added ${tagIds.length} tag${tagIds.length !== 1 ? 's' : ''} to ${selectedIds.size} inbox${selectedIds.size !== 1 ? 'es' : ''}.`,
    });
  };

  const extendInbox = async (id: string) => {
    const minutes = planConfig?.lifespanMinutes || 60;
    const inbox = inboxes.find(i => i.id === id);
    if (!inbox) return;
    
    const newExpiry = new Date(new Date(inbox.expires_at).getTime() + minutes * 60 * 1000);
    await supabase.from('inboxes').update({ expires_at: newExpiry.toISOString() }).eq('id', id);
    loadInboxes();
    toast({
      title: "Inbox extended",
      description: `Extended by ${minutes} minutes.`,
    });
  };

  const updateInboxTags = async (inboxId: string, newTags: string[]) => {
    await supabase.from('inboxes').update({ tags: newTags }).eq('id', inboxId);
    loadInboxes();
  };

  const getMessageCount = (inboxId: string) => {
    return messages.filter(m => m.inbox_id === inboxId).length;
  };

  const formatLastActivity = (inboxId: string) => {
    const inboxMessages = messages.filter(m => m.inbox_id === inboxId);
    if (inboxMessages.length === 0) return "No messages";
    
    const latest = inboxMessages.sort((a, b) => 
      new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    )[0];
    const diff = Date.now() - new Date(latest.received_at).getTime();
    
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m`;
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `${days}d`;
    }
  };

  const currentPlan = user?.plan || 'free';

  const SidebarContent = () => (
    <>
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
          to="/sms"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          SMS
          <Badge variant="pro" className="ml-auto text-[10px]">
            PRO
          </Badge>
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
            {isUnlimited 
              ? "Unlimited inboxes" 
              : `${remainingInboxes} inbox${remainingInboxes !== 1 ? 'es' : ''} remaining today`
            }
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
    </>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex">
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
        <main className="flex-1 min-h-screen flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Your Inboxes</h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredInboxes.length} inbox{filteredInboxes.length !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={loadInboxes}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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

            {/* Search & Bulk Actions Bar */}
            <div className="px-4 pb-4 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inboxes..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Bulk Actions */}
              {someSelected && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5"
                >
                  <span className="text-sm font-medium">{selectedIds.size} selected</span>
                  <div className="h-4 w-px bg-border" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowBulkDeleteDialog(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                  <BulkTagSelector onApplyTags={bulkAddTags} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={clearSelection}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              )}
            </div>
          </header>

          {/* Inbox List */}
          <div className="flex-1 overflow-auto">
            {/* List Header */}
            <div className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b border-border/50">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground">
                <div className="w-6 flex items-center">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    className="h-3.5 w-3.5"
                  />
                </div>
                <div>Email Address</div>
                <div className="w-24 text-center">Tags</div>
                <div className="w-16 text-center">Messages</div>
                <div className="w-16 text-center">Activity</div>
                <div className="w-20 text-center">Expires</div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredInboxes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No inboxes yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first disposable inbox to get started</p>
                <Button variant="neon" onClick={createInbox}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Inbox
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {filteredInboxes.map((inbox, index) => {
                  const messageCount = getMessageCount(inbox.id);
                  const isSelected = selectedIds.has(inbox.id);
                  const isExpired = new Date(inbox.expires_at) < new Date();
                  
                  return (
                    <motion.div
                      key={inbox.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => navigate(`/inbox/${inbox.id}`)}
                      className={`
                        grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3
                        cursor-pointer transition-colors
                        ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/30'}
                        ${isExpired ? 'opacity-60' : ''}
                      `}
                    >
                      {/* Checkbox */}
                      <div className="w-6 flex items-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(inbox.id)}
                          className="h-3.5 w-3.5"
                        />
                      </div>

                      {/* Email Address */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isExpired
                              ? "bg-muted-foreground"
                              : "bg-neon-green animate-pulse"
                          }`}
                        />
                        <span className="font-mono text-sm truncate">
                          {inbox.email_address}
                        </span>
                        {inbox.forwarding_enabled && (
                          <Forward className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>

                      {/* Tags */}
                      <div className="w-24 flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {inbox.tags && inbox.tags.length > 0 ? (
                          <div className="flex items-center gap-0.5">
                            {inbox.tags.slice(0, 2).map(tagId => {
                              const tag = getTagById(tagId);
                              return tag ? (
                                <TagBadge key={tagId} tag={tag} size="sm" />
                              ) : null;
                            })}
                            {inbox.tags.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">+{inbox.tags.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <TagSelector
                            selectedTags={inbox.tags || []}
                            onTagsChange={(tags) => updateInboxTags(inbox.id, tags)}
                          />
                        )}
                      </div>

                      {/* Message Count */}
                      <div className="w-16 flex items-center justify-center">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {messageCount}
                        </Badge>
                      </div>

                      {/* Last Activity */}
                      <div className="w-16 flex items-center justify-center text-xs text-muted-foreground">
                        {formatLastActivity(inbox.id)}
                      </div>

                      {/* Expiration Timer */}
                      <div className="w-20 flex items-center justify-center">
                        <ExpirationTimer 
                          expiresAt={inbox.expires_at}
                          onExtend={() => extendInbox(inbox.id)}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Daily Limit Reached
            </DialogTitle>
            <DialogDescription>
              You've reached your daily limit of {planConfig?.maxEmailsPerDay || 1} inbox{(planConfig?.maxEmailsPerDay || 1) !== 1 ? 'es' : ''}.
              Upgrade to Pro for unlimited inboxes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Maybe Later
            </Button>
            <Button variant="neon" asChild>
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} inbox{selectedIds.size !== 1 ? 'es' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All messages in these inboxes will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={bulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
