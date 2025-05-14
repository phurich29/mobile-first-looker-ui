
import { useState } from "react";

export function useUserDialogs() {
  const [showAddUserDialog, setShowAddUserDialog] = useState<boolean>(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("");
  
  // Handle opening reset password dialog
  const handleOpenResetDialog = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setShowResetPasswordDialog(true);
  };
  
  // Handle opening delete confirm dialog
  const handleOpenDeleteDialog = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setShowDeleteConfirm(true);
  };

  return {
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
    handleOpenDeleteDialog,
  };
}
