
import { Card } from "@/components/ui/card";
import { EquipmentCardHeader } from "./EquipmentCardHeader";
import { EquipmentCardContent } from "./EquipmentCardContent";
import { EquipmentCardDialogs } from "./EquipmentCardDialogs";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { UserAccessDialog } from "../access/UserAccessDialog";
import { useEquipmentCard } from "./hooks/useEquipmentCard";
import { useState } from "react";

interface EquipmentCardContainerProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  displayName?: string;
  onDeviceUpdated?: () => void;
  deviceData?: any; // เพิ่ม prop สำหรับข้อมูลอุปกรณ์
}

export function EquipmentCardContainer({
  deviceCode,
  lastUpdated,
  isAdmin = false,
  isSuperAdmin = false,
  displayName,
  onDeviceUpdated,
  deviceData
}: EquipmentCardContainerProps) {
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    newDisplayName,
    setNewDisplayName,
    handleSaveDisplayName
  } = useEquipmentCard(deviceCode, displayName, onDeviceUpdated);

  const handleDeleteConfirm = () => {
    console.log(`Deleting device: ${deviceCode}`);
    // Here you would typically call an API to delete the device
    // For now, we'll just close the dialog
    setIsDeleteDialogOpen(false);
    // Optionally, call onDeviceUpdated to refresh the list
    onDeviceUpdated?.();
  };

  return (
    <>
      <Card className="duration-300 border border-gray-200 dark:border-gray-700 bg-emerald-100 dark:bg-emerald-800 bg-[linear-gradient(rgba(255,255,255,0.98),rgba(255,255,255,0.98)),url('/lovable-uploads/6b12828f-a844-4f45-be72-ca664963430d.png')] dark:bg-[linear-gradient(rgba(30,41,59,0.98),rgba(30,41,59,0.98)),url('/lovable-uploads/6b12828f-a844-4f45-be72-ca664963430d.png')] bg-repeat shadow-none">
        <EquipmentCardHeader
          deviceCode={deviceCode}
          displayName={displayName}
          isSuperAdmin={isSuperAdmin}
          onUsersClick={() => setIsUsersDialogOpen(true)}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
        
        <EquipmentCardContent
          deviceCode={deviceCode}
          lastUpdated={lastUpdated}
          isAdmin={isAdmin || isSuperAdmin}
          onEditClick={() => setIsEditDialogOpen(true)}
          deviceData={deviceData}
        />
      </Card>
      
      {/* Delete Confirmation Dialog for Super Admin */}
      {isSuperAdmin && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          deviceName={displayName || deviceCode}
        />
      )}

      {/* User Access Dialog for Super Admin */}
      {isSuperAdmin && (
        <UserAccessDialog
          deviceCode={deviceCode}
          isOpen={isUsersDialogOpen}
          onOpenChange={setIsUsersDialogOpen}
        />
      )}
      
      {/* Edit Dialog for Admin/Super Admin */}
      {(isAdmin || isSuperAdmin) && (
        <EquipmentCardDialogs
          deviceCode={deviceCode}
          isUsersDialogOpen={false}
          onUsersDialogChange={() => {}}
          isEditDialogOpen={isEditDialogOpen}
          onEditDialogChange={setIsEditDialogOpen}
          newDisplayName={newDisplayName}
          onDisplayNameChange={setNewDisplayName}
          onSaveDisplayName={handleSaveDisplayName}
        />
      )}
    </>
  );
}
