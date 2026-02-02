import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
        setMobileMenuOpen(false);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && window.innerWidth < 1024) {
        const sidebar = document.querySelector('[data-sidebar]');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "lg:block",
        mobileMenuOpen ? "block" : "hidden"
      )}>
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onCollapse={setSidebarCollapsed}
          isMobile={window.innerWidth < 1024}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 min-h-screen",
        "lg:ml-[260px]", // Always full width on desktop
        sidebarCollapsed && "lg:ml-[70px]" // Collapsed width on desktop
      )}>
        <TopNav onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6"> {/* Extra bottom padding for mobile nav */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
