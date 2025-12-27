// Mock MetaMask/Web3 payment service for demo/testing

interface WalletConnection {
  address: string;
  chainId: number;
  balance: string;
}

interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to: string;
  value: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a mock Ethereum address
const generateMockAddress = (): string => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

export const mockMetaMaskService = {
  isAvailable(): boolean {
    // In demo mode, always return true
    return true;
  },

  async connect(): Promise<WalletConnection> {
    await delay(1500);
    
    // Simulate user approval popup delay
    await delay(1000);
    
    return {
      address: generateMockAddress(),
      chainId: 1, // Ethereum Mainnet
      balance: '0.5234',
    };
  },

  async disconnect(): Promise<void> {
    await delay(500);
  },

  async getBalance(address: string): Promise<string> {
    await delay(500);
    
    // Return random balance for demo
    return (Math.random() * 2).toFixed(4);
  },

  async switchNetwork(chainId: number): Promise<boolean> {
    await delay(1000);
    
    // Simulate network switch
    console.log('[MockMetaMask] Switching to chain:', chainId);
    
    return true;
  },

  async sendTransaction(
    toAddress: string,
    amount: string,
    fromAddress: string
  ): Promise<TransactionResult> {
    await delay(2000);
    
    // Simulate transaction confirmation
    const hash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    return {
      hash,
      status: 'confirmed',
      from: fromAddress,
      to: toAddress,
      value: amount,
    };
  },

  async sendERC20(
    tokenAddress: string,
    toAddress: string,
    amount: string,
    fromAddress: string
  ): Promise<TransactionResult> {
    await delay(2500);
    
    const hash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    return {
      hash,
      status: 'confirmed',
      from: fromAddress,
      to: toAddress,
      value: amount,
    };
  },

  async waitForTransaction(hash: string): Promise<TransactionResult> {
    // Simulate waiting for blockchain confirmation
    await delay(3000);
    
    return {
      hash,
      status: 'confirmed',
      from: '',
      to: '',
      value: '',
    };
  },

  getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      137: 'Polygon',
      56: 'BNB Chain',
      42161: 'Arbitrum One',
      10: 'Optimism',
    };
    
    return networks[chainId] || 'Unknown Network';
  },

  getExplorerUrl(chainId: number, txHash: string): string {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      5: 'https://goerli.etherscan.io/tx/',
      137: 'https://polygonscan.com/tx/',
      56: 'https://bscscan.com/tx/',
    };
    
    return `${explorers[chainId] || 'https://etherscan.io/tx/'}${txHash}`;
  },
};
