import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Copy, Search, RefreshCw, Inbox, Star, Archive, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Folder = 'inbox' | 'starred' | 'archive' | 'trash';

interface Message {
  id: string;
  inbox_id: string;
  from_address: string;
  from_name: string | null;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  verification_code: string | null;
  received_at: string;
  is_read: boolean;
}

interface InboxData {
  id: string;
  email_address: string;
  expires_at: string;
  forwarding_enabled: boolean;
}

export default function InboxView() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [inbox, setInbox] = useState<InboxData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"html" | "text">("html");
  const [activeFolder, setActiveFolder] = useState<Folder>('inbox');
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (id) loadInboxData();
  }, [id, authLoading, isAuthenticated]);

  const loadInboxData = async () => {
    if (!id) return;
    setIsLoading(true);
    
    const { data: inboxData } = await supabase.from('inboxes').select('*').eq('id', id).single();
    if (inboxData) setInbox(inboxData);

    const { data: msgData } = await supabase.from('messages').select('*').eq('inbox_id', id).order('received_at', { ascending: false });
    if (msgData) {
      setMessages(msgData);
      if (msgData.length > 0) setSelectedMessage(msgData[0]);
    }
    
    setIsLoading(false);
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) =>
      (msg.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from_address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied!", description: `${code} copied to clipboard` });
  };

  const copyEmail = () => {
    if (inbox) {
      navigator.clipboard.writeText(inbox.email_address);
      toast({ title: "Email copied!", description: "Inbox address copied to clipboard" });
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const folders = [
    { id: 'inbox' as Folder, label: 'Inbox', icon: Inbox, count: messages.filter(m => !m.is_read).length },
    { id: 'starred' as Folder, label: 'Starred', icon: Star, count: starredIds.size },
    { id: 'archive' as Folder, label: 'Archive', icon: Archive, count: 0 },
    { id: 'trash' as Folder, label: 'Trash', icon: Trash2, count: 0 },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-border/30 bg-card/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">{inbox?.email_address}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyEmail}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-light">{messages.length} messages</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={loadInboxData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={15} minSize={12} maxSize={20}>
            <div className="h-full bg-sidebar/50 border-r border-border/30 p-3">
              <p className="text-[10px] font-light uppercase tracking-wider text-muted-foreground mb-2 px-2">Folders</p>
              <nav className="space-y-0.5">
                {folders.map((folder) => (
                  <button key={folder.id} onClick={() => setActiveFolder(folder.id)}
                    className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm font-light transition-colors",
                      activeFolder === folder.id ? "bg-primary/20 text-primary" : "text-foreground/80 hover:bg-muted/50")}>
                    <folder.icon className="h-3.5 w-3.5" />
                    <span className="flex-1 text-left">{folder.label}</span>
                    {folder.count > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted">{folder.count}</span>}
                  </button>
                ))}
              </nav>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border/30" />

          <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
            <div className="h-full flex flex-col bg-card/30">
              <div className="flex-shrink-0 p-2 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search messages..." className="pl-8 h-8 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {filteredMessages.map((message) => (
                      <div key={message.id} onClick={() => setSelectedMessage(message)}
                        className={cn("px-3 py-2.5 cursor-pointer transition-colors",
                          selectedMessage?.id === message.id ? "bg-primary/15" : "hover:bg-muted/30")}>
                        <div className="flex items-start gap-2">
                          <div className="pt-1.5">{!message.is_read ? <div className="w-2 h-2 rounded-full bg-primary" /> : <div className="w-2 h-2" />}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={cn("text-sm truncate", !message.is_read ? "font-medium" : "font-light")}>{message.from_name || message.from_address}</span>
                              <span className="text-[10px] text-muted-foreground">{formatTime(message.received_at)}</span>
                            </div>
                            <p className="text-xs truncate">{message.subject || '(No subject)'}</p>
                            {message.verification_code && (
                              <Badge variant="neon-green" className="mt-1 text-[10px]">Code: {message.verification_code}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border/30" />

          <ResizablePanel defaultSize={55}>
            <div className="h-full flex flex-col bg-background">
              {selectedMessage ? (
                <>
                  <div className="flex-shrink-0 p-4 border-b border-border/30">
                    <h2 className="text-lg font-medium mb-2">{selectedMessage.subject || '(No subject)'}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{selectedMessage.from_name || selectedMessage.from_address}</span>
                      <span>•</span>
                      <span>{formatTime(selectedMessage.received_at)}</span>
                    </div>
                    {selectedMessage.verification_code && (
                      <Button variant="neon" size="sm" className="mt-3" onClick={() => copyCode(selectedMessage.verification_code!)}>
                        <Copy className="h-3 w-3 mr-1" />Copy Code: {selectedMessage.verification_code}
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    {viewMode === 'html' && selectedMessage.body_html ? (
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }} />
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm">{selectedMessage.body_text || 'No content'}</pre>
                    )}
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Select a message to view</p>
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
