
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Users, Filter } from "lucide-react";

interface DeviceTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
}

export function DeviceTabs({ children, defaultValue = "devices" }: DeviceTabsProps) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList className="mb-6">
        <TabsTrigger value="devices" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>อุปกรณ์</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>ผู้ใช้งาน</span>
        </TabsTrigger>
        <TabsTrigger value="mapping" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>จัดการการเข้าถึง</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
