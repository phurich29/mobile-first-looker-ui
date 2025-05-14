
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { User } from "../types";
import { useAuth } from "@/components/AuthProvider";

export function useUsersFetching() {
  const { toast } = useToast();
  const { user, userRoles } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  // Check if current user is superadmin
  const isSuperAdmin = userRoles.includes('superadmin');

  // Fetch users and their roles
  useEffect(() => {
    fetchUsers();
  }, [user, userRoles, toast, isSuperAdmin]);

  const fetchUsers = async () => {
    if (!user || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
      return;
    }

    try {
      setIsLoadingUsers(true);
      
      // Fetch all users with last sign in details
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authError) {
        console.error("Auth users error:", authError);
        throw authError;
      }
      
      // For each user, fetch their roles
      const usersWithRoles = await Promise.all(
        (authUsers?.users || []).map(async (authUser) => {
          const { data: roles, error: rolesError } = await supabase.rpc(
            'get_user_roles',
            { user_id: authUser.id }
          );

          if (rolesError) {
            console.error('Error fetching roles for user:', authUser.id, rolesError);
          }
          
          return {
            id: authUser.id,
            email: authUser.email || 'unknown@example.com',
            roles: roles || [],
            last_sign_in_at: authUser.last_sign_in_at
          };
        })
      );

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

  return {
    users,
    setUsers,
    isLoadingUsers,
    isSuperAdmin,
    fetchUsers
  };
}
