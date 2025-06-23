
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
// Header will be handled by AppLayout
import { Button } from "@/components/ui/button";
// FooterNav will be handled by AppLayout
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useUserManagement } from "@/features/user-management/hooks/useUserManagement";
import { UserTable } from "@/features/user-management/components/UserTable";
import { AddUserDialog } from "@/features/user-management/components/AddUserDialog";
import { ResetPasswordDialog } from "@/features/user-management/components/ResetPasswordDialog";
import { DeleteUserDialog } from "@/features/user-management/components/DeleteUserDialog";
import { CurrentUserRoleCard } from "@/features/user-management/components/CurrentUserRoleCard";
import { GuestDeviceManagement } from "@/features/user-management/components/GuestDeviceManagement";

export default function UserManagement() {
  const { user, userRoles, isLoading } = useAuth();
  const {
    users,
    isLoadingUsers,
    isProcessing,
    isSuperAdmin,
    showAddUserDialog,
    setShowAddUserDialog,
    showResetPasswordDialog,
    setShowResetPasswordDialog,
    selectedUserEmail,
    showDeleteConfirm,
    setShowDeleteConfirm,
    changeUserRole,
    approveUser,
    createUser,
    resetUserPassword,
    deleteUser,
    handleOpenResetDialog,
    handleOpenDeleteDialog,
  } = useUserManagement();

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If user not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Remove the admin/superadmin check - we will now rely on the ProtectedRoute component
  // to handle all role-based access control

  return (
    <AppLayout showFooterNav={true}>
      <BackgroundImage /> {/* Moved inside AppLayout */}
      {/* The main tag and its specific classes are now handled by AppLayout's main tag. */}
      {/* Retaining inner content padding & max-width for now */}
      <div className="flex-1 w-full pb-24 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold dark:text-gray-100">จัดการผู้ใช้งาน</h1>
          </div>
          
          <Button 
            onClick={() => setShowAddUserDialog(true)}
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </div>

        {/* Current User Role Card */}
        <CurrentUserRoleCard />

        {/* Guest Device Management Section */}
        <GuestDeviceManagement />

        <Card className="overflow-hidden dark:bg-slate-800 dark:border-slate-700 px-3">
          <CardContent className="p-0 overflow-x-auto">
            {isLoadingUsers ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-500 mx-auto"></div>
                <p className="text-gray-500 mt-4 dark:text-gray-400">กำลังโหลดข้อมูลผู้ใช้...</p>
              </div>
            ) : users.length > 0 ? (
              <UserTable
                users={users}
                isProcessing={isProcessing}
                isSuperAdmin={isSuperAdmin}
                onApproveUser={approveUser}
                onOpenResetDialog={handleOpenResetDialog}
                onOpenDeleteDialog={handleOpenDeleteDialog}
                onChangeUserRole={changeUserRole}
              />
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลผู้ใช้</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for adding a new user */}
      <AddUserDialog
        open={showAddUserDialog}
        onOpenChange={setShowAddUserDialog}
        onSubmit={createUser}
        isProcessing={isProcessing}
      />

      {/* Dialog for resetting user password */}
      <ResetPasswordDialog
        open={showResetPasswordDialog}
        onOpenChange={setShowResetPasswordDialog}
        onSubmit={resetUserPassword}
        isProcessing={isProcessing}
        userEmail={selectedUserEmail}
      />

      {/* Dialog for confirming user deletion */}
      <DeleteUserDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={deleteUser}
        isProcessing={isProcessing}
        userEmail={selectedUserEmail}
      />

      {/* FooterNav is handled by AppLayout */}
    </AppLayout>
  );
}
