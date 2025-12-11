import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { XCircle, ArrowLeft, MessageSquare } from "lucide-react";

export default function PaymentCancel() {
  return (
    <MainLayout showFooter={false}>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card variant="default" className="text-center overflow-hidden border-destructive/30">
            <div className="py-8 bg-gradient-to-b from-destructive/10 to-transparent">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center"
              >
                <XCircle className="h-10 w-10 text-destructive" />
              </motion.div>
            </div>

            <CardContent className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
                <p className="text-muted-foreground mb-6">
                  Your payment was cancelled. No charges were made to your account.
                </p>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/pricing">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Return to Pricing
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/dashboard">
                      Continue with Free Plan
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-3">
                    Having trouble? We're here to help.
                  </p>
                  <Button variant="neon-ghost" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
