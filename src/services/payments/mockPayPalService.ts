// Mock PayPal payment service for demo/testing

interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  approvalUrl: string;
  amount: number;
  currency: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockPayPalService = {
  async createOrder(userId: string, amount: number = 5.00): Promise<PayPalOrder> {
    await delay(1200);
    
    return {
      id: `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'CREATED',
      approvalUrl: '#paypal-mock-approval',
      amount,
      currency: 'USD',
    };
  },

  async captureOrder(orderId: string): Promise<PayPalOrder> {
    await delay(1500);
    
    return {
      id: orderId,
      status: 'COMPLETED',
      approvalUrl: '',
      amount: 5.00,
      currency: 'USD',
    };
  },

  async simulateApproval(orderId: string): Promise<PayPalOrder> {
    await delay(1000);
    
    return {
      id: orderId,
      status: 'APPROVED',
      approvalUrl: '',
      amount: 5.00,
      currency: 'USD',
    };
  },

  async handleIPN(event: { orderId: string; status: string }): Promise<{ verified: boolean }> {
    await delay(500);
    
    console.log('[MockPayPal] IPN received:', event);
    
    return { verified: true };
  },

  async getOrderStatus(orderId: string): Promise<PayPalOrder['status']> {
    await delay(500);
    
    return 'COMPLETED';
  },
};
