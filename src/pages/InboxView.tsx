import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  Mail, 
  Copy,
  Search,
  RefreshCw,
  Clock,
  ExternalLink,
  FileText,
  Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock messages
const mockMessages = [
  {
    id: "1",
    from: "noreply@netflix.com",
    fromName: "Netflix",
    subject: "Verify your email address",
    preview: "Your verification code is: 847291. Enter this code to verify your email...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E50914;">Welcome to Netflix!</h1>
        <p>Thank you for signing up. Please verify your email address by entering the code below:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">847291</span>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
    bodyText: "Your verification code is: 847291. Enter this code to verify your email address.",
    timestamp: "2 min ago",
    read: false,
    verificationCode: "847291",
  },
  {
    id: "2",
    from: "hello@netflix.com",
    fromName: "Netflix",
    subject: "Welcome to Netflix!",
    preview: "Start watching your favorite movies and TV shows today...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E50914;">You're all set!</h1>
        <p>Your Netflix account is now active. Start exploring thousands of movies and TV shows.</p>
        <a href="#" style="display: inline-block; background: #E50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Start Watching</a>
      </div>
    `,
    bodyText: "Your Netflix account is now active. Start exploring thousands of movies and TV shows.",
    timestamp: "5 min ago",
    read: true,
    verificationCode: null,
  },
  {
    id: "3",
    from: "security@netflix.com",
    fromName: "Netflix Security",
    subject: "New sign-in to your account",
    preview: "We noticed a new sign-in to your Netflix account from Chrome on Windows...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New sign-in detected</h1>
        <p>We noticed a new sign-in to your Netflix account:</p>
        <ul>
          <li>Device: Chrome on Windows</li>
          <li>Location: New York, USA</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p>If this wasn't you, please secure your account immediately.</p>
      </div>
    `,
    bodyText: "We noticed a new sign-in to your Netflix account from Chrome on Windows.",
    timestamp: "1 hour ago",
    read: true,
    verificationCode: null,
  },
];

export default function InboxView() {
  const { id } = useParams();
  const { toast } = useToast();
  const [messages] = useState(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"html" | "text">("html");

  const inboxEmail = "netflix_test_7x9@demoinbox.app";

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <h1 className="font-mono text-sm">{inboxEmail}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyEmail}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {messages.length} messages
                </p>
              </div>
            </div>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content - Two Pane Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Message List */}
          <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto">
            <div className="p-4 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y divide-border/50">
              {filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedMessage.id === message.id
                      ? "bg-primary/10 border-l-2 border-l-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {!message.read && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                      <span className="font-medium text-sm">
                        {message.fromName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1 truncate">
                    {message.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {message.preview}
                  </p>
                  {message.verificationCode && (
                    <Badge variant="neon" className="mt-2">
                      Code: {message.verificationCode}
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Message Preview */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Message Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>From: {selectedMessage.from}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{selectedMessage.timestamp}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "html" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("html")}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        HTML
                      </Button>
                      <Button
                        variant={viewMode === "text" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("text")}
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Text
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Verification Code Card */}
                {selectedMessage.verificationCode && (
                  <Card variant="neon" className="mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Verification Code Detected
                          </p>
                          <code className="text-3xl font-mono font-bold text-primary">
                            {selectedMessage.verificationCode}
                          </code>
                        </div>
                        <Button
                          variant="neon"
                          onClick={() =>
                            copyCode(selectedMessage.verificationCode!)
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Message Body */}
                <Card variant="glass">
                  <CardContent className="p-6">
                    {viewMode === "html" ? (
                      <div
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: selectedMessage.bodyHtml,
                        }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                        {selectedMessage.bodyText}
                      </pre>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open in New Tab
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a message to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
