import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import OfflineIndicator from "@/components/OfflineIndicator";
import OfflineErrorBoundary from "@/components/OfflineErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import StudentsPage from "./pages/dashboard/StudentsPage";
import CoursesPage from "./pages/dashboard/CoursesPage";
import RegistrationsPage from "./pages/dashboard/RegistrationsPage";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
// import PaymentsPageSimple from "./pages/dashboard/PaymentsPageSimple";
// import PaymentsPageTest from "./pages/dashboard/PaymentsPageTest";
import NewsPage from "./pages/dashboard/NewsPage";
import GalleryPage from "./pages/dashboard/GalleryPage";
import AnnouncementsPage from "./pages/dashboard/AnnouncementsPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import NotFound from "./pages/NotFound";
import StudentRequestsPage from "./pages/dashboard/StudentRequestsPage";
import { useEffect } from "react";
import { offlineStorage } from "@/lib/offlineStorage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enable offline-first behavior
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize offline storage
    offlineStorage.init().catch(console.error);
    
    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        // Background sync will be handled by the service worker
        console.log('Background sync is supported');
      });
    }
  }, []);

  return (
    <OfflineErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <OfflineIndicator />
                <BrowserRouter>
                <Routes>
                  {/* Landing Page */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Login */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected Dashboard Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardHome />} />
                    <Route path="students" element={<StudentsPage />} />
                    <Route path="courses" element={<CoursesPage />} />
                    <Route path="registrations" element={<RegistrationsPage />} />
                    <Route path="requests" element={<StudentRequestsPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="news" element={<NewsPage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    <Route path="gallery" element={<GalleryPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </OfflineErrorBoundary>
  );
};

export default App;
