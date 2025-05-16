
import React, { useState } from 'react';
import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserInfoCard } from "@/components/profile/UserInfoCard";
import { AccountStatusCard } from "@/components/profile/AccountStatusCard";
import { PasswordDialog } from "@/components/profile/PasswordDialog";
import { FeedbackDialogs } from "@/components/profile/FeedbackDialogs";

const Profile = () => {
  const { user } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const isMobile = useIsMobile();

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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      {/* Main content with proper padding to avoid menu overlap */}
      <div className="container px-3 py-6 md:py-12 pb-24 mx-auto max-w-6xl md:ml-64">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-800">ข้อมูลส่วนตัว</h1>
        </div>
        
        <div className={`grid ${!isMobile ? 'grid-cols-1 md:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
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
      
      <FooterNav />
    </div>
  );
};

export default Profile;
