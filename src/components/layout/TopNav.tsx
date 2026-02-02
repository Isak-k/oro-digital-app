import { Bell, Search, Moon, Sun, Menu, User, Check, Trash2, Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, translations } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TopNavProps {
  onMobileMenuToggle: () => void;
}

const TopNav = ({ onMobileMenuToggle }: TopNavProps) => {
  const { admin, signOut } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const { tk } = useLanguage();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden touch-button"
            onClick={onMobileMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Search - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={tk('searchGenericPlaceholder')}
              className="pl-9 w-64 lg:w-80 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Selector */}
          <div>
            <LanguageSelector />
          </div>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="touch-button text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative touch-button text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold">{tk('notificationsLabel')}</span>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs text-primary hover:text-primary/80"
                    onClick={markAllAsRead}
                  >
                    {tk('markAllRead')}
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length > 0 ? (
                  <div className="py-2">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-muted/50 transition-colors relative group ${!notification.read ? 'bg-muted/30' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 p-1.5 rounded-full shrink-0 ${notification.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                            <Bell className="w-3 h-3" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm leading-none ${!notification.read ? 'font-medium' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (notification.id) markAsRead(notification.id);
                                }}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notification.id) deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground p-4">
                    <Bell className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">{tk('noNotifications')}</p>
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 touch-button">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-foreground">
                    {admin?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                {/* Admin name - Hidden on mobile */}
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium">{admin?.name || tk('admin')}</p>
                  <p className="text-xs text-muted-foreground">{tk('administratorLabel')}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="lg:hidden px-2 py-1.5 border-b">
                <p className="text-sm font-medium">{admin?.name || tk('admin')}</p>
                <p className="text-xs text-muted-foreground">{admin?.email}</p>
              </div>
              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {tk('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
