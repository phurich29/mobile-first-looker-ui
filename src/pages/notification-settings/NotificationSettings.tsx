
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationSettingsList } from "./components/NotificationSettingsList";
import { PageHeader } from "./components/PageHeader";
import { useNotificationSettings } from "./hooks/useNotificationSettings";

const NotificationSettings = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { settings, loading, error, fetchSettings } = useNotificationSettings();

  // Handle back button - going back to previous page
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-2xl px-4 ${!isMobile ? 'py-8' : 'pt-4 pb-6'}`}>
          {/* Back button */}
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="mb-4 flex items-center text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>ย้อนกลับ</span>
          </Button>

          <PageHeader title="การแจ้งเตือนที่กำหนดไว้" />
          <NotificationSettingsList 
            settings={settings} 
            loading={loading} 
            error={error} 
          />
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default NotificationSettings;
