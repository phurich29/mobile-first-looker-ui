
import { createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";
import { CountdownProvider } from "@/contexts/CountdownContext";
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";

// Wrap the entire application with CountdownProvider and MainLayout
const wrappedRoutes = routes.map(route => ({
  ...route,
  element: (
    <CountdownProvider initialSeconds={60}>
      <MainLayout>
        {route.element}
      </MainLayout>
    </CountdownProvider>
  )
}));

// Create the router with wrapped routes
export const router = createBrowserRouter(wrappedRoutes);
