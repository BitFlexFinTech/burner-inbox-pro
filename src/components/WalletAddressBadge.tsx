/**
 * WalletAddressBadge - Displays a wallet address with copy functionality
 * Shows abbreviated address (0x1234...5678) with tooltip showing full address
 */

import { useState } from "react";
import { Wallet, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { formatWalletAddress } from "@/services/wallet/walletService";
import { cn } from "@/lib/utils";

interface WalletAddressBadgeProps {
  address: string;
  showCopyButton?: boolean;
  variant?: "default" | "compact";
  className?: string;
}

export function WalletAddressBadge({ 
  address, 
  showCopyButton = true, 
  variant = "default",
  className 
}: WalletAddressBadgeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 h-8 px-2 font-mono text-xs", className)}
              onClick={handleCopy}
            >
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">{formatWalletAddress(address)}</span>
              {showCopyButton && (
                copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 opacity-50" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-mono text-xs">
            <p>{address}</p>
            <p className="text-muted-foreground text-[10px] mt-1">Click to copy</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 cursor-pointer hover:bg-muted/70 transition-colors",
              className
            )}
            onClick={handleCopy}
          >
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">{formatWalletAddress(address)}</span>
            {showCopyButton && (
              copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="font-mono text-xs max-w-[300px] break-all">
          <p>{address}</p>
          <p className="text-muted-foreground text-[10px] mt-1">Click to copy full address</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
