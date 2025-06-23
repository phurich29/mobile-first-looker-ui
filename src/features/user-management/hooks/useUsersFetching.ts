
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { User } from "../types";
import { useAuth } from "@/components/AuthProvider";
import * as userService from "../services/userService";

export function useUsersFetching() {
  const { toast } = useToast();
  const { user, userRoles } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  // Check if current user is superadmin
  const isSuperAdmin = userRoles.includes('superadmin');

  // Add fetchUsers function for external use
  const fetchUsers = async () => {
    if (!user || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
      return;
    }

    try {
      setIsLoadingUsers(true);
      
      // Use the service to fetch users
      const usersWithRoles = await userService.fetchUsers();
      
      // Filter users based on current user's role
      let filteredUsers = usersWithRoles;
      
      // If user is not a superadmin, filter out superadmins from the list
      if (!isSuperAdmin) {
        filteredUsers = usersWithRoles.filter(user => !user.roles.includes('superadmin'));
      }
      
      setUsers(filteredUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: "การโหลดข้อมูลผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch users and their roles
  useEffect(() => {
    fetchUsers();
  }, [user, userRoles, toast, isSuperAdmin]);

  return {
    users,
    setUsers,
    isLoadingUsers,
    isSuperAdmin,
    fetchUsers
  };
}
