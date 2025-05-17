import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './components/AuthProvider';
import Routes from './Routes';
import './index.css';
import { DeviceProvider } from './contexts/DeviceContext';

function App() {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <DeviceProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Routes />
            </BrowserRouter>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </DeviceProvider>
    </ThemeProvider>
  );
}

export default App;
