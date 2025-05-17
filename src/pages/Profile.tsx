
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserInfoCard } from "@/components/profile/UserInfoCard";
import { AccountStatusCard } from "@/components/profile/AccountStatusCard";
import { PasswordDialog } from "@/components/profile/PasswordDialog";
import { FeedbackDialogs } from "@/components/profile/FeedbackDialogs";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    // Listen for sidebar state changes using custom event
    const updateSidebarState = (event?: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent?.detail) {
        setIsCollapsed(customEvent.detail.isCollapsed);
      } else {
        const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
        setIsCollapsed(savedCollapsedState === 'true');
      }
    };
    
    // Initial state
    updateSidebarState();
    
    // Listen for changes in localStorage
    window.addEventListener('storage', () => updateSidebarState());
    
    // Listen for custom event from Header component
    window.addEventListener('sidebarStateChanged', updateSidebarState);
    
    return () => {
      window.removeEventListener('storage', () => updateSidebarState());
      window.removeEventListener('sidebarStateChanged', updateSidebarState);
    };
  }, []);

  // Format user data
  const userEmail = user?.email || "ไม่พบข้อมูลอีเมล";
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : "ไม่พบข้อมูลวันที่";
  
  // Format last sign in time
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : "ไม่มีข้อมูล";

  // Handle password success and errors
  const handlePasswordSuccess = () => {
    setShowSuccessDialog(true);
  };

  const handlePasswordError = (message: string) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-x-hidden">
      <Header />
      
      {/* Main content with proper padding to avoid menu overlap */}
      <main className={cn(
        "container px-4 py-6 md:py-10 pb-32 mx-auto max-w-6xl transition-all duration-300",
        // สำหรับหน้าจอ desktop ให้มี margin-left ที่เปลี่ยนตาม sidebar
        !isMobile && "ml-0 md:ml-[5rem]", // สำหรับ default ให้ margin เท่ากับความกว้างของ sidebar ที่หดตัว (w-20 = 5rem)
        !isMobile && !isCollapsed && "md:ml-64" // เมื่อ sidebar ขยาย ให้เพิ่ม margin เป็น 64 (เท่ากับความกว้างของ sidebar ที่ขยาย w-64)
      )}>
        <div className="flex items-center mb-8">
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 dark:text-emerald-400">ข้อมูลส่วนตัว</h1>
            <div className="absolute -bottom-2 left-0 w-16 h-1 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute top-12 right-8 w-24 h-24 bg-emerald-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
          <div className="absolute bottom-12 left-8 w-32 h-32 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
          
          {/* Main grid layout */}
          <div className={`grid ${!isMobile ? 'grid-cols-1 md:grid-cols-3 gap-8' : 'grid-cols-1 gap-6'}`}>
            {/* ข้อมูลส่วนตัว */}
            <UserInfoCard 
              userEmail={userEmail}
              lastSignIn={lastSignIn}
              created={created}
              onChangePasswordClick={() => setShowPasswordDialog(true)}
            />
            
            {/* กล่องแสดงสถานะ */}
            <AccountStatusCard user={user} />
          </div>
        </div>

        {/* Password Change Dialog */}
        <PasswordDialog 
          open={showPasswordDialog} 
          onOpenChange={setShowPasswordDialog} 
          onSuccess={handlePasswordSuccess}
          onError={handlePasswordError}
        />

        {/* Feedback Dialogs */}
        <FeedbackDialogs 
          showSuccessDialog={showSuccessDialog}
          setShowSuccessDialog={setShowSuccessDialog}
          showErrorDialog={showErrorDialog}
          setShowErrorDialog={setShowErrorDialog}
          errorMessage={errorMessage}
        />
      </main>
      
      <FooterNav />
    </div>
  );
};

export default Profile;
