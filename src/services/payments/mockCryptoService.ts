// Cryptocurrency payment service using Supabase

import { supabase } from '@/integrations/supabase/client';
import type { CryptoTransaction, AdminWallet, AdminWalletRow, CryptoTransactionRow } from '@/types/database';
import { transformAdminWallet, transformCryptoTransaction } from '@/types/database';

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

// Cache for admin wallets
let cachedWallets: AdminWallet[] = [];
let walletsCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

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

  async getAdminWallets(): Promise<AdminWallet[]> {
    // Return cached if fresh
    if (Date.now() - walletsCacheTime < CACHE_TTL && cachedWallets.length > 0) {
      return cachedWallets;
    }

    try {
      const { data, error } = await supabase
        .from('admin_wallets')
        .select('*')
        .eq('is_active', true)
        .order('currency');

      if (error) throw error;

      cachedWallets = (data || []).map((row) => transformAdminWallet(row as AdminWalletRow));
      walletsCacheTime = Date.now();
      return cachedWallets;
    } catch (error) {
      console.error('Error fetching admin wallets:', error);
      return cachedWallets; // Return stale cache on error
    }
  },

  async getWalletAddress(currency: 'BTC' | 'ETH' | 'USDT' | 'ZCASH'): Promise<string> {
    const wallets = await this.getAdminWallets();
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
    const walletAddress = await this.getWalletAddress(currency);
    
    const { data, error } = await supabase
      .from('crypto_transactions')
      .insert({
        user_id: userId,
        currency,
        wallet_address: walletAddress,
        amount,
        amount_usd: amountUsd,
        tx_hash: `pending_${Date.now()}`,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return transformCryptoTransaction(data as CryptoTransactionRow);
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
    const { data, error } = await supabase
      .from('crypto_transactions')
      .update({
        status: 'confirmed',
        tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      })
      .eq('id', txId)
      .select()
      .single();

    if (error) {
      console.error('Error confirming transaction:', error);
      return undefined;
    }

    return data ? transformCryptoTransaction(data as CryptoTransactionRow) : undefined;
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

  async generateQRData(currency: 'BTC' | 'ETH' | 'USDT' | 'ZCASH', amount: string): Promise<string> {
    const address = await this.getWalletAddress(currency);
    
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
