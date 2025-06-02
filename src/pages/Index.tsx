
import { NewsSlider } from "@/components/NewsSlider";
import { IconMenu } from "@/components/IconMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { CountdownTimer } from "@/components/CountdownTimer";
import { NotificationList } from "@/components/NotificationList";
import { File } from "lucide-react";
import { AppLayout } from "@/components/layouts";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <AppLayout wideContent showFooterNav contentPaddingBottom="pb-32 md:pb-16">
        {/* News slider section with countdown timer */}
        <div className={`mb-8 ${!isMobile ? 'mb-8' : 'mb-6'}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
              <File className="text-white bg-emerald-600 dark:bg-emerald-700 p-0.5 rounded-sm" size={20} />
              ข่าวสารและประกาศ
            </h2>
            <CountdownTimer 
              useGlobal={true}
              initialSeconds={60}
            />
          </div>
          <NewsSlider flatStyle={true} />
        </div>
        
        {/* Menu icons */}
        <div className={`${!isMobile ? 'mt-8' : ''}`}>
          <IconMenu />
        </div>
        
        {/* Notification settings section at the bottom */}
        <div className={`mt-8 ${!isMobile ? 'mb-8' : 'mb-20'}`}>
          <NotificationList />
        </div>
    </AppLayout>
  );
};

export default Index;
