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
  Shield,
  Wallet,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { mockStripeService, mockPayPalService, mockCryptoService, mockMetaMaskService } from "@/services/payments";
import { db } from "@/lib/mockDatabase";

type PaymentMethod = "stripe" | "paypal" | "btc" | "usdt" | "eth" | "zcash" | "metamask";

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updatePlan } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [metaMaskConnected, setMetaMaskConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const adminWallets = db.getAdminWallets();
  const btcWallet = adminWallets.find(w => w.currency === 'BTC');
  const usdtWallet = adminWallets.find(w => w.currency === 'USDT');
  const ethWallet = adminWallets.find(w => w.currency === 'ETH');
  const zcashWallet = adminWallets.find(w => w.currency === 'ZCASH');

  const cryptoAmounts = {
    btc: mockCryptoService.calculateAmount(5, 'BTC'),
    usdt: mockCryptoService.calculateAmount(5, 'USDT'),
    eth: mockCryptoService.calculateAmount(5, 'ETH'),
    zcash: mockCryptoService.calculateAmount(5, 'ZCASH'),
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address copied!",
      description: "Wallet address copied to clipboard.",
    });
  };

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    try {
      const session = await mockStripeService.createCheckoutSession(user?.id || 'guest');
      
      // Log the transaction
      db.addAuditLog({
        userId: user?.id,
        action: 'payment_initiated',
        entityType: 'subscription',
        entityId: session.id,
        metadata: { provider: 'stripe', amount: 5 },
      });

      updatePlan('premium');
      navigate("/payment/success");
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again or use a different payment method.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalCheckout = async () => {
    setIsProcessing(true);
    try {
      const order = await mockPayPalService.createOrder(user?.id || 'guest');
      await mockPayPalService.simulateApproval(order.id);
      await mockPayPalService.captureOrder(order.id);
      
      db.addAuditLog({
        userId: user?.id,
        action: 'payment_completed',
        entityType: 'subscription',
        entityId: order.id,
        metadata: { provider: 'paypal', amount: 5 },
      });

      updatePlan('premium');
      navigate("/payment/success");
    } catch (error) {
      toast({
        title: "PayPal payment failed",
        description: "Please try again or use a different payment method.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMetaMaskConnect = async () => {
    setIsProcessing(true);
    try {
      const connection = await mockMetaMaskService.connect();
      setMetaMaskConnected(true);
      setWalletAddress(connection.address);
      toast({
        title: "Wallet connected!",
        description: `Connected: ${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`,
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Could not connect to MetaMask.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMetaMaskPayment = async () => {
    if (!metaMaskConnected) return;
    
    setIsProcessing(true);
    try {
      const tx = await mockMetaMaskService.sendTransaction(
        ethWallet?.address || '',
        cryptoAmounts.eth,
        walletAddress
      );
      
      await mockMetaMaskService.waitForTransaction(tx.hash);
      
      db.createCryptoTransaction({
        userId: user?.id || 'guest',
        currency: 'ETH',
        walletAddress: ethWallet?.address || '',
        amount: cryptoAmounts.eth,
        amountUsd: 5,
        txHash: tx.hash,
        status: 'confirmed',
      });

      updatePlan('premium');
      navigate("/payment/success");
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoPayment = async (currency: 'BTC' | 'USDT' | 'ETH' | 'ZCASH') => {
    setIsProcessing(true);
    try {
      const tx = await mockCryptoService.initiatePendingTransaction(
        user?.id || 'guest',
        currency,
        5
      );

      toast({
        title: "Payment initiated",
        description: "We're monitoring for your transaction. You'll be notified once confirmed.",
      });

      // Simulate blockchain confirmation
      await mockCryptoService.simulateBlockchainConfirmation(tx.id);
      
      updatePlan('premium');
      navigate("/payment/success");
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Transaction could not be verified.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentOptions: { id: PaymentMethod; label: string; sublabel: string; icon: React.ReactNode; color: string }[] = [
    { id: 'stripe', label: 'Credit / Debit Card', sublabel: 'Powered by Stripe', icon: <CreditCard className="h-6 w-6 text-[#635bff]" />, color: '#635bff' },
    { id: 'paypal', label: 'PayPal', sublabel: 'Fast & secure', icon: <span className="text-[#003087] font-bold text-lg">P</span>, color: '#003087' },
    { id: 'btc', label: 'Bitcoin (BTC)', sublabel: `≈ ${cryptoAmounts.btc} BTC`, icon: <Bitcoin className="h-6 w-6 text-neon-orange" />, color: 'hsl(var(--neon-orange))' },
    { id: 'usdt', label: 'USDT (TRC-20)', sublabel: `${cryptoAmounts.usdt} USDT`, icon: <span className="text-neon-green font-bold text-lg">₮</span>, color: 'hsl(var(--neon-green))' },
    { id: 'eth', label: 'Ethereum (ETH)', sublabel: `≈ ${cryptoAmounts.eth} ETH`, icon: <span className="text-[#627eea] font-bold text-lg">Ξ</span>, color: '#627eea' },
    { id: 'zcash', label: 'Zcash (ZEC)', sublabel: `≈ ${cryptoAmounts.zcash} ZEC`, icon: <span className="text-[#f4b728] font-bold text-lg">ⓩ</span>, color: '#f4b728' },
    { id: 'metamask', label: 'MetaMask', sublabel: 'Pay with Web3 wallet', icon: <Wallet className="h-6 w-6 text-[#f6851b]" />, color: '#f6851b' },
  ];

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

              <div className="grid gap-3">
                {paymentOptions.map((option) => (
                  <Card
                    key={option.id}
                    variant={paymentMethod === option.id ? "neon" : "default"}
                    className={`cursor-pointer transition-all ${
                      paymentMethod === option.id ? "ring-2" : ""
                    }`}
                    style={{ 
                      ['--tw-ring-color' as any]: paymentMethod === option.id ? option.color : undefined 
                    }}
                    onClick={() => setPaymentMethod(option.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{option.label}</h3>
                        <p className="text-sm text-muted-foreground">{option.sublabel}</p>
                      </div>
                      {paymentMethod === option.id && (
                        <Check className="h-5 w-5" style={{ color: option.color }} />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="mt-8">
              {/* Stripe */}
              {paymentMethod === "stripe" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    variant="neon"
                    size="lg"
                    className="w-full shimmer"
                    onClick={handleStripeCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {isProcessing ? "Processing..." : "Pay with Card - $5.00"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
                    <Shield className="h-3 w-3" />
                    Secured by Stripe. Your card info is never stored.
                  </p>
                </motion.div>
              )}

              {/* PayPal */}
              {paymentMethod === "paypal" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    size="lg"
                    className="w-full bg-[#003087] hover:bg-[#002060] text-white"
                    onClick={handlePayPalCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {isProcessing ? "Connecting to PayPal..." : "Pay with PayPal - $5.00"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    You'll be redirected to PayPal to complete payment
                  </p>
                </motion.div>
              )}

              {/* MetaMask */}
              {paymentMethod === "metamask" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-[#f6851b]" />
                        Pay with MetaMask
                      </CardTitle>
                      <CardDescription>
                        Send ETH directly from your wallet
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!metaMaskConnected ? (
                        <Button
                          className="w-full bg-[#f6851b] hover:bg-[#e2761b] text-white"
                          onClick={handleMetaMaskConnect}
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wallet className="h-4 w-4 mr-2" />}
                          Connect MetaMask
                        </Button>
                      ) : (
                        <>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
                            <code className="text-sm font-mono">
                              {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                            </code>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Amount</p>
                            <p className="font-mono">{cryptoAmounts.eth} ETH</p>
                          </div>
                          <Button
                            variant="neon"
                            className="w-full"
                            onClick={handleMetaMaskPayment}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            {isProcessing ? "Confirming Transaction..." : `Send ${cryptoAmounts.eth} ETH`}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* BTC */}
              {paymentMethod === "btc" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bitcoin className="h-5 w-5 text-neon-orange" />
                        Send Bitcoin
                      </CardTitle>
                      <CardDescription>
                        Send exactly {cryptoAmounts.btc} BTC to the address below
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center p-4 bg-foreground rounded-lg">
                        <QrCode className="h-32 w-32 text-background" />
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all">
                          {btcWallet?.address}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyAddress(btcWallet?.address || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="neon"
                        className="w-full"
                        onClick={() => handleCryptoPayment('BTC')}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        {isProcessing ? "Waiting for confirmation..." : "I've Sent the Payment"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* USDT */}
              {paymentMethod === "usdt" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-neon-green font-bold">₮</span>
                        Send USDT (TRC-20)
                      </CardTitle>
                      <CardDescription>
                        Send exactly {cryptoAmounts.usdt} USDT to the address below
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
                          {usdtWallet?.address}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyAddress(usdtWallet?.address || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="neon"
                        className="w-full"
                        onClick={() => handleCryptoPayment('USDT')}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        {isProcessing ? "Waiting for confirmation..." : "I've Sent the Payment"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ETH (without MetaMask) */}
              {paymentMethod === "eth" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-[#627eea] font-bold text-xl">Ξ</span>
                        Send Ethereum
                      </CardTitle>
                      <CardDescription>
                        Send exactly {cryptoAmounts.eth} ETH to the address below
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Badge variant="outline" className="w-fit">
                        Network: Ethereum Mainnet
                      </Badge>
                      <div className="flex justify-center p-4 bg-foreground rounded-lg">
                        <QrCode className="h-32 w-32 text-background" />
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all">
                          {ethWallet?.address}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyAddress(ethWallet?.address || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="neon"
                        className="w-full"
                        onClick={() => handleCryptoPayment('ETH')}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        {isProcessing ? "Waiting for confirmation..." : "I've Sent the Payment"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Zcash */}
              {paymentMethod === "zcash" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-[#f4b728] font-bold text-xl">ⓩ</span>
                        Send Zcash
                      </CardTitle>
                      <CardDescription>
                        Send exactly {cryptoAmounts.zcash} ZEC to the address below
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Badge className="w-fit bg-[#f4b728]/10 text-[#f4b728] border-[#f4b728]/30">
                        Private & Shielded
                      </Badge>
                      <div className="flex justify-center p-4 bg-foreground rounded-lg">
                        <QrCode className="h-32 w-32 text-background" />
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all">
                          {zcashWallet?.address}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyAddress(zcashWallet?.address || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="neon"
                        className="w-full"
                        onClick={() => handleCryptoPayment('ZCASH')}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        {isProcessing ? "Waiting for confirmation..." : "I've Sent the Payment"}
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
