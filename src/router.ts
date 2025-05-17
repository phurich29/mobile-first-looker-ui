
import { createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";
import { CountdownProvider } from "@/contexts/CountdownContext";
import React from "react";

// Wrap the entire application with CountdownProvider
const wrappedRoutes = routes.map(route => ({
  ...route,
  element: (
    <CountdownProvider initialSeconds={60}>
      {route.element}
    </CountdownProvider>
  )
}));

// Create the router with wrapped routes
export const router = createBrowserRouter(wrappedRoutes);
