
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
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
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/notification-settings";
import DeviceDetails from "./pages/DeviceDetails";
import MeasurementHistory from "./components/measurement-history/MeasurementHistory";
import NotificationHistory from "./pages/NotificationHistory";
import Equipment from "./pages/Equipment";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/waiting",
    element: (
      <ProtectedRoute requiredRoles={["waiting_list"]}>
        <Waiting />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute requiredRoles={["user"]}>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/rice-prices",
    element: <RicePrices />,
  },
  {
    path: "/rice-price-management",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <RicePriceManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/news",
    element: <News />,
  },
  {
    path: "/news-management",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <NewsManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user-management",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <UserManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <ProtectedRoute requiredRoles={["user"]}>
        <Notifications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notification-settings",
    element: (
      <ProtectedRoute requiredRoles={["user"]}>
        <NotificationSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notification-history",
    element: (
      <ProtectedRoute requiredRoles={["user"]}>
        <NotificationHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <Admin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/device/:deviceCode",
    element: (
      <ProtectedRoute requiredRoles={["user"]}>
        <DeviceDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/measurement-history/:deviceCode/:symbol",
    element: (
      <ProtectedRoute requiredRoles={["user"]}>
        <MeasurementHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/equipment",
    element: (
      <ProtectedRoute requiredRoles={["user"]}>
        <Equipment />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
  {
    path: "/404",
    element: <NotFound />,
  },
]);
