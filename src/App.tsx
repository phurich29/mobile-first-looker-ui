
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Equipment from "./pages/Equipment";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DeviceDetails from "./pages/DeviceDetails";
import Measurements from "./pages/Measurements";
import { AuthProvider } from "./components/AuthProvider";
import Profile from "./pages/Profile";
import Waiting from "./pages/Waiting";
import Admin from "./pages/Admin";
import { Toaster } from "./components/ui/toaster";
import UserManagement from "./pages/UserManagement";
import DeviceManagement from "./pages/DeviceManagement";
import RicePrices from "./pages/RicePrices";
import RicePriceManagement from "./pages/RicePriceManagement";
import NewsManagement from "./pages/NewsManagement";
import News from "./pages/News";
import NotificationSettings from "./pages/notification-settings";
import NotificationHistory from "./pages/NotificationHistory";
import GraphMonitor from "./pages/GraphMonitor";
import { CountdownProvider } from "./contexts/CountdownContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { toast } from "@/components/ui/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  const handleGlobalCountdownComplete = () => {
    console.log("Global countdown complete - triggering refresh or other actions");
    // This function will be called every minute (60 seconds) globally
    toast({
      title: "ระบบกำลังอัปเดตข้อมูล",
      description: "ระบบได้ทำการอัปเดตข้อมูลล่าสุดจากเซิร์ฟเวอร์",
      duration: 3000,
    });
    
    // Invalidate queries that should refresh on the global timer
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <Router>
          <CountdownProvider initialSeconds={60} onComplete={handleGlobalCountdownComplete}>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/waiting" element={<ProtectedRoute><Waiting /></ProtectedRoute>} />
                
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/news" element={<News />} />
                <Route path="/rice-prices" element={<RicePrices />} />
                
                {/* Protected routes */}
                <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
                <Route path="/measurements" element={<ProtectedRoute><Measurements /></ProtectedRoute>} />
                <Route path="/device/:deviceCode" element={<ProtectedRoute><DeviceDetails /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/graph-monitor" element={<ProtectedRoute><GraphMonitor /></ProtectedRoute>} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute requiredRoles={["admin"]}><Admin /></ProtectedRoute>} />
                <Route path="/user-management" element={<ProtectedRoute requiredRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
                <Route path="/device-management" element={<ProtectedRoute requiredRoles={["admin"]}><DeviceManagement /></ProtectedRoute>} />
                <Route path="/rice-price-management" element={<ProtectedRoute requiredRoles={["admin"]}><RicePriceManagement /></ProtectedRoute>} />
                <Route path="/news-management" element={<ProtectedRoute requiredRoles={["admin"]}><NewsManagement /></ProtectedRoute>} />
                
                {/* Notification routes */}
                <Route path="/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
                <Route path="/notification-history" element={<ProtectedRoute><NotificationHistory /></ProtectedRoute>} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </AuthProvider>
          </CountdownProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
