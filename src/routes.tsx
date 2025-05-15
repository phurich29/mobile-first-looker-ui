
import NotFound from "./pages/NotFound";
import NotificationSettings from "./pages/notification-settings";

// Routes configuration
const routes = [
  {
    path: "/",
    element: <div>Home Page</div>,
  },
  {
    path: "/devices",
    element: <div>Devices Page</div>,
  },
  {
    path: "/device/:deviceCode",
    element: <div>Device Detail Page</div>,
  },
  {
    path: "/device/default",
    element: <div>Default Device Page</div>,
  },
  {
    path: "/history/:deviceCode",
    element: <div>Measurement History Page</div>,
  },
  {
    path: "/about",
    element: <div>About Page</div>,
  },
  {
    path: "/contact",
    element: <div>Contact Page</div>,
  },
  {
    path: "/notifications",
    element: <NotificationSettings />
  },
  {
    path: "/coming-soon",
    element: <div>Coming Soon Page</div>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
