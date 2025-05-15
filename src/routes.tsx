
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import DeviceManagement from "./pages/DeviceManagement";
import DeviceDetails from "./pages/DeviceDetails";
import RicePrices from "./pages/RicePrices";
import RicePriceManagement from "./pages/RicePriceManagement";
import NewsManagement from "./pages/NewsManagement";
import UserManagement from "./pages/UserManagement";
import Admin from "./pages/Admin";
import Equipment from "./pages/Equipment";
import Measurements from "./pages/Measurements";
import News from "./pages/News";
import NotFound from "./pages/NotFound";
import Waiting from "./pages/Waiting";
import MeasurementHistory from "./components/MeasurementHistory";
import NotificationManagement from "./pages/NotificationManagement";
import NotificationHistory from "./pages/NotificationHistory";
import NotificationSettings from "./pages/notification-settings";
import Notifications from "./pages/Notifications";

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
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/device-management",
    element: (
      <ProtectedRoute>
        <DeviceManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/device-details/:deviceCode",
    element: <DeviceDetails />,
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
      <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
        <UserManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
        <Admin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/equipment",
    element: <Equipment />,
  },
  {
    path: "/measurements",
    element: <Measurements />,
  },
  {
    path: "/news",
    element: <News />,
  },
  {
    path: "/measurement-history/:deviceCode/:symbol",
    element: <MeasurementHistory />,
  },
  {
    path: "/notification-management",
    element: <NotificationManagement />,
  },
  {
    path: "/notification-settings",
    element: <NotificationSettings />,
  },
  {
    path: "/notification-history",
    element: <NotificationHistory />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/waiting",
    element: <Waiting />,
  },
  {
    path: "/*",
    element: <NotFound />,
  },
]);
