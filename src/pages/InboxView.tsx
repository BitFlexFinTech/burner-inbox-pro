import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft,
  Mail, 
  Copy,
  Search,
  RefreshCw,
  Clock,
  ExternalLink,
  FileText,
  Code,
  Inbox,
  Archive,
  Trash2,
  Star,
  MoreHorizontal,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/mockDatabase";
import { useAppMode } from "@/contexts/AppModeContext";
import type { Message } from "@/types/database";
import { cn } from "@/lib/utils";

type Folder = 'inbox' | 'starred' | 'archive' | 'trash';

export default function InboxView() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isDemo } = useAppMode();
  
  const inbox = useMemo(() => db.getInbox(id || ''), [id]);
  const allMessages = useMemo(() => db.getMessages(id), [id]);
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(allMessages[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"html" | "text">("html");
  const [activeFolder, setActiveFolder] = useState<Folder>('inbox');
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  const inboxEmail = inbox?.emailAddress || "demo@burnermail.app";

  const filteredMessages = useMemo(() => {
    return allMessages.filter((msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.fromName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMessages, searchQuery]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied!",
      description: `${code} copied to clipboard`,
    });
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(inboxEmail);
    toast({
      title: "Email copied!",
      description: "Inbox address copied to clipboard",
    });
  };

  const toggleStar = (msgId: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const folders = [
    { id: 'inbox' as Folder, label: 'Inbox', icon: Inbox, count: allMessages.filter(m => !m.isRead).length },
    { id: 'starred' as Folder, label: 'Starred', icon: Star, count: starredIds.size },
    { id: 'archive' as Folder, label: 'Archive', icon: Archive, count: 0 },
    { id: 'trash' as Folder, label: 'Trash', icon: Trash2, count: 0 },
  ];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/30 bg-card/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">{inboxEmail}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyEmail}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-light">
              {allMessages.length} messages
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Three Pane Mac Mail Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Folders */}
          <ResizablePanel defaultSize={15} minSize={12} maxSize={20}>
            <div className="h-full bg-sidebar/50 border-r border-border/30">
              <div className="p-3">
                <p className="text-[10px] font-light uppercase tracking-wider text-muted-foreground mb-2 px-2">
                  Folders
                </p>
                <nav className="space-y-0.5">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setActiveFolder(folder.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm font-light transition-colors",
                        activeFolder === folder.id
                          ? "bg-primary/20 text-primary"
                          : "text-foreground/80 hover:bg-muted/50"
                      )}
                    >
                      <folder.icon className="h-3.5 w-3.5" />
                      <span className="flex-1 text-left">{folder.label}</span>
                      {folder.count > 0 && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full",
                          activeFolder === folder.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {folder.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {isDemo && (
                <div className="absolute bottom-4 left-2 right-2">
                  <div className="bg-muted/30 rounded-lg p-2 text-center">
                    <Phone className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground font-light">
                      SMS available on Pro
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border/30 hover:bg-primary/50 transition-colors" />

          {/* Middle Panel - Message List */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
            <div className="h-full flex flex-col bg-card/30">
              {/* Search */}
              <div className="flex-shrink-0 p-2 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8 h-8 text-sm font-light bg-muted/30 border-border/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Message List */}
              <ScrollArea className="flex-1">
                <div className="divide-y divide-border/20">
                  {filteredMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "px-3 py-2.5 cursor-pointer transition-colors group",
                        selectedMessage?.id === message.id
                          ? "bg-primary/15"
                          : "hover:bg-muted/30"
                      )}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.isRead) {
                          db.markMessageRead(message.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {/* Unread indicator */}
                        <div className="pt-1.5">
                          {!message.isRead ? (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          ) : (
                            <div className="w-2 h-2" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Sender & Time */}
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={cn(
                              "text-sm truncate",
                              !message.isRead ? "font-medium" : "font-light"
                            )}>
                              {message.fromName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-light flex-shrink-0 ml-2">
                              {formatTime(message.receivedAt)}
                            </span>
                          </div>

                          {/* Subject */}
                          <p className={cn(
                            "text-xs truncate mb-0.5",
                            !message.isRead ? "text-foreground" : "text-foreground/80"
                          )}>
                            {message.subject}
                          </p>

                          {/* Preview */}
                          <p className="text-[11px] text-muted-foreground font-light line-clamp-2">
                            {message.bodyText.substring(0, 100)}...
                          </p>

                          {/* Verification code badge */}
                          {message.verificationCode && (
                            <Badge variant="neon" className="mt-1.5 text-[10px] py-0 px-1.5">
                              Code: {message.verificationCode}
                            </Badge>
                          )}
                        </div>

                        {/* Star button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(message.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star className={cn(
                            "h-3.5 w-3.5",
                            starredIds.has(message.id)
                              ? "fill-neon-orange text-neon-orange"
                              : "text-muted-foreground"
                          )} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border/30 hover:bg-primary/50 transition-colors" />

          {/* Right Panel - Message Preview */}
          <ResizablePanel defaultSize={55}>
            <div className="h-full flex flex-col bg-background">
              {selectedMessage ? (
                <>
                  {/* Message Header */}
                  <div className="flex-shrink-0 p-4 border-b border-border/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-light mb-1 truncate">
                          {selectedMessage.subject}
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-light">
                          <span>From: {selectedMessage.fromName} &lt;{selectedMessage.fromAddress}&gt;</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(selectedMessage.receivedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant={viewMode === "html" ? "default" : "ghost"}
                          size="sm"
                          className="h-7 text-xs font-light"
                          onClick={() => setViewMode("html")}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          HTML
                        </Button>
                        <Button
                          variant={viewMode === "text" ? "default" : "ghost"}
                          size="sm"
                          className="h-7 text-xs font-light"
                          onClick={() => setViewMode("text")}
                        >
                          <Code className="h-3 w-3 mr-1" />
                          Text
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Verification Code Card */}
                  {selectedMessage.verificationCode && (
                    <div className="flex-shrink-0 mx-4 mt-4">
                      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground font-light mb-1">
                            Verification Code Detected
                          </p>
                          <code className="text-2xl font-mono font-medium text-primary tracking-widest">
                            {selectedMessage.verificationCode}
                          </code>
                        </div>
                        <Button
                          variant="neon"
                          size="sm"
                          onClick={() => copyCode(selectedMessage.verificationCode!)}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1.5" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Message Body */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="bg-card/50 rounded-lg p-6 border border-border/30">
                      {viewMode === "html" ? (
                        <div
                          className="prose prose-invert prose-sm max-w-none font-light"
                          dangerouslySetInnerHTML={{
                            __html: selectedMessage.bodyHtml,
                          }}
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                          {selectedMessage.bodyText}
                        </pre>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Footer Actions */}
                  <div className="flex-shrink-0 p-3 border-t border-border/30">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs font-light">
                        <ExternalLink className="h-3 w-3 mr-1.5" />
                        Open in New Tab
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs font-light">
                        <Archive className="h-3 w-3 mr-1.5" />
                        Archive
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs font-light text-destructive">
                        <Trash2 className="h-3 w-3 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-light">Select a message to view</p>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
