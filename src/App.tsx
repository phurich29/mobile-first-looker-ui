
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './components/AuthProvider';
import { router } from './routes';
import './index.css';
import { DeviceProvider } from './contexts/DeviceContext';
import { CountdownProvider } from './contexts/CountdownContext';

function App() {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <DeviceProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CountdownProvider initialSeconds={60}>
              <BrowserRouter>
                <Routes>
                  {router.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={route.element}
                    />
                  ))}
                </Routes>
              </BrowserRouter>
              <Toaster />
            </CountdownProvider>
          </AuthProvider>
        </QueryClientProvider>
      </DeviceProvider>
    </ThemeProvider>
  );
}

export default App;
