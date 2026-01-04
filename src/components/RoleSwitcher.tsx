import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RoleSwitcher() {
  const { isAdmin, viewAsUser, effectiveIsAdmin, toggleViewMode } = useAuth();

  // Only show for admin users
  if (!isAdmin) return null;

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={effectiveIsAdmin ? "admin" : "user"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          <Badge 
            variant={effectiveIsAdmin ? "neon-magenta" : "outline"}
            className="gap-1"
          >
            {effectiveIsAdmin ? (
              <>
                <Shield className="h-3 w-3" />
                Admin
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                User View
              </>
            )}
          </Badge>
        </motion.div>
      </AnimatePresence>
      
      <Switch
        checked={!viewAsUser}
        onCheckedChange={() => toggleViewMode()}
        aria-label="Toggle admin/user view"
      />
    </div>
  );
}
