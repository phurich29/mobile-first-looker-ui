import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { NotificationAPITester } from "@/components/testing/NotificationAPITester";

const APITestPage: React.FC = () => {
  return (
    <AppLayout showFooterNav={false}>
      <div className="min-h-screen bg-gray-50 py-8">
        <NotificationAPITester />
      </div>
    </AppLayout>
  );
};

export default APITestPage;