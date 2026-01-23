/**
 * Wallet Service - Utilities for Web3 wallet detection, connection, and signing
 * Supports MetaMask, Trust Wallet, Rabby Wallet, and WalletConnect
 */

import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Wallet types supported by the application
export type WalletType = 'metamask' | 'trust' | 'rabby' | 'walletconnect';

// Information about a wallet
export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  installed: boolean;
  deepLink: string;
  description?: string;
}

// Active wallet connection data
export interface WalletConnection {
  address: string;
  chainId: number;
  walletType: WalletType;
}

// WalletConnect provider instance (singleton)
let walletConnectProvider: Awaited<ReturnType<typeof EthereumProvider.init>> | null = null;

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

// WalletConnect Project ID (public - can be in code)
// Users should create their own at https://cloud.walletconnect.com for production
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64';

/**
 * Detect which wallets are installed in the browser
 * Returns array of wallet info with installation status
 */
export function detectWallets(): WalletInfo[] {
  const ethereum = window.ethereum;
  
  const browserWallets: WalletInfo[] = [
    {
      type: 'metamask',
      name: 'MetaMask',
      icon: '/wallets/metamask.svg',
      installed: Boolean(ethereum?.isMetaMask),
      deepLink: 'https://metamask.io/download/',
      description: 'Popular browser extension wallet',
    },
    {
      type: 'trust',
      name: 'Trust Wallet',
      icon: '/wallets/trust.svg',
      installed: Boolean(ethereum?.isTrust),
      deepLink: 'https://trustwallet.com/download',
      description: 'Mobile-first crypto wallet',
    },
    {
      type: 'rabby',
      name: 'Rabby Wallet',
      icon: '/wallets/rabby.svg',
      installed: Boolean(ethereum?.isRabby),
      deepLink: 'https://rabby.io/',
      description: 'DeFi-focused browser wallet',
    },
  ];

  // WalletConnect is always available (uses QR code)
  const walletConnect: WalletInfo = {
    type: 'walletconnect',
    name: 'WalletConnect',
    icon: '/wallets/walletconnect.svg',
    installed: true, // Always available
    deepLink: '',
    description: 'Scan QR with mobile wallet',
  };

  return [...browserWallets, walletConnect];
}

/**
 * Check if any Web3 wallet is available
 */
export function isWalletAvailable(): boolean {
  return Boolean(window.ethereum);
}

/**
 * Initialize WalletConnect provider
 */
export async function initWalletConnect() {
  if (walletConnectProvider) {
    return walletConnectProvider;
  }

  walletConnectProvider = await EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: [1], // Ethereum Mainnet
    optionalChains: [137, 56, 42161], // Polygon, BSC, Arbitrum
    showQrModal: true,
    metadata: {
      name: 'BurnerMAIL',
      description: 'Privacy-focused temporary email service',
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.ico`],
    },
  });

  return walletConnectProvider;
}

/**
 * Connect via WalletConnect (shows QR code modal)
 */
export async function connectWalletConnect(): Promise<WalletConnection> {
  try {
    const provider = await initWalletConnect();
    
    // Enable the provider - this shows the QR modal
    await provider.connect();
    
    const accounts = provider.accounts;
    const chainId = provider.chainId;

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }

    return {
      address: accounts[0].toLowerCase(),
      chainId: chainId,
      walletType: 'walletconnect',
    };
  } catch (error: unknown) {
    // Clean up on error
    if (walletConnectProvider) {
      try {
        await walletConnectProvider.disconnect();
      } catch {}
      walletConnectProvider = null;
    }
    
    if (error instanceof Error) {
      if (error.message.includes('User rejected') || error.message.includes('rejected')) {
        throw new Error('WalletConnect connection was rejected by user.');
      }
      throw error;
    }
    throw new Error('Failed to connect via WalletConnect.');
  }
}

/**
 * Connect to the user's wallet and request account access
 * @param walletType - The type of wallet to connect to
 * @returns WalletConnection with address and chain info
 */
export async function connectWallet(walletType: WalletType): Promise<WalletConnection> {
  // Use WalletConnect for mobile QR code connection
  if (walletType === 'walletconnect') {
    return connectWalletConnect();
  }

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
 * @param walletType - The wallet type being used
 * @returns The signature
 */
export async function signMessage(message: string, walletType?: WalletType): Promise<string> {
  // Use WalletConnect provider if that's the wallet type
  if (walletType === 'walletconnect' && walletConnectProvider) {
    try {
      const accounts = walletConnectProvider.accounts;
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts connected via WalletConnect.');
      }

      const signature = await walletConnectProvider.request({
        method: 'personal_sign',
        params: [message, accounts[0]],
      }) as string;

      return signature;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          throw new Error('Message signing was rejected by user.');
        }
        throw error;
      }
      throw new Error('Failed to sign message via WalletConnect.');
    }
  }

  // Use browser wallet
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
 * Disconnect wallet (clear local state and WalletConnect session)
 */
export async function disconnectWallet(): Promise<void> {
  // Disconnect WalletConnect if active
  if (walletConnectProvider) {
    try {
      await walletConnectProvider.disconnect();
    } catch {}
    walletConnectProvider = null;
  }

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

/**
 * Get the current WalletConnect provider instance
 */
export function getWalletConnectProvider() {
  return walletConnectProvider;
}
