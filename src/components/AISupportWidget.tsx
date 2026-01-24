import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  X, 
  Send,
  Bot,
  User,
  Sparkles
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi! I'm your BurnerMail assistant. How can I help you today? I can help with:\n\n• Creating inboxes\n• Understanding your plan\n• Billing questions\n• Troubleshooting issues",
  },
];

export function AISupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const responses: Record<string, string> = {
      inbox: "To create a new inbox, go to your Dashboard and click the 'New Inbox' button. Each inbox gets a unique @demoinbox.app address that you can use for signups and testing.",
      plan: "You're currently on the Free plan which includes 1 inbox. Upgrade to Pro ($5/month) for unlimited inboxes and priority support!",
      billing: "You can manage your billing in Settings > Security > Manage Payment Methods. We accept both credit cards (via Stripe) and cryptocurrency (BTC, USDT).",
      help: "I'm here to help! You can ask me about creating inboxes, your subscription, troubleshooting email issues, or anything else related to BurnerMail.",
    };

    const lowerInput = userMessage.content.toLowerCase();
    let responseContent = "I'd be happy to help with that! Could you provide more details about what you need?";

    if (lowerInput.includes("inbox") || lowerInput.includes("create")) {
      responseContent = responses.inbox;
    } else if (lowerInput.includes("plan") || lowerInput.includes("upgrade")) {
      responseContent = responses.plan;
    } else if (lowerInput.includes("bill") || lowerInput.includes("pay") || lowerInput.includes("price")) {
      responseContent = responses.billing;
    } else if (lowerInput.includes("help")) {
      responseContent = responses.help;
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseContent,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 ${isOpen ? "hidden" : "block"}`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-[0_0_30px_hsl(185_100%_50%/0.5)] transition-shadow flex items-center justify-center"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-background" />
        </button>
      </motion.div>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)]"
          >
            <Card variant="neon" className="overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">BurnerMail Support</p>
                      <Badge variant="neon-green" className="text-[10px]">
                        Online
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <CardContent className="p-4 h-80 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === "assistant"
                          ? "bg-primary/20"
                          : "bg-secondary/20"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-secondary" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        message.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t border-border/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="neon" size="icon" type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
