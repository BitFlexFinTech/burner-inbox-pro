import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Check, 
  CreditCard, 
  Bitcoin,
  Zap,
  ArrowRight
} from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out BurnerMail",
    features: [
      "1 inbox",
      "Limited message storage",
      "Email receiving",
      "Code extraction",
      "Basic support",
    ],
    badge: "free",
    buttonVariant: "outline" as const,
    buttonText: "Get Started",
  },
  {
    name: "Pro",
    price: "$5",
    period: "/month",
    description: "For power users and teams",
    features: [
      "Unlimited inboxes",
      "Unlimited message storage",
      "Real-time updates",
      "Priority support",
      "API access",
      "Custom domains",
      "Webhook integrations",
    ],
    badge: "pro",
    buttonVariant: "neon" as const,
    buttonText: "Upgrade to Pro",
    popular: true,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Pricing() {
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "crypto">("stripe");

  return (
    <MainLayout>
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge variant="neon" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Simple Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose your <span className="text-gradient-neon">plan</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more power. Pay with card or crypto.
            </p>
          </motion.div>

          {/* Payment Method Toggle */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex justify-center mb-12"
          >
            <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
              <button
                onClick={() => setPaymentMethod("stripe")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  paymentMethod === "stripe"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Card
              </button>
              <button
                onClick={() => setPaymentMethod("crypto")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  paymentMethod === "crypto"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bitcoin className="h-4 w-4" />
                Crypto
              </button>
            </div>
          </motion.div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant={plan.popular ? "neon" : "default"}
                  className={`h-full relative ${plan.popular ? "scale-[1.02]" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="pro">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={plan.badge as any}>{plan.name}</Badge>
                    </div>
                    <div className="mt-4">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.popular ? "bg-primary/20" : "bg-muted"
                          }`}>
                            <Check className={`h-3 w-3 ${
                              plan.popular ? "text-primary" : "text-muted-foreground"
                            }`} />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.popular && paymentMethod === "crypto" && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">
                          Pay with cryptocurrency
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="neon-orange">BTC</Badge>
                          <Badge variant="neon-green">USDT</Badge>
                        </div>
                      </div>
                    )}

                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full ${plan.popular ? "shimmer" : ""}`}
                      asChild
                    >
                      <Link to={plan.name === "Free" ? "/auth?mode=signup" : "/checkout"}>
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-20 text-center"
          >
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes! You can cancel your subscription at any time. You'll retain access until the end of your billing period.",
                },
                {
                  q: "How does crypto payment work?",
                  a: "Select crypto at checkout, and you'll receive a wallet address and QR code. Once confirmed on-chain, your account upgrades automatically.",
                },
                {
                  q: "What happens when I hit inbox limit?",
                  a: "On the free plan, you can only create 1 inbox. Upgrade to Pro for unlimited inboxes.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "We offer a 7-day money-back guarantee if you're not satisfied with Pro.",
                },
              ].map((faq) => (
                <Card key={faq.q} variant="glass" className="text-left">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
