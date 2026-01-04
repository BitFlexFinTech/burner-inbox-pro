import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, effectiveIsAdmin } = useAuth();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/", label: t('navigation.home') },
    { href: "/pricing", label: t('navigation.pricing') },
    { href: "/dashboard", label: t('navigation.dashboard') },
    ...(effectiveIsAdmin ? [{ href: "/admin", label: t('navigation.admin') || "Admin" }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Mail className="h-8 w-8 text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_10px_hsl(185_100%_50%/0.8)]" />
              <div className="absolute inset-0 blur-lg bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Burner<span className="text-primary">MAIL</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Language Selector & Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector variant="compact" />
            <RoleSwitcher />
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">{t('navigation.login')}</Link>
                </Button>
                <Button variant="neon" asChild>
                  <Link to="/auth?mode=signup">{t('navigation.getStarted')}</Link>
                </Button>
              </>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/dashboard">{t('navigation.dashboard')}</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border/50"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{t('common.language')}</span>
                  <LanguageSelector variant="compact" />
                </div>
                <RoleSwitcher />
                {!isAuthenticated ? (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/auth">{t('navigation.login')}</Link>
                    </Button>
                    <Button variant="neon" asChild>
                      <Link to="/auth?mode=signup">{t('navigation.getStarted')}</Link>
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" asChild>
                    <Link to="/dashboard">{t('navigation.dashboard')}</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
