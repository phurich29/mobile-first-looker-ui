
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"

import { router } from "./router";
import { ThemeProvider } from "./components/theme-provider"
import { AuthProvider } from "./components/AuthProvider";
import { DeviceProvider } from "./contexts/DeviceContext";

function App() {
  const queryClient = new QueryClient();

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <AuthProvider>
        <DeviceProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <RouterProvider router={router} />
          </QueryClientProvider>
        </DeviceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
