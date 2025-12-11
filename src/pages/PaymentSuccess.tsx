import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { CheckCircle, ArrowRight, Mail, Sparkles } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <MainLayout showFooter={false}>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card variant="neon" className="text-center overflow-hidden">
            {/* Success animation */}
            <div className="relative py-8 bg-gradient-to-b from-neon-green/10 to-transparent">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto rounded-full bg-neon-green/20 flex items-center justify-center"
              >
                <CheckCircle className="h-10 w-10 text-neon-green" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(6)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className={`absolute h-4 w-4 text-neon-green/50 animate-pulse`}
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${10 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </motion.div>
            </div>

            <CardContent className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground mb-6">
                  Welcome to BurnerMail Pro! You now have unlimited access to all features.
                </p>

                <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium mb-3">What's unlocked:</h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      "Unlimited inboxes",
                      "Unlimited message storage",
                      "Real-time updates",
                      "Priority support",
                      "API access",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-neon-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="neon" className="w-full shimmer" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
