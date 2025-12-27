// Mock Stripe payment service for demo/testing

interface CheckoutSession {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
  customerId: string;
  amount: number;
  currency: string;
}

interface BillingPortalSession {
  url: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockStripeService = {
  async createCheckoutSession(userId: string, priceId: string = 'price_premium'): Promise<CheckoutSession> {
    await delay(1500);
    
    return {
      id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: '/payment/success',
      status: 'complete',
      customerId: `cus_${userId}`,
      amount: 500, // $5.00 in cents
      currency: 'usd',
    };
  },

  async handleWebhook(event: { type: string; data: any }): Promise<{ success: boolean }> {
    await delay(500);
    
    console.log('[MockStripe] Processing webhook:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('[MockStripe] Checkout completed for:', event.data.customerId);
        break;
      case 'customer.subscription.created':
        console.log('[MockStripe] Subscription created');
        break;
      case 'customer.subscription.deleted':
        console.log('[MockStripe] Subscription cancelled');
        break;
      case 'invoice.paid':
        console.log('[MockStripe] Invoice paid');
        break;
      default:
        console.log('[MockStripe] Unhandled event type:', event.type);
    }
    
    return { success: true };
  },

  async createBillingPortalSession(customerId: string): Promise<BillingPortalSession> {
    await delay(1000);
    
    return {
      url: `/settings?billing=true`,
    };
  },

  async getSubscriptionStatus(customerId: string): Promise<{
    status: 'active' | 'cancelled' | 'past_due' | 'none';
    currentPeriodEnd?: string;
  }> {
    await delay(500);
    
    return {
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },
};
