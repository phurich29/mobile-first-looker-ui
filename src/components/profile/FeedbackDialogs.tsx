
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface FeedbackDialogsProps {
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  showErrorDialog: boolean;
  setShowErrorDialog: (show: boolean) => void;
  errorMessage: string;
}

export const FeedbackDialogs = ({
  showSuccessDialog,
  setShowSuccessDialog,
  showErrorDialog,
  setShowErrorDialog,
  errorMessage
}: FeedbackDialogsProps) => {
  return (
    <>
      {/* Dialog แสดงผลสำเร็จ */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>เปลี่ยนรหัสผ่านสำเร็จ</AlertDialogTitle>
            <AlertDialogDescription>
              รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว คุณสามารถใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งต่อไป
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>ตกลง</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog แสดงข้อผิดพลาด */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>เกิดข้อผิดพลาด</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>ตกลง</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
