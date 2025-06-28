
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./components/AuthProvider";
import { CountdownProvider } from "./contexts/CountdownContext";
import { PWAProvider } from "./contexts/PWAContext";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme/ThemeProvider";

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
    // toast({
    //   title: "ระบบกำลังอัปเดตข้อมูล",
    //   description: "ระบบได้ทำการอัปเดตข้อมูลล่าสุดจากเซิร์ฟเวอร์",
    //   duration: 3000,
    // });
    
    // Invalidate queries that should refresh on the global timer
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <PWAProvider>
          <CountdownProvider initialSeconds={60} onComplete={handleGlobalCountdownComplete}>
            <AuthProvider>
              <RouterProvider router={router} />
              <PWAInstallBanner />
              <Toaster />
            </AuthProvider>
          </CountdownProvider>
        </PWAProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
