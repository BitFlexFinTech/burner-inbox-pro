import { useAppMode } from '@/contexts/AppModeContext';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  className?: string;
}

export function ModeToggle({ className }: ModeToggleProps) {
  const { mode, setMode } = useAppMode();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => setMode('demo')}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-l-md transition-all",
          mode === 'demo'
            ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(185_100%_50%/0.4)]"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        Demo
      </button>
      <button
        onClick={() => setMode('live')}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-r-md transition-all",
          mode === 'live'
            ? "bg-secondary text-secondary-foreground shadow-[0_0_10px_hsl(320_100%_50%/0.4)]"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        Live
      </button>
    </div>
  );
}
