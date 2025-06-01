
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import DeviceDetails from "./pages/DeviceDetails";
import UserManagement from "./pages/UserManagement";
import NewsManagement from "./pages/NewsManagement";
import DeviceManagement from "./pages/DeviceManagement";
import NotificationHistory from "./pages/NotificationHistory";
import GraphMonitor from "./pages/GraphMonitor";
import MeasurementDetail from "./pages/MeasurementDetail";

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
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/device/:deviceCode" element={<DeviceDetails />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/news-management" element={<NewsManagement />} />
                  <Route path="/device-management" element={<DeviceManagement />} />
                  <Route path="/notification-history" element={<NotificationHistory />} />
                  <Route path="/graph-monitor" element={<GraphMonitor />} />
                  <Route path="/measurement-detail/:measurementSymbol" element={<MeasurementDetail />} />
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
