import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  CreditCard, 
  Bitcoin, 
  ArrowLeft,
  Check,
  Copy,
  QrCode,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "btc" | "usdt">("stripe");
  const [isProcessing, setIsProcessing] = useState(false);

  const btcAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  const usdtAddress = "TN9R6DxWoLUVPVcSYwVJ8bYJpn2kGYqXw4";
  const btcAmount = "0.00012 BTC";
  const usdtAmount = "5.00 USDT";

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address copied!",
      description: "Wallet address copied to clipboard.",
    });
  };

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    navigate("/payment/success");
  };

  const handleCryptoPayment = () => {
    toast({
      title: "Payment initiated",
      description: "We're monitoring for your transaction. You'll be notified once confirmed.",
    });
  };

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-[80vh] py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Button variant="ghost" className="mb-6" asChild>
              <Link to="/pricing">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pricing
              </Link>
            </Button>

            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground mb-8">
              Upgrade to BurnerMail Pro for $5/month
            </p>

            {/* Order Summary */}
            <Card variant="neon" className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">BurnerMail Pro</h3>
                    <p className="text-sm text-muted-foreground">Monthly subscription</p>
                  </div>
                  <Badge variant="pro">PRO</Badge>
                </div>
                <div className="flex justify-between items-center py-4 border-t border-border/50">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold">$5.00</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h2 className="font-semibold">Select Payment Method</h2>

              {/* Stripe */}
              <Card
                variant={paymentMethod === "stripe" ? "neon" : "default"}
                className={`cursor-pointer transition-all ${
                  paymentMethod === "stripe" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setPaymentMethod("stripe")}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#635bff]/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-[#635bff]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Credit / Debit Card</h3>
                    <p className="text-sm text-muted-foreground">Powered by Stripe</p>
                  </div>
                  {paymentMethod === "stripe" && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </CardContent>
              </Card>

              {/* BTC */}
              <Card
                variant={paymentMethod === "btc" ? "neon" : "default"}
                className={`cursor-pointer transition-all ${
                  paymentMethod === "btc" ? "ring-2 ring-neon-orange" : ""
                }`}
                onClick={() => setPaymentMethod("btc")}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neon-orange/10 flex items-center justify-center">
                    <Bitcoin className="h-6 w-6 text-neon-orange" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Bitcoin (BTC)</h3>
                    <p className="text-sm text-muted-foreground">≈ {btcAmount}</p>
                  </div>
                  {paymentMethod === "btc" && (
                    <Check className="h-5 w-5 text-neon-orange" />
                  )}
                </CardContent>
              </Card>

              {/* USDT */}
              <Card
                variant={paymentMethod === "usdt" ? "neon" : "default"}
                className={`cursor-pointer transition-all ${
                  paymentMethod === "usdt" ? "ring-2 ring-neon-green" : ""
                }`}
                onClick={() => setPaymentMethod("usdt")}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neon-green/10 flex items-center justify-center">
                    <span className="text-neon-green font-bold text-lg">₮</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">USDT (TRC-20)</h3>
                    <p className="text-sm text-muted-foreground">{usdtAmount}</p>
                  </div>
                  {paymentMethod === "usdt" && (
                    <Check className="h-5 w-5 text-neon-green" />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Details */}
            <div className="mt-8">
              {paymentMethod === "stripe" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    variant="neon"
                    size="lg"
                    className="w-full shimmer"
                    onClick={handleStripeCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Pay with Card - $5.00"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
                    <Shield className="h-3 w-3" />
                    Secured by Stripe. Your card info is never stored.
                  </p>
                </motion.div>
              )}

              {paymentMethod === "btc" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bitcoin className="h-5 w-5 text-neon-orange" />
                        Send Bitcoin
                      </CardTitle>
                      <CardDescription>
                        Send exactly {btcAmount} to the address below
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center p-4 bg-foreground rounded-lg">
                        <QrCode className="h-32 w-32 text-background" />
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all">
                          {btcAddress}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyAddress(btcAddress)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="neon"
                        className="w-full"
                        onClick={handleCryptoPayment}
                      >
                        I've Sent the Payment
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {paymentMethod === "usdt" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-neon-green font-bold">₮</span>
                        Send USDT (TRC-20)
                      </CardTitle>
                      <CardDescription>
                        Send exactly {usdtAmount} to the address below
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Badge variant="neon-green" className="w-fit">
                        Network: TRC-20 (Tron)
                      </Badge>
                      <div className="flex justify-center p-4 bg-foreground rounded-lg">
                        <QrCode className="h-32 w-32 text-background" />
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all">
                          {usdtAddress}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyAddress(usdtAddress)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="neon"
                        className="w-full"
                        onClick={handleCryptoPayment}
                      >
                        I've Sent the Payment
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
