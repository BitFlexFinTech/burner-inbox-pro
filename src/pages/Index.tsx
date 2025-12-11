import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Mail, 
  Zap, 
  Shield, 
  Clock, 
  Copy, 
  Inbox,
  CreditCard,
  Bitcoin,
  ArrowRight,
  Check,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Creation",
    description: "Generate disposable email addresses in milliseconds. No waiting, no verification needed.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Keep your real email hidden. Perfect for testing signups and protecting your identity.",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Messages appear instantly. Never miss a verification code or important email.",
  },
  {
    icon: Copy,
    title: "One-Click Codes",
    description: "Auto-detect verification codes and copy them with a single click.",
  },
  {
    icon: Inbox,
    title: "Organized Inboxes",
    description: "Manage multiple disposable inboxes. Each for a different purpose.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Pay with card via Stripe or cryptocurrency (BTC, USDT).",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Index() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="neon" className="mb-6">
                <Sparkles className="w-3 h-3 mr-1" />
                Now with Crypto Payments
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Disposable Emails{" "}
              <span className="text-gradient-neon">Made Simple</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Create instant burner inboxes for testing signups, catching verification 
              codes, and protecting your real email. No more spam in your primary inbox.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button variant="neon" size="xl" asChild className="shimmer">
                <Link to="/auth?mode=signup">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="neon-outline" size="xl" asChild>
                <Link to="/auth">
                  Login as Demo
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-neon-green" />
                Free tier available
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-neon-green" />
                No credit card required
              </span>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <Card variant="neon" className="overflow-hidden">
              <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-neon-orange" />
                <div className="w-3 h-3 rounded-full bg-neon-green" />
                <span className="ml-4 text-sm text-muted-foreground font-mono">
                  inbox.demoinbox.app
                </span>
              </div>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
                  {/* Inbox List */}
                  <div className="p-4 space-y-2">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                        <span className="text-sm font-medium">netflix_test_7x9</span>
                      </div>
                      <p className="text-xs text-muted-foreground">3 messages</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <span className="text-sm font-medium">spotify_trial_42</span>
                      </div>
                      <p className="text-xs text-muted-foreground">1 message</p>
                    </div>
                  </div>

                  {/* Message List */}
                  <div className="p-4 space-y-2">
                    <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <p className="text-sm font-medium mb-1">Verify your email</p>
                      <p className="text-xs text-muted-foreground">Netflix • 2 min ago</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted transition-colors cursor-pointer">
                      <p className="text-sm font-medium mb-1">Welcome to Netflix!</p>
                      <p className="text-xs text-muted-foreground">Netflix • 5 min ago</p>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="font-medium mb-1">Verify your email</h3>
                      <p className="text-xs text-muted-foreground">From: noreply@netflix.com</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-sm text-muted-foreground mb-3">
                        Your verification code is:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-2xl font-mono font-bold text-primary">
                          847291
                        </code>
                        <Button variant="neon-ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Everything you need for{" "}
              <span className="text-gradient-neon">temporary emails</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Powerful features designed for developers, QA testers, and anyone who 
              values their inbox privacy.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card
                  variant={index === 0 ? "neon" : index === 1 ? "neon-magenta" : "default"}
                  className="h-full hover:scale-[1.02] transition-transform duration-300"
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      index % 3 === 0 ? "bg-primary/20" : index % 3 === 1 ? "bg-secondary/20" : "bg-accent/20"
                    }`}>
                      <feature.icon className={`h-6 w-6 ${
                        index % 3 === 0 ? "text-primary" : index % 3 === 1 ? "text-secondary" : "text-accent"
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-transparent via-muted/20 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Simple, transparent pricing
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Start free, upgrade when you need more. Pay with card or crypto.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {/* Free Plan */}
            <motion.div variants={fadeInUp}>
              <Card variant="default" className="h-full">
                <CardContent className="p-8">
                  <Badge variant="free" className="mb-4">Free</Badge>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {["1 inbox", "Limited storage", "Email receiving", "Code extraction"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-neon-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth?mode=signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={fadeInUp}>
              <Card variant="neon" className="h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl" />
                <CardContent className="p-8 relative">
                  <Badge variant="pro" className="mb-4">Pro</Badge>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$5</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Unlimited inboxes",
                      "Unlimited storage",
                      "Real-time updates",
                      "Priority support",
                      "API access",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-neon-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <Bitcoin className="h-5 w-5 text-neon-orange" />
                  </div>
                  <Button variant="neon" className="w-full" asChild>
                    <Link to="/pricing">Upgrade to Pro</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto text-center"
          >
            <Card variant="neon" className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to protect your inbox?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of developers and testers who use BurnerMail daily.
              </p>
              <Button variant="neon" size="xl" asChild className="shimmer">
                <Link to="/auth?mode=signup">
                  Create Your First Inbox <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
