/**
 * WalletModal - Modal component for selecting and connecting Web3 wallets
 * Displays available wallets with installation status and deep links
 * Includes WalletConnect for QR code mobile connections
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { detectWallets, WalletType, WalletInfo } from "@/services/wallet/walletService";
import { Loader2, ExternalLink, Wallet, CheckCircle2, QrCode, Smartphone } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (type: WalletType) => void;
  isConnecting: boolean;
  connectingWallet: WalletType | null;
}

// Inline SVG icons for wallets (avoiding external dependencies)
const WalletIcons: Record<WalletType, React.ReactNode> = {
  metamask: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <path fill="#E17726" d="M35.6 4.6l-13.2 9.8 2.4-5.8z"/>
      <path fill="#E27625" d="M4.4 4.6l13 9.9-2.3-5.9zm26.4 21.9l-3.5 5.4 7.5 2.1 2.1-7.3zm-29.2.2l2.1 7.3 7.5-2.1-3.5-5.4z"/>
      <path fill="#E27625" d="M10.9 17.1l-2.1 3.1 7.4.3-.2-8zm18.2 0l-5.2-4.6-.2 8.1 7.4-.3zm-18.5 13.4l4.5-2.2-3.9-3zm9.8-2.2l4.5 2.2-.6-5.2z"/>
      <path fill="#D5BFB2" d="M24.9 30.5l-4.5-2.2.4 3 0 1.3zm-9.8 0l4.1 2.1 0-1.3.4-3z"/>
      <path fill="#233447" d="M15.2 23.4l-3.7-1.1 2.6-1.2zm9.6 0l1.1-2.3 2.6 1.2z"/>
      <path fill="#CC6228" d="M15.1 30.5l.7-5.4-4.2.1zm9.1-5.4l.7 5.4 3.5-5.3zm4.4-4.9l-7.4.3.7 3.9 1.1-2.3 2.6 1.2zm-17.1 3.1l2.6-1.2 1.1 2.3.7-3.9-7.4-.3z"/>
      <path fill="#E27525" d="M8.6 20.2l3 6-0.1-3zm20 2.9l-.1 3 3-6zm-12.6-2.6l-.7 3.9.9 4.5.2-5.9zm7.8 0l-1.4 2.4.2 5.9.9-4.5z"/>
      <path fill="#F5841F" d="M24.7 23.4l-.9 4.5.6.5 3.9-3-.1-3zm-13.2-2.3l-.1 3 3.9 3 .6-.5-.9-4.5z"/>
      <path fill="#C0AC9D" d="M24.8 32.6l0-1.3-.3-.3h-5l-.3.3 0 1.3-4.1-2.1 1.4 1.2 2.9 2h5.1l2.9-2 1.4-1.2z"/>
      <path fill="#161616" d="M24.4 28.3l-.6-.5h-3.6l-.6.5-.4 3 .3-.3h5l.3.3z"/>
      <path fill="#763E1A" d="M36.4 15l1.1-5.4-1.7-5-13.4 9.9 5.2 4.4 7.3 2.1 1.6-1.9-.7-.5 1.1-1-.8-.6 1.1-.9zm-34.9-5.4L2.6 15l-.7.5 1.1.9-.8.6 1.1 1-.7.5 1.6 1.9 7.3-2.1 5.2-4.4L4.3 4.6z"/>
      <path fill="#F5841F" d="M34.9 21.1l-7.3-2.1 2.2 3.3-3 6 4-.1h6zm-24.9-2.1l-7.3 2.1-2.4 7.2h6l4 .1-3-6zm10.8 3.3l.5-8.3 2.2-5.9h-9l2.2 5.9.5 8.3.2 2.5 0 5.9h3.6l0-5.9z"/>
    </svg>
  ),
  trust: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <defs>
        <linearGradient id="trust-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0500FF"/>
          <stop offset="100%" stopColor="#0066FF"/>
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#trust-gradient)"/>
      <path fill="white" d="M20 8c5 0 9.1 4.1 9.1 9.1 0 6.5-6.2 11.6-9.1 14.6-2.9-3-9.1-8.1-9.1-14.6C10.9 12.1 15 8 20 8zm0 2.3c-3.8 0-6.8 3-6.8 6.8 0 4.8 4.6 8.9 6.8 11.2 2.2-2.3 6.8-6.4 6.8-11.2 0-3.8-3-6.8-6.8-6.8z"/>
    </svg>
  ),
  rabby: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <defs>
        <linearGradient id="rabby-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="8" fill="url(#rabby-gradient)"/>
      <ellipse cx="20" cy="18" rx="10" ry="8" fill="white"/>
      <circle cx="15" cy="17" r="2" fill="#7C3AED"/>
      <circle cx="25" cy="17" r="2" fill="#7C3AED"/>
      <ellipse cx="20" cy="24" rx="4" ry="2" fill="white"/>
    </svg>
  ),
  walletconnect: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <defs>
        <linearGradient id="wc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B99FC"/>
          <stop offset="100%" stopColor="#2B6CB0"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#wc-gradient)"/>
      <path fill="white" d="M12.5 16c4.1-4 10.8-4 15 0l.5.5c.2.2.2.5 0 .7l-1.7 1.6c-.1.1-.3.1-.4 0l-.7-.7c-2.9-2.8-7.5-2.8-10.4 0l-.7.7c-.1.1-.3.1-.4 0L12 17.2c-.2-.2-.2-.5 0-.7l.5-.5zm18.5 3.4l1.5 1.5c.2.2.2.5 0 .7l-6.8 6.6c-.2.2-.5.2-.7 0l-4.8-4.7c0-.1-.1-.1-.2 0l-4.8 4.7c-.2.2-.5.2-.7 0l-6.8-6.6c-.2-.2-.2-.5 0-.7l1.5-1.5c.2-.2.5-.2.7 0l4.8 4.7c0 .1.1.1.2 0l4.8-4.7c.2-.2.5-.2.7 0l4.8 4.7c0 .1.1.1.2 0l4.8-4.7c.2-.2.5-.2.7 0z"/>
    </svg>
  ),
};

export function WalletModal({ 
  isOpen, 
  onClose, 
  onSelectWallet, 
  isConnecting, 
  connectingWallet 
}: WalletModalProps) {
  const wallets = detectWallets();
  
  // Separate browser wallets and WalletConnect
  const browserWallets = wallets.filter(w => w.type !== 'walletconnect');
  const walletConnect = wallets.find(w => w.type === 'walletconnect');
  const installedBrowserWallets = browserWallets.filter(w => w.installed);
  const notInstalledWallets = browserWallets.filter(w => !w.installed);

  const handleWalletClick = (wallet: WalletInfo) => {
    if (wallet.installed || wallet.type === 'walletconnect') {
      onSelectWallet(wallet.type);
    } else {
      window.open(wallet.deepLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to sign in securely without a password
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* WalletConnect - Featured Option */}
          {walletConnect && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                <Smartphone className="h-3 w-3" />
                Mobile Wallets
              </p>
              <Button
                variant="outline"
                className="w-full justify-start h-16 hover:bg-accent/50 transition-colors border-primary/30 hover:border-primary/50"
                disabled={isConnecting}
                onClick={() => handleWalletClick(walletConnect)}
              >
                <div className="flex items-center gap-3 w-full">
                  {WalletIcons[walletConnect.type]}
                  <div className="flex-1 text-left">
                    <span className="font-medium block">{walletConnect.name}</span>
                    <span className="text-xs text-muted-foreground">{walletConnect.description}</span>
                  </div>
                  {isConnecting && connectingWallet === 'walletconnect' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <QrCode className="h-4 w-4 text-primary" />
                  )}
                </div>
              </Button>
            </div>
          )}

          {/* Installed Browser Wallets */}
          {installedBrowserWallets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Browser Wallets
              </p>
              {installedBrowserWallets.map((wallet) => (
                <Button
                  key={wallet.type}
                  variant="outline"
                  className="w-full justify-start h-14 hover:bg-accent/50 transition-colors"
                  disabled={isConnecting}
                  onClick={() => handleWalletClick(wallet)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {WalletIcons[wallet.type]}
                    <span className="flex-1 text-left font-medium">{wallet.name}</span>
                    {isConnecting && connectingWallet === wallet.type ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Not Installed Wallets */}
          {notInstalledWallets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {installedBrowserWallets.length > 0 ? 'Other Wallets' : 'Install a Wallet'}
              </p>
              {notInstalledWallets.map((wallet) => (
                <Button
                  key={wallet.type}
                  variant="ghost"
                  className="w-full justify-start h-14 opacity-70 hover:opacity-100"
                  onClick={() => handleWalletClick(wallet)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {WalletIcons[wallet.type]}
                    <span className="flex-1 text-left font-medium">{wallet.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Install <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* No browser wallets detected message */}
          {browserWallets.every(w => !w.installed) && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              <p>No browser wallet detected.</p>
              <p className="text-xs mt-1">Use WalletConnect above or install a browser wallet.</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-center text-muted-foreground">
            By connecting, you agree to our Terms of Service and Privacy Policy.
            Your wallet address will be used as your unique identifier.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
