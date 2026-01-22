/**
 * Wallet Service - Utilities for Web3 wallet detection, connection, and signing
 * Supports MetaMask, Trust Wallet, and Rabby Wallet
 */

// Wallet types supported by the application
export type WalletType = 'metamask' | 'trust' | 'rabby';

// Information about a wallet
export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  installed: boolean;
  deepLink: string;
}

// Active wallet connection data
export interface WalletConnection {
  address: string;
  chainId: number;
  walletType: WalletType;
}

// Extend window for ethereum provider
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isTrust?: boolean;
      isRabby?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

/**
 * Detect which wallets are installed in the browser
 * Returns array of wallet info with installation status
 */
export function detectWallets(): WalletInfo[] {
  const ethereum = window.ethereum;
  
  return [
    {
      type: 'metamask',
      name: 'MetaMask',
      icon: '/wallets/metamask.svg',
      installed: Boolean(ethereum?.isMetaMask),
      deepLink: 'https://metamask.io/download/',
    },
    {
      type: 'trust',
      name: 'Trust Wallet',
      icon: '/wallets/trust.svg',
      installed: Boolean(ethereum?.isTrust),
      deepLink: 'https://trustwallet.com/download',
    },
    {
      type: 'rabby',
      name: 'Rabby Wallet',
      icon: '/wallets/rabby.svg',
      installed: Boolean(ethereum?.isRabby),
      deepLink: 'https://rabby.io/',
    },
  ];
}

/**
 * Check if any Web3 wallet is available
 */
export function isWalletAvailable(): boolean {
  return Boolean(window.ethereum);
}

/**
 * Connect to the user's wallet and request account access
 * @param walletType - The type of wallet to connect to
 * @returns WalletConnection with address and chain info
 */
export async function connectWallet(walletType: WalletType): Promise<WalletConnection> {
  const ethereum = window.ethereum;
  
  if (!ethereum) {
    throw new Error('No Web3 wallet detected. Please install MetaMask, Trust Wallet, or Rabby.');
  }

  try {
    // Request account access
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    // Get current chain ID
    const chainId = await ethereum.request({ method: 'eth_chainId' }) as string;

    return {
      address: accounts[0].toLowerCase(),
      chainId: parseInt(chainId, 16),
      walletType,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      // User rejected the request
      if (error.message.includes('User rejected') || (error as { code?: number }).code === 4001) {
        throw new Error('Wallet connection was rejected by user.');
      }
      throw error;
    }
    throw new Error('Failed to connect wallet.');
  }
}

/**
 * Get currently connected accounts (if any)
 */
export async function getConnectedAccounts(): Promise<string[]> {
  const ethereum = window.ethereum;
  
  if (!ethereum) {
    return [];
  }

  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
    return accounts.map(a => a.toLowerCase());
  } catch {
    return [];
  }
}

/**
 * Sign a message with the user's wallet using personal_sign (EIP-191)
 * @param message - The message to sign
 * @returns The signature
 */
export async function signMessage(message: string): Promise<string> {
  const ethereum = window.ethereum;
  
  if (!ethereum) {
    throw new Error('No Web3 wallet detected.');
  }

  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts connected. Please connect your wallet first.');
    }

    // Use personal_sign for EIP-191 message signing
    const signature = await ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]],
    }) as string;

    return signature;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('User rejected') || (error as { code?: number }).code === 4001) {
        throw new Error('Message signing was rejected by user.');
      }
      throw error;
    }
    throw new Error('Failed to sign message.');
  }
}

/**
 * Disconnect wallet (clear local state)
 * Note: This doesn't actually disconnect from the wallet,
 * as that's controlled by the user in the wallet itself
 */
export function disconnectWallet(): void {
  localStorage.removeItem('wallet_connected');
  localStorage.removeItem('wallet_address');
  localStorage.removeItem('wallet_type');
}

/**
 * Store wallet connection info locally
 */
export function storeWalletConnection(connection: WalletConnection): void {
  localStorage.setItem('wallet_connected', 'true');
  localStorage.setItem('wallet_address', connection.address);
  localStorage.setItem('wallet_type', connection.walletType);
}

/**
 * Get stored wallet connection info
 */
export function getStoredWalletConnection(): WalletConnection | null {
  const connected = localStorage.getItem('wallet_connected');
  const address = localStorage.getItem('wallet_address');
  const walletType = localStorage.getItem('wallet_type') as WalletType | null;

  if (connected === 'true' && address && walletType) {
    return {
      address,
      chainId: 0, // Chain ID not stored, will be fetched on reconnect
      walletType,
    };
  }

  return null;
}

/**
 * Format wallet address for display (0x1234...5678)
 */
export function formatWalletAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
