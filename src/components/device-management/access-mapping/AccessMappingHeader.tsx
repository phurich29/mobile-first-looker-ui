
import { CardHeader, CardTitle } from "@/components/ui/card";

interface AccessMappingHeaderProps {
  selectedDevice: string | null;
  selectedUser: string | null;
  users: { id: string; email: string }[];
}

export function AccessMappingHeader({ 
  selectedDevice, 
  selectedUser, 
  users 
}: AccessMappingHeaderProps) {
  const getTitle = () => {
    if (selectedDevice) {
      return `ผู้ใช้ที่เข้าถึงอุปกรณ์: ${selectedDevice}`;
    } else if (selectedUser) {
      return `อุปกรณ์ที่ผู้ใช้: ${users.find(u => u.id === selectedUser)?.email || ''} สามารถเข้าถึงได้`;
    } else {
      return 'เลือกอุปกรณ์หรือผู้ใช้เพื่อจัดการการเข้าถึง';
    }
  };

  return (
    <CardHeader>
      <CardTitle>{getTitle()}</CardTitle>
    </CardHeader>
  );
}
