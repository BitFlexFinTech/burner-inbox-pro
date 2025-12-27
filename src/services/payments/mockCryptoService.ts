// Mock cryptocurrency payment service for demo/testing

import { db } from '@/lib/mockDatabase';
import type { CryptoTransaction } from '@/types/database';

interface CryptoPrice {
  btc: number;
  eth: number;
  usdt: number;
  zcash: number;
}

const mockPrices: CryptoPrice = {
  btc: 42000,
  eth: 2500,
  usdt: 1,
  zcash: 30,
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockCryptoService = {
  getCryptoPrices(): CryptoPrice {
    return mockPrices;
  },

  calculateAmount(usdAmount: number, currency: 'BTC' | 'ETH' | 'USDT' | 'ZCASH'): string {
    const price = mockPrices[currency.toLowerCase() as keyof CryptoPrice];
    const amount = usdAmount / price;
    
    if (currency === 'USDT') {
      return amount.toFixed(2);
    } else if (currency === 'BTC') {
      return amount.toFixed(8);
    } else if (currency === 'ETH') {
      return amount.toFixed(6);
    } else {
      return amount.toFixed(4);
    }
  },

  getWalletAddress(currency: 'BTC' | 'ETH' | 'USDT' | 'ZCASH'): string {
    const wallets = db.getAdminWallets();
    const wallet = wallets.find(w => w.currency === currency && w.isActive);
    return wallet?.address || '';
  },

  async initiatePendingTransaction(
    userId: string, 
    currency: 'BTC' | 'ETH' | 'USDT' | 'ZCASH',
    amountUsd: number
  ): Promise<CryptoTransaction> {
    await delay(500);
    
    const amount = this.calculateAmount(amountUsd, currency);
    const walletAddress = this.getWalletAddress(currency);
    
    return db.createCryptoTransaction({
      userId,
      currency,
      walletAddress,
      amount,
      amountUsd,
      txHash: `pending_${Date.now()}`,
      status: 'pending',
    });
  },

  async checkTransactionStatus(txId: string): Promise<CryptoTransaction['status']> {
    await delay(1000);
    
    // Simulate random confirmation (70% success, 10% pending, 20% failed for demo)
    const rand = Math.random();
    if (rand < 0.7) return 'confirmed';
    if (rand < 0.8) return 'pending';
    return 'failed';
  },

  async simulateBlockchainConfirmation(txId: string): Promise<CryptoTransaction | undefined> {
    // Simulate blockchain confirmation delay (5 seconds)
    await delay(5000);
    
    // Update transaction to confirmed
    return db.updateCryptoTransaction(txId, {
      status: 'confirmed',
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    });
  },

  async verifyTransaction(
    currency: 'BTC' | 'ETH' | 'USDT' | 'ZCASH',
    txHash: string,
    expectedAmount: string
  ): Promise<{ verified: boolean; confirmations: number }> {
    await delay(1500);
    
    // Mock verification - always returns success for demo
    return {
      verified: true,
      confirmations: 6,
    };
  },

  generateQRData(currency: 'BTC' | 'ETH' | 'USDT' | 'ZCASH', amount: string): string {
    const address = this.getWalletAddress(currency);
    
    switch (currency) {
      case 'BTC':
        return `bitcoin:${address}?amount=${amount}`;
      case 'ETH':
        return `ethereum:${address}?value=${amount}`;
      case 'ZCASH':
        return `zcash:${address}?amount=${amount}`;
      default:
        return address;
    }
  },
};
