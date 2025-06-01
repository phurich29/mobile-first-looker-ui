import React, { useState } from 'react';
import { useAuth } from "@/components/AuthProvider";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { PasswordDialog } from "@/components/profile/PasswordDialog";
import { FeedbackDialogs } from "@/components/profile/FeedbackDialogs";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, CheckCircle, AlertCircle } from "lucide-react";

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
        "max-w-7xl mx-auto"
        // Removed dynamic margin logic: !isMobile && "ml-0 md:ml-[5rem]", 
        // Removed dynamic margin logic: !isMobile && !isCollapsed && "md:ml-64"
        // The 'transition-all duration-300' was for the margin, AppLayout's main has its own.
      )}>
        {/* Standard Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ข้อมูลส่วนตัว</h1>
        </div>
        
        <div className="relative">
          {/* Background decorative elements (can be kept or removed based on preference) */}
          <div className="absolute top-12 right-8 w-24 h-24 bg-emerald-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
          <div className="absolute bottom-12 left-8 w-32 h-32 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
          
          {/* Main grid layout */}
          <div className={`grid ${!isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-1 gap-6'}`}>
            {/* ข้อมูลผู้ใช้ Card */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลผู้ใช้</CardTitle>
                <CardDescription>ข้อมูลบัญชีผู้ใช้ของคุณ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">อีเมลผู้ใช้</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">เข้าสู่ระบบครั้งล่าสุด</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{lastSignIn}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">สมัครเมื่อ</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{created}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setShowPasswordDialog(true)}
                  variant="outline"
                >
                  <KeyRound className="w-4 h-4 mr-2" /> เปลี่ยนรหัสผ่าน
                </Button>
              </CardFooter>
            </Card>
            
            {/* สถานะบัญชี Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>สถานะบัญชี</CardTitle>
                <CardDescription>สถานะการเข้าใช้งานปัจจุบัน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <p className="font-medium text-gray-900 dark:text-gray-100">เข้าสู่ระบบแล้ว</p>
                  </div>
                  <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">สถานะการยืนยันอีเมล</p>
                  {user?.email_confirmed_at ? (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      <p className="font-medium text-gray-900 dark:text-gray-100">ยืนยันแล้ว</p>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
                      <p className="font-medium text-gray-900 dark:text-gray-100">ยังไม่ได้ยืนยัน</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
