
import { useState, useEffect } from "react";
import { User } from "../../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserAccessList } from "./UserAccessList";
import { UserSearchForm } from "./UserSearchForm";
import { loadUsersWithAccess } from "../../services/userAccessService";

interface UserAccessDialogProps {
  deviceCode: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserAccessDialog({
  deviceCode,
  isOpen,
  onOpenChange
}: UserAccessDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load users when dialog opens
  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        setIsLoading(true);
        try {
          const usersData = await loadUsersWithAccess(deviceCode);
          setUsers(usersData);
        } catch (error) {
          console.error("Error loading users:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadUsers();
    }
  }, [isOpen, deviceCode]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>จัดการสิทธิ์การเข้าถึงอุปกรณ์ {deviceCode}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <UserSearchForm
            deviceCode={deviceCode}
            users={users}
            setUsers={setUsers}
            setIsLoading={setIsLoading}
          />
          
          <UserAccessList
            deviceCode={deviceCode}
            users={users}
            setUsers={setUsers}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
