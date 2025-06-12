
import { IconMenu } from "@/components/IconMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationList } from "@/components/NotificationList";
import { AppLayout } from "@/components/layouts";

const Index = () => {
  const isMobile = useIsMobile();
  return <AppLayout wideContent showFooterNav contentPaddingBottom="pb-32 md:pb-16">
        {/* Menu icons */}
        <div className={`${!isMobile ? 'mt-8' : ''}`}>
          <IconMenu />
        </div>
        
        {/* Notification settings section at the bottom */}
        <div className={`mt-8 ${!isMobile ? 'mb-8' : 'mb-20'}`}>
          <NotificationList />
        </div>
    </AppLayout>;
};

export default Index;
