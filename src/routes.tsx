
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";

// Import pages directly (non-lazy for better performance on core pages)
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Waiting from "./pages/Waiting";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import RicePrices from "./pages/RicePrices";
import RicePriceManagement from "./pages/RicePriceManagement";
import News from "./pages/News";
import NewsManagement from "./pages/NewsManagement";
import UserManagement from "./pages/UserManagement";
import NotificationSettings from "./pages/notification-settings";
import DeviceDetails from "./pages/DeviceDetails";
import MeasurementHistory from "./components/measurement-history/MeasurementHistory";
import NotificationHistory from "./pages/NotificationHistory";
import Equipment from "./pages/Equipment";
import GraphMonitor from "./pages/GraphMonitor";
import GraphSummary from "./pages/GraphSummary";
import GraphSummaryDetail from "./pages/GraphSummaryDetail";
import NewQualityMeasurements from "./pages/NewQualityMeasurements";
import MeasurementDetail from "./pages/MeasurementDetail";
import DeviceManagement from "./pages/DeviceManagement";

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
  </div>
);

// Main layout component
const MainLayout = () => (
  <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
    <Header />
    <main className="flex-1">
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </main>
    <FooterNav />
  </div>
);

// Auth layout for login/register pages
const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "news",
        element: <News />,
      },
      {
        path: "rice-prices",
        element: <RicePrices />,
      },
      // Protected routes
      {
        path: "waiting",
        element: (
          <ProtectedRoute>
            <Waiting />
          </ProtectedRoute>
        ),
      },
      {
        path: "equipment",
        element: (
          <ProtectedRoute>
            <Equipment />
          </ProtectedRoute>
        ),
      },
      {
        path: "measurements",
        element: (
          <ProtectedRoute>
            <div>Measurements Page - To be implemented</div>
          </ProtectedRoute>
        ),
      },
      {
        path: "device/:deviceCode",
        element: (
          <ProtectedRoute>
            <DeviceDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "graph-monitor",
        element: (
          <ProtectedRoute>
            <GraphMonitor />
          </ProtectedRoute>
        ),
      },
      {
        path: "graph-summary",
        element: (
          <ProtectedRoute>
            <GraphSummary />
          </ProtectedRoute>
        ),
      },
      {
        path: "graph-summary-detail",
        element: (
          <ProtectedRoute>
            <GraphSummaryDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "new-quality-measurements",
        element: (
          <ProtectedRoute>
            <NewQualityMeasurements />
          </ProtectedRoute>
        ),
      },
      {
        path: "measurement-detail/:measurementSymbol",
        element: (
          <ProtectedRoute>
            <MeasurementDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "measurement-history/:deviceCode/:symbol",
        element: (
          <ProtectedRoute>
            <MeasurementHistory />
          </ProtectedRoute>
        ),
      },
      // Admin routes
      {
        path: "admin",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: "user-management",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "device-management",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <DeviceManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "rice-price-management",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <RicePriceManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "news-management",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <NewsManagement />
          </ProtectedRoute>
        ),
      },
      // Notification routes
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "notification-history",
        element: (
          <ProtectedRoute>
            <NotificationHistory />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // Auth routes with separate layout
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
  // Legacy login route (redirect to new auth structure)
  {
    path: "/login",
    element: <Navigate to="/auth/login" replace />,
  },
  // 404 route
  {
    path: "*",
    element: <NotFound />,
  },
]);
