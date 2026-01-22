/**
 * useWalletAuth Hook - Orchestrates Web3 wallet authentication flow
 * Handles connection, nonce request, signature, and verification
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  connectWallet, 
  signMessage, 
  storeWalletConnection,
  disconnectWallet,
  WalletType, 
  WalletConnection 
} from '@/services/wallet/walletService';

interface WalletAuthResult {
  success: boolean;
  error?: string;
  isNewUser?: boolean;
}

interface UseWalletAuthReturn {
  loginWithWallet: (walletType: WalletType) => Promise<WalletAuthResult>;
  isConnecting: boolean;
  error: string | null;
  clearError: () => void;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loginWithWallet = useCallback(async (walletType: WalletType): Promise<WalletAuthResult> => {
    setIsConnecting(true);
    setError(null);

    try {
      // Step 1: Connect to the wallet and get address
      console.log('[WalletAuth] Connecting to wallet...');
      const connection: WalletConnection = await connectWallet(walletType);
      console.log('[WalletAuth] Connected:', connection.address);

      // Step 2: Request nonce from backend
      console.log('[WalletAuth] Requesting nonce...');
      const nonceResponse = await supabase.functions.invoke('wallet-auth', {
        body: { 
          action: 'request_nonce', 
          wallet_address: connection.address 
        }
      });

      if (nonceResponse.error) {
        throw new Error(nonceResponse.error.message || 'Failed to request nonce');
      }

      const { message } = nonceResponse.data;
      console.log('[WalletAuth] Received nonce, requesting signature...');

      // Step 3: Sign the nonce message with the wallet
      const signature = await signMessage(message);
      console.log('[WalletAuth] Message signed, verifying...');

      // Step 4: Verify signature and authenticate
      const verifyResponse = await supabase.functions.invoke('wallet-auth', {
        body: {
          action: 'verify',
          wallet_address: connection.address,
          signature,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          }
        }
      });

      if (verifyResponse.error) {
        throw new Error(verifyResponse.error.message || 'Verification failed');
      }

      const { token, email, is_new_user } = verifyResponse.data;
      console.log('[WalletAuth] Verification successful, completing auth...');

      // Step 5: Complete authentication with Supabase using the token
      if (token && email) {
        const { error: signInError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });

        if (signInError) {
          console.error('[WalletAuth] OTP verification error:', signInError);
          // Try magic link as fallback
          const { error: magicLinkError } = await supabase.auth.signInWithOtp({
            email,
          });
          
          if (magicLinkError) {
            throw new Error('Failed to complete authentication');
          }
        }
      }

      // Store connection info locally
      storeWalletConnection(connection);

      console.log('[WalletAuth] Authentication complete!');
      return { 
        success: true, 
        isNewUser: is_new_user 
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Wallet authentication failed';
      console.error('[WalletAuth] Error:', errorMessage);
      setError(errorMessage);
      
      // Clean up on failure
      disconnectWallet();
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return { 
    loginWithWallet, 
    isConnecting, 
    error, 
    clearError 
  };
}
