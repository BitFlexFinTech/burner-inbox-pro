import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'full';
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
}

export function LanguageSelector({
  variant = 'default',
  showFlag = true,
  showName = true,
  className,
}: LanguageSelectorProps) {
  const { language, setLanguage, languages, currentLanguage, isRTL } = useLanguage();
  const [open, setOpen] = useState(false);

  // Group languages by direction
  const ltrLanguages = languages.filter(l => l.direction === 'ltr');
  const rtlLanguages = languages.filter(l => l.direction === 'rtl');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === 'compact' ? 'icon' : 'default'}
          className={cn(
            'gap-2 transition-all duration-200',
            variant === 'compact' && 'w-10 h-10',
            className
          )}
        >
          {variant === 'compact' ? (
            <span className="text-lg">{currentLanguage.flag}</span>
          ) : (
            <>
              {showFlag && <span className="text-lg">{currentLanguage.flag}</span>}
              {showName && (
                <span className="hidden sm:inline">
                  {variant === 'full' ? currentLanguage.nativeName : currentLanguage.code.toUpperCase()}
                </span>
              )}
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                open && 'rotate-180'
              )} />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isRTL ? 'start' : 'end'}
        className="w-56 max-h-80 overflow-auto"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* LTR Languages */}
        {ltrLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              'flex items-center justify-between cursor-pointer',
              language === lang.code && 'bg-primary/10'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
            </div>
            <AnimatePresence>
              {language === lang.code && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="h-4 w-4 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          RTL Languages
        </DropdownMenuLabel>

        {/* RTL Languages */}
        {rtlLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              'flex items-center justify-between cursor-pointer',
              language === lang.code && 'bg-primary/10'
            )}
            dir="rtl"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
            </div>
            <AnimatePresence>
              {language === lang.code && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="h-4 w-4 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
