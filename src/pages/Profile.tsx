import React, { useState, useEffect } from 'react';
import { useAuth } from "@/components/AuthProvider";
import { AppLayout } from "@/components/layouts/app-layout";
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
  // isCollapsed state and its useEffect have been removed as AppLayout now handles sidebar state and content margins.

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
    <AppLayout showFooterNav={true}>
      {/* Main content container with original padding and max-width. Dynamic margins are now handled by AppLayout. */}
      <div className={cn(
        "container px-4 py-6 md:py-10 pb-32 mx-auto max-w-6xl"
        // Removed dynamic margin logic: !isMobile && "ml-0 md:ml-[5rem]", 
        // Removed dynamic margin logic: !isMobile && !isCollapsed && "md:ml-64"
        // The 'transition-all duration-300' was for the margin, AppLayout's main has its own.
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
      </div>
    </AppLayout>
  );
};

export default Profile;
