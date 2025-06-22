
import { Card } from "@/components/ui/card";
import { EquipmentCardHeader } from "./EquipmentCardHeader";
import { EquipmentCardContent } from "./EquipmentCardContent";
import { EquipmentCardDialogs } from "./EquipmentCardDialogs";
import { useEquipmentCard } from "./hooks/useEquipmentCard";

interface EquipmentCardContainerProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
  displayName?: string;
  onDeviceUpdated?: () => void;
}

export function EquipmentCardContainer({
  deviceCode,
  lastUpdated,
  isAdmin = false,
  displayName,
  onDeviceUpdated
}: EquipmentCardContainerProps) {
  const {
    isUsersDialogOpen,
    setIsUsersDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    newDisplayName,
    setNewDisplayName,
    handleSaveDisplayName
  } = useEquipmentCard(deviceCode, displayName, onDeviceUpdated);

  return (
    <>
      <Card className="duration-300 border border-gray-200 dark:border-gray-700 bg-emerald-100 dark:bg-emerald-800 bg-[linear-gradient(rgba(255,255,255,0.98),rgba(255,255,255,0.98)),url('/lovable-uploads/6b12828f-a844-4f45-be72-ca664963430d.png')] bg-repeat shadow-none">
        <EquipmentCardHeader
          deviceCode={deviceCode}
          displayName={displayName}
          isAdmin={isAdmin}
          onUsersClick={() => setIsUsersDialogOpen(true)}
        />
        
        <EquipmentCardContent
          deviceCode={deviceCode}
          lastUpdated={lastUpdated}
          isAdmin={isAdmin}
          onEditClick={() => setIsEditDialogOpen(true)}
        />
      </Card>
      
      {isAdmin && (
        <EquipmentCardDialogs
          deviceCode={deviceCode}
          isUsersDialogOpen={isUsersDialogOpen}
          onUsersDialogChange={setIsUsersDialogOpen}
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
