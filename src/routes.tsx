
import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Equipment from "./pages/Equipment";
import DeviceDetails from "./pages/DeviceDetails";
import GraphMonitor from "./pages/GraphMonitor";
import GraphSummary from "./pages/GraphSummary";
import MeasurementHistory from "./pages/MeasurementHistory";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import DeviceAccessManagement from "./pages/DeviceAccessManagement";

import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute allowGuest={true}>
        <Index />
      </ProtectedRoute>
    ),
  },
  {
    path: "/equipment",
    element: (
      <ProtectedRoute allowGuest={true}>
        <Equipment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/device/:deviceCode",
    element: (
      <ProtectedRoute 
        allowGuest={true}
        requireDeviceAccess={true}
        deviceCode={window.location.pathname.split('/')[2]}
      >
        <DeviceDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/device/:deviceCode/:symbol",
    element: (
      <ProtectedRoute 
        allowGuest={true}
        requireDeviceAccess={true}
        deviceCode={window.location.pathname.split('/')[2]}
      >
        <DeviceDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/graph-monitor",
    element: (
      <ProtectedRoute allowGuest={true}>
        <GraphMonitor />
      </ProtectedRoute>
    ),
  },
  {
    path: "/graph-monitor/:deviceCode",
    element: (
      <ProtectedRoute 
        allowGuest={true}
        requireDeviceAccess={true}
        deviceCode={window.location.pathname.split('/')[2]}
      >
        <GraphMonitor />
      </ProtectedRoute>
    ),
  },
  {
    path: "/graph-summary",
    element: (
      <ProtectedRoute allowGuest={true}>
        <GraphSummary />
      </ProtectedRoute>
    ),
  },
  {
    path: "/graph-summary/:deviceCode",
    element: (
      <ProtectedRoute 
        allowGuest={true}
        requireDeviceAccess={true}
        deviceCode={window.location.pathname.split('/')[2]}
      >
        <GraphSummary />
      </ProtectedRoute>
    ),
  },
  {
    path: "/measurement-history/:deviceCode/:symbol",
    element: (
      <ProtectedRoute 
        allowGuest={true}
        requireDeviceAccess={true}
        deviceCode={window.location.pathname.split('/')[2]}
      >
        <MeasurementHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <ProtectedRoute requiredRoles={["admin", "user"]}>
        <Notifications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute requiredRoles={["admin", "user"]}>
        <Profile />
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
    path: "/device-access-management",
    element: (
      <ProtectedRoute requiredRoles={["superadmin"]}>
        <DeviceAccessManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
