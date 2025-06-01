import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Sidebar } from "@/components/Sidebar";
import Index from "./pages/Index";
import DeviceDetails from "./pages/DeviceDetails";
import MeasurementHistoryPage from "./pages/MeasurementHistoryPage";
import UserManagementPage from "./pages/UserManagementPage";
import NewsManagementPage from "./pages/NewsManagementPage";
import DeviceManagementPage from "./pages/DeviceManagementPage";
import NotificationHistoryPage from "./pages/NotificationHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import GraphMonitorPage from "./pages/GraphMonitorPage";
import MeasurementDetailPage from "./pages/MeasurementDetailPage";
import PublicDashboardPage from "./pages/PublicDashboardPage";
import PublicDeviceDetails from "./pages/PublicDeviceDetails";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('JWT') || 
            error?.message?.includes('refresh_token') ||
            error?.message?.includes('unauthorized')) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      staleTime: 30000, // 30 seconds
    },
    mutations: {
      retry: false, // Don't retry mutations
    }
  }
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
                <Sidebar />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/device/:deviceCode" element={<DeviceDetails />} />
                  <Route path="/measurement-history/:deviceCode/:symbol" element={<MeasurementHistoryPage />} />
                  <Route path="/user-management" element={<UserManagementPage />} />
                  <Route path="/news-management" element={<NewsManagementPage />} />
                  <Route path="/device-management" element={<DeviceManagementPage />} />
                  <Route path="/notification-history" element={<NotificationHistoryPage />} />
                  <Route path="/settings/*" element={<SettingsPage />} />
                  <Route path="/graph-monitor" element={<GraphMonitorPage />} />
                  <Route path="/measurement-detail/:measurementSymbol" element={<MeasurementDetailPage />} />
                  
                  {/* Public Dashboard Routes */}
                  <Route path="/public-dashboard" element={<PublicDashboardPage />} />
                  <Route path="/public-device/:deviceCode" element={<PublicDeviceDetails />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
