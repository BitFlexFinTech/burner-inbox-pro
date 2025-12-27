import { Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountdown } from '@/hooks/useCountdown';
import { Button } from '@/components/ui/button';
import { FeatureCheck } from '@/components/FeatureGate';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ExpirationTimerProps {
  expiresAt: string;
  onExtend?: () => void;
  showExtend?: boolean;
  className?: string;
}

export function ExpirationTimer({ 
  expiresAt, 
  onExtend, 
  showExtend = true,
  className,
}: ExpirationTimerProps) {
  const { formatted, isExpired, isUrgent, isCritical } = useCountdown(expiresAt);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-mono',
              isExpired && 'text-muted-foreground',
              isUrgent && !isCritical && 'text-yellow-500',
              isCritical && 'text-destructive animate-pulse'
            )}
          >
            <Clock className="h-3 w-3" />
            <span>{formatted}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isExpired 
            ? 'This inbox has expired' 
            : `Expires in ${formatted}`
          }
        </TooltipContent>
      </Tooltip>

      {showExtend && isCritical && !isExpired && onExtend && (
        <FeatureCheck feature="inboxHistory">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onExtend();
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Extend inbox lifetime</TooltipContent>
          </Tooltip>
        </FeatureCheck>
      )}
    </div>
  );
}
