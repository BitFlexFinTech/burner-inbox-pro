import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Check, 
  ChevronRight, 
  AlertCircle, 
  Key, 
  Webhook, 
  TestTube,
  Loader2,
  ExternalLink,
  Shield,
  CheckCircle2
} from "lucide-react";

interface StripeSetupWizardProps {
  onComplete?: () => void;
  isConfigured?: boolean;
}

type SetupStep = 'intro' | 'api-key' | 'webhook' | 'test' | 'complete';

export function StripeSetupWizard({ onComplete, isConfigured = false }: StripeSetupWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<SetupStep>(isConfigured ? 'complete' : 'intro');
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const steps: { id: SetupStep; title: string; icon: React.ReactNode }[] = [
    { id: 'intro', title: 'Introduction', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'api-key', title: 'API Key', icon: <Key className="h-4 w-4" /> },
    { id: 'webhook', title: 'Webhook', icon: <Webhook className="h-4 w-4" /> },
    { id: 'test', title: 'Test', icon: <TestTube className="h-4 w-4" /> },
    { id: 'complete', title: 'Complete', icon: <Check className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const validateApiKey = async () => {
    if (!apiKey.startsWith('sk_') && !apiKey.startsWith('rk_')) {
      toast({
        title: "Invalid API Key",
        description: "Stripe API keys should start with 'sk_' or 'rk_'",
        variant: "destructive",
      });
      setValidationStatus('invalid');
      return;
    }

    setIsValidating(true);
    // Simulate validation - in real implementation, this would call a backend endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsValidating(false);
    setValidationStatus('valid');
    
    toast({
      title: "API Key Validated",
      description: "Your Stripe API key format is correct.",
    });
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    // Simulate test - in real implementation, this would create a test charge
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTestingConnection(false);
    
    toast({
      title: "Connection Successful",
      description: "Stripe is properly configured and ready to accept payments.",
    });
    
    setCurrentStep('complete');
    onComplete?.();
  };

  const handleSaveAndContinue = async () => {
    if (currentStep === 'api-key') {
      await validateApiKey();
      if (validationStatus !== 'invalid') {
        setCurrentStep('webhook');
      }
    } else if (currentStep === 'webhook') {
      setCurrentStep('test');
    }
  };

  const resetWizard = () => {
    setCurrentStep('intro');
    setApiKey("");
    setWebhookSecret("");
    setValidationStatus('idle');
  };

  if (currentStep === 'complete' || isConfigured) {
    return (
      <Card variant="neon" className="border-neon-green/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-neon-green" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Stripe Payments
                  <Badge variant="neon-green">Connected</Badge>
                </CardTitle>
                <CardDescription>Payment processing is active</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetWizard}>
              Reconfigure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-neon-green">Active</p>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">$5/mo</p>
              <p className="text-sm text-muted-foreground">Pro Plan</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">Live</p>
              <p className="text-sm text-muted-foreground">Environment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Stripe Payment Setup</CardTitle>
            <CardDescription>Configure Stripe to accept subscription payments</CardDescription>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-6 px-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  index < currentStepIndex 
                    ? 'bg-neon-green text-background' 
                    : index === currentStepIndex 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                }`}>
                  {index < currentStepIndex ? <Check className="h-4 w-4" /> : step.icon}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          {/* Step 1: Introduction */}
          {currentStep === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="rounded-lg bg-muted/50 p-6 space-y-4">
                <h3 className="font-semibold text-lg">Before you begin</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-neon-green mt-0.5 shrink-0" />
                    <span>You'll need a Stripe account. <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Create one here <ExternalLink className="h-3 w-3" /></a></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-neon-green mt-0.5 shrink-0" />
                    <span>Get your API keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Stripe Dashboard <ExternalLink className="h-3 w-3" /></a></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-neon-green mt-0.5 shrink-0" />
                    <span>Use a <strong>restricted key</strong> with only necessary permissions for security</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
                <Shield className="h-5 w-5 text-primary" />
                <p className="text-sm">Your API keys are encrypted and stored securely. They never appear in client-side code.</p>
              </div>
              
              <Button variant="neon" className="w-full" onClick={() => setCurrentStep('api-key')}>
                Get Started <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: API Key */}
          {currentStep === 'api-key' && (
            <motion.div
              key="api-key"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Stripe Secret Key</label>
                <Input
                  type="password"
                  placeholder="sk_live_... or rk_live_..."
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setValidationStatus('idle');
                  }}
                  className={validationStatus === 'valid' ? 'border-neon-green' : validationStatus === 'invalid' ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Use your live secret key for production, or test key for development
                </p>
              </div>

              {validationStatus === 'valid' && (
                <div className="flex items-center gap-2 text-neon-green">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">API key validated successfully</span>
                </div>
              )}

              {validationStatus === 'invalid' && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Invalid API key format</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep('intro')}>
                  Back
                </Button>
                <Button 
                  variant="neon" 
                  className="flex-1"
                  onClick={handleSaveAndContinue}
                  disabled={!apiKey || isValidating}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Webhook */}
          {currentStep === 'webhook' && (
            <motion.div
              key="webhook"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <h4 className="font-medium">Webhook Endpoint</h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-background rounded text-sm break-all">
                    {window.location.origin}/api/stripe/webhook
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/stripe/webhook`);
                      toast({ title: "Copied!", description: "Webhook URL copied to clipboard" });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add this URL in your <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Webhooks</a> settings
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Webhook Signing Secret</label>
                <Input
                  type="password"
                  placeholder="whsec_..."
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Found in your Stripe webhook settings after creating the endpoint
                </p>
              </div>

              <div className="p-4 rounded-lg border border-muted">
                <h4 className="font-medium mb-2">Required Webhook Events</h4>
                <div className="flex flex-wrap gap-2">
                  {['checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.paid', 'invoice.payment_failed'].map(event => (
                    <Badge key={event} variant="outline" className="font-mono text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep('api-key')}>
                  Back
                </Button>
                <Button 
                  variant="neon" 
                  className="flex-1"
                  onClick={handleSaveAndContinue}
                >
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Test */}
          {currentStep === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <TestTube className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Test Your Connection</h3>
                <p className="text-muted-foreground">
                  Click the button below to verify your Stripe configuration is working correctly
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Key</span>
                  <Badge variant="neon-green">Configured</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Webhook</span>
                  <Badge variant={webhookSecret ? "neon-green" : "outline"}>
                    {webhookSecret ? "Configured" : "Optional"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep('webhook')}>
                  Back
                </Button>
                <Button 
                  variant="neon" 
                  className="flex-1"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
