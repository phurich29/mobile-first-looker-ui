
import { EquipmentCardContainer } from "./card/EquipmentCardContainer";

interface EquipmentCardProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  displayName?: string;
  onDeviceUpdated?: () => void;
}

export function EquipmentCard(props: EquipmentCardProps) {
  return <EquipmentCardContainer {...props} />;
}
