
import { useAuth } from "@/components/AuthProvider";
import { useUsersFetching } from "./useUsersFetching";
import { useUserDialogs } from "./useUserDialogs";
import { useUserRoleOperations } from "./useUserRoleOperations";
import { useUserCrudOperations } from "./useUserCrudOperations";

export function useUserManagement() {
  const { userRoles } = useAuth();
  
  // Combine smaller hooks to create complete functionality
  const {
    users,
    setUsers,
    isLoadingUsers,
    isSuperAdmin,
    fetchUsers
  } = useUsersFetching();
  
  const {
    showAddUserDialog,
    setShowAddUserDialog,
    showResetPasswordDialog,
    setShowResetPasswordDialog,
    showDeleteConfirm,
    setShowDeleteConfirm,
    selectedUserId,
    setSelectedUserId,
    selectedUserEmail,
    setSelectedUserEmail,
    handleOpenResetDialog,
    handleOpenDeleteDialog
  } = useUserDialogs();
  
  const {
    isProcessing: isRoleProcessing,
    changeUserRole,
    approveUser
  } = useUserRoleOperations({
    users,
    setUsers,
    isSuperAdmin,
    userRoles
  });
  
  const {
    isProcessing: isCrudProcessing,
    createUser,
    resetUserPassword,
    deleteUser
  } = useUserCrudOperations({
    users,
    setUsers,
    isSuperAdmin,
    selectedUserId,
    setShowAddUserDialog,
    setShowResetPasswordDialog,
    setShowDeleteConfirm
  });
  
  // Combine the processing states
  const isProcessing = isRoleProcessing || isCrudProcessing;

  return {
    // State
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

    // Actions
    changeUserRole,
    approveUser,
    createUser,
    resetUserPassword,
    deleteUser,
    handleOpenResetDialog,
    handleOpenDeleteDialog,
  };
}
