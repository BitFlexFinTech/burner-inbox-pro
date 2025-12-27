import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/mockDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type Feature = 'sms' | 'inboxHistory' | 'forwarding' | 'apiAccess' | 'adsEnabled';

interface FeatureGateProps {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  className?: string;
}

const featureLabels: Record<Feature, { name: string; description: string }> = {
  sms: { 
    name: 'SMS Verification', 
    description: 'Receive SMS verification codes' 
  },
  inboxHistory: { 
    name: 'Inbox History', 
    description: 'Access your email history for 24 hours' 
  },
  forwarding: { 
    name: 'Email Forwarding', 
    description: 'Forward emails to your personal inbox' 
  },
  apiAccess: { 
    name: 'API Access', 
    description: 'Integrate with our REST API' 
  },
  adsEnabled: { 
    name: 'Ad-Free Experience', 
    description: 'Browse without advertisements' 
  },
};

function UpgradePrompt({ feature }: { feature: Feature }) {
  const info = featureLabels[feature];
  
  return (
    <Card variant="glass" className="border-dashed">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <Badge variant="pro" className="mb-3">
          <Crown className="h-3 w-3 mr-1" />
          PRO Feature
        </Badge>
        <h3 className="font-semibold mb-1">{info.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {info.description}
        </p>
        <Button variant="neon" size="sm" asChild className="shimmer">
          <Link to="/pricing">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgrade = true,
  className,
}: FeatureGateProps) {
  const { user } = useAuth();
  const planConfig = db.getPlanConfig(user?.plan || 'free');

  // Check if feature is enabled for the user's plan
  const hasAccess = (() => {
    if (!planConfig) return false;
    
    switch (feature) {
      case 'sms':
        return planConfig.smsEnabled;
      case 'inboxHistory':
        return planConfig.inboxHistory;
      case 'forwarding':
        return planConfig.forwarding;
      case 'apiAccess':
        return planConfig.apiAccess;
      case 'adsEnabled':
        return !planConfig.adsEnabled; // Inverted - Pro users have ads disabled
      default:
        return false;
    }
  })();

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  if (showUpgrade) {
    return (
      <div className={className}>
        <UpgradePrompt feature={feature} />
      </div>
    );
  }

  return null;
}

// Simple inline gate that just hides content
export function FeatureCheck({ 
  feature, 
  children,
}: { 
  feature: Feature; 
  children: ReactNode;
}) {
  const { user } = useAuth();
  const planConfig = db.getPlanConfig(user?.plan || 'free');

  const hasAccess = (() => {
    if (!planConfig) return false;
    
    switch (feature) {
      case 'sms':
        return planConfig.smsEnabled;
      case 'inboxHistory':
        return planConfig.inboxHistory;
      case 'forwarding':
        return planConfig.forwarding;
      case 'apiAccess':
        return planConfig.apiAccess;
      case 'adsEnabled':
        return !planConfig.adsEnabled;
      default:
        return false;
    }
  })();

  if (!hasAccess) return null;
  return <>{children}</>;
}
