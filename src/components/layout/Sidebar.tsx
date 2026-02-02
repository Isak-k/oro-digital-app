import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage, translations } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarDays, 
  CreditCard,
  Megaphone,
  Newspaper,
  ImageIcon,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import logo from '@/assets/logo.png';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ isCollapsed, onCollapse, isMobile = false, onMobileClose }: SidebarProps) => {
  const location = useLocation();
  const { signOut, admin } = useAuth();
  const navigate = useNavigate();
  const { tk } = useLanguage();
  const menuItems = [
    { icon: LayoutDashboard, label: tk('dashboard'), path: '/dashboard' },
    { icon: Users, label: tk('students'), path: '/dashboard/students' },
    { icon: BookOpen, label: tk('courses'), path: '/dashboard/courses' },
    { icon: CalendarDays, label: tk('registrations'), path: '/dashboard/registrations' },
    { icon: UserPlus, label: tk('requests'), path: '/dashboard/requests' },
    { icon: CreditCard, label: tk('payments'), path: '/dashboard/payments' },
    { icon: Megaphone, label: tk('announcements'), path: '/dashboard/announcements' },
    { icon: Newspaper, label: tk('news'), path: '/dashboard/news' },
    { icon: ImageIcon, label: tk('gallery'), path: '/dashboard/gallery' },
    { icon: Bell, label: tk('notifications'), path: '/dashboard/notifications' },
    { icon: Settings, label: tk('settings'), path: '/dashboard/settings' },
  ];

  

  const handleSignOut = async () => {
    navigate('/');
    await signOut();
  };

  const handleNavClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      data-sidebar
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed && !isMobile ? "w-[70px]" : "w-[260px]",
        isMobile && "w-[280px] max-w-[80vw]"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-border",
          isCollapsed && !isMobile ? "justify-center" : "justify-start"
        )}>
          <img 
            src={logo} 
            alt="ORO DIGITAL Logo" 
            className={cn(
              "object-contain transition-all duration-300",
              isCollapsed && !isMobile ? "h-10 w-10" : "h-12 w-auto"
            )} 
          />
          {(!isCollapsed || isMobile) && (
            <div className="ml-3">
              <h2 className="text-lg font-bold text-sidebar-foreground">ORO DIGITAL</h2>
              <p className="text-xs text-sidebar-muted">{tk('admin')} {tk('dashboard')}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              const linkContent = (
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  className={cn(
                    "sidebar-link",
                    isActive && "active",
                    (isCollapsed && !isMobile) && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
                  {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                </NavLink>
              );

              return (
                <li key={item.path}>
                  {(isCollapsed && !isMobile) ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {/* Admin Info */}
          {(!isCollapsed || isMobile) && admin && (
            <div className="px-3 py-2 rounded-lg bg-sidebar-accent">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{admin.name}</p>
              <p className="text-xs text-sidebar-muted truncate">{admin.email}</p>
            </div>
          )}

          {/* Sign Out */}
          {(isCollapsed && !isMobile) ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="w-full h-10 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{tk('logout')}</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-5 h-5" />
              {tk('logout')}
            </Button>
          )}

          {/* Collapse Button - Desktop Only */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapse(!isCollapsed)}
              className="w-full h-10 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
