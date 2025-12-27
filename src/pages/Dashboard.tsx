import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/hooks/useQuota";
import { db } from "@/lib/mockDatabase";
import { ExpirationTimer } from "@/components/ExpirationTimer";
import { TagBadge, getTagById, INBOX_TAGS } from "@/components/TagBadge";
import { TagSelector, BulkTagSelector } from "@/components/TagSelector";
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

export default function Dashboard() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { canCreateInbox, remainingInboxes, incrementQuota, isUnlimited, planConfig } = useQuota();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const inboxes = useMemo(() => {
    return db.getInboxes(user?.id);
  }, [user?.id, refreshKey]);

  const filteredInboxes = inboxes.filter((inbox) =>
    inbox.emailAddress.toLowerCase().includes(searchQuery.toLowerCase())
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

  const createInbox = () => {
    if (!canCreateInbox) {
      setShowUpgradeModal(true);
      return;
    }

    const randomWord = ["alpha", "beta", "gamma", "delta", "omega"][
      Math.floor(Math.random() * 5)
    ];
    const randomDigits = Math.floor(Math.random() * 900) + 100;
    const newEmail = `${randomWord}_${randomDigits}@burnermail.app`;

    const expiresAt = new Date(Date.now() + (planConfig?.lifespanMinutes || 5) * 60 * 1000);

    db.createInbox({
      userId: user?.id || 'guest',
      emailAddress: newEmail,
      expiresAt: expiresAt.toISOString(),
      isActive: true,
    });

    incrementQuota();
    setRefreshKey(prev => prev + 1);

    toast({
      title: "Inbox created!",
      description: newEmail,
    });
  };

  const copyEmail = (email: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(email);
    toast({
      title: "Copied!",
      description: "Email address copied to clipboard.",
    });
  };

  const deleteInbox = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    db.deleteInbox(id);
    selectedIds.delete(id);
    setSelectedIds(new Set(selectedIds));
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Inbox deleted",
      description: "The inbox has been permanently removed.",
    });
  };

  const bulkDelete = () => {
    const count = db.deleteInboxes(Array.from(selectedIds));
    setSelectedIds(new Set());
    setRefreshKey(prev => prev + 1);
    setShowBulkDeleteDialog(false);
    toast({
      title: `${count} inbox${count !== 1 ? 'es' : ''} deleted`,
      description: "Selected inboxes have been permanently removed.",
    });
  };

  const bulkAddTags = (tagIds: string[]) => {
    db.bulkAddTags(Array.from(selectedIds), tagIds);
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Tags added",
      description: `Added ${tagIds.length} tag${tagIds.length !== 1 ? 's' : ''} to ${selectedIds.size} inbox${selectedIds.size !== 1 ? 'es' : ''}.`,
    });
  };

  const extendInbox = (id: string) => {
    const minutes = planConfig?.lifespanMinutes || 60;
    db.extendInbox(id, minutes);
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Inbox extended",
      description: `Extended by ${minutes} minutes.`,
    });
  };

  const updateInboxTags = (inboxId: string, newTags: string[]) => {
    db.updateInbox(inboxId, { tags: newTags });
    setRefreshKey(prev => prev + 1);
  };

  const formatLastActivity = (inbox: typeof inboxes[0]) => {
    const messages = db.getMessages(inbox.id);
    if (messages.length === 0) return "No messages";
    
    const latest = messages[0];
    const diff = Date.now() - new Date(latest.receivedAt).getTime();
    
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-2xl font-bold">Your Inboxes</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredInboxes.length} inbox{filteredInboxes.length !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setRefreshKey(prev => prev + 1)}
                >
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

          {/* Inbox List - Mac Mail Style */}
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

            {/* Inbox Rows */}
            <div className="divide-y divide-border/30">
              {filteredInboxes.map((inbox, index) => {
                const messageCount = db.getMessages(inbox.id).length;
                const isSelected = selectedIds.has(inbox.id);
                const isExpired = new Date(inbox.expiresAt) < new Date();
                
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
                        {inbox.emailAddress}
                      </span>
                      {inbox.forwardingEnabled && (
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
                      {formatLastActivity(inbox)}
                    </div>

                    {/* Expiration Timer */}
                    <div className="w-20 flex items-center justify-center">
                      <ExpirationTimer 
                        expiresAt={inbox.expiresAt}
                        onExtend={() => extendInbox(inbox.id)}
                      />
                    </div>

                    {/* Actions (visible on hover via CSS) */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => copyEmail(inbox.emailAddress, e as any)}>
                            <Copy className="h-3.5 w-3.5 mr-2" />
                            Copy Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => deleteInbox(inbox.id, e as any)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}

              {/* Create New Row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: filteredInboxes.length * 0.02 }}
                onClick={createInbox}
                className="grid grid-cols-[auto_1fr] gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors border-dashed border-t border-border/50"
              >
                <div className="w-6 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  Create new inbox...
                </div>
              </motion.div>
            </div>

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

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Daily Limit Reached</DialogTitle>
            </div>
            <DialogDescription>
              You've reached your daily inbox limit on the free plan. Upgrade to Pro for unlimited inboxes and premium features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Maybe Later
            </Button>
            <Button variant="neon" asChild className="shimmer">
              <Link to="/pricing">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
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
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
