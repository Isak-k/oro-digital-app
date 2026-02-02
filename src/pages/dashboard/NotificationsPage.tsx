import { motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            View system alerts and updates
          </p>
        </div>
        <div className="flex gap-2">
            {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                    <Check className="w-4 h-4" />
                    Mark all as read
                </Button>
            )}
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={item.read ? 'bg-background' : 'bg-muted/30 border-primary/20'}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-full ${item.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <p className={`text-sm ${item.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                        {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                        </span>
                    </div>
                </div>
                <div className="flex gap-1">
                    {!item.read && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => item.id && markAsRead(item.id)}
                            title="Mark as read"
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                    )}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => item.id && deleteNotification(item.id)}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No notifications to display.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
