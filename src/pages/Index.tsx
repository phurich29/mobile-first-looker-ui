
import { IconMenu } from "@/components/IconMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { CountdownTimer } from "@/components/CountdownTimer";
import { NotificationList } from "@/components/NotificationList";
import { AppLayout } from "@/components/layouts";
import { ClockDisplay } from "@/components/layouts/top-header/ClockDisplay";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <AppLayout wideContent showFooterNav contentPaddingBottom="pb-32 md:pb-16">
        {/* Clock timer section */}
        <div className={`mb-8 ${!isMobile ? 'mb-8' : 'mb-6'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600 font-medium">Analyzed by Meyer</span>
            <div className="flex items-center gap-3">
              <ClockDisplay />
              <CountdownTimer 
                useGlobal={true}
                initialSeconds={60}
              />
            </div>
          </div>
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
