import { useEffect } from 'react';
import { X, Bell, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function SiteNotificationDisplay() {
  const { notifications, dismissNotification } = useNotifications();

  // Handle toast notifications
  useEffect(() => {
    const toastNotifications = notifications.filter(n => n.type === 'toast');
    
    toastNotifications.forEach(n => {
      toast(n.title, {
        description: n.message,
        duration: 5000,
        action: {
          label: 'Dismiss',
          onClick: () => dismissNotification(n.id),
        },
      });
      setTimeout(() => dismissNotification(n.id), 100);
    });
  }, [notifications, dismissNotification]);

  const bannerNotifications = notifications.filter(n => n.type === 'banner');
  const modalNotifications = notifications.filter(n => n.type === 'modal');

  return (
    <>
      {bannerNotifications.map(notification => (
        <div
          key={notification.id}
          className={cn(
            "fixed top-16 left-0 right-0 z-50 py-2 px-4",
            "bg-primary/90 text-primary-foreground backdrop-blur-sm",
            "border-b border-primary/50"
          )}
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{notification.title}</span>
                <span className="text-sm opacity-90">{notification.message}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-primary-foreground/10"
              onClick={() => dismissNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {modalNotifications.map(notification => (
        <Dialog 
          key={notification.id} 
          open={true} 
          onOpenChange={() => dismissNotification(notification.id)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>{notification.title}</DialogTitle>
                </div>
              </div>
            </DialogHeader>
            <DialogDescription className="pt-2">
              {notification.message}
            </DialogDescription>
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => dismissNotification(notification.id)}>
                Got it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}
