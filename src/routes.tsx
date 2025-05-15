import { Home } from "./pages/Home";
import { Device } from "./pages/Device";
import { Devices } from "./pages/Devices";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { ComingSoon } from "./pages/ComingSoon";
import { NotFound } from "./pages/NotFound";
import { MeasurementHistory } from "./pages/MeasurementHistory";
import NotificationSettings from "./pages/notification-settings";

// Update the routes in your routing configuration
const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/devices",
    element: <Devices />,
  },
  {
    path: "/device/:deviceCode",
    element: <Device />,
  },
  {
    path: "/device/default",
    element: <Device />,
  },
  {
    path: "/history/:deviceCode",
    element: <MeasurementHistory />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/notifications",
    element: <NotificationSettings />
  },
  {
    path: "/coming-soon",
    element: <ComingSoon />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
