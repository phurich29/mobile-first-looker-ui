
import { Shield, Users, Newspaper, TrendingUp, Bell, BarChart3, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export interface RolePermission {
  icon: any;
  description: string;
  allowed: boolean;
}

export interface RoleDescription {
  name: string;
  color: string;
  bgColor: string;
  permissions: RolePermission[];
}

export const ROLE_DESCRIPTIONS: Record<string, RoleDescription> = {
  user: {
    name: "ผู้ใช้ทั่วไป",
    color: "text-green-800 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-700/30",
    permissions: [
      {
        icon: BarChart3,
        description: "ดูข้อมูลการวิเคราะห์คุณภาพข้าวของอุปกรณ์ที่ได้รับสิทธิ์",
        allowed: true
      },
      {
        icon: Bell,
        description: "ตั้งค่าการแจ้งเตือนส่วนตัว",
        allowed: true
      },
      {
        icon: TrendingUp,
        description: "ดูประวัติการวัด",
        allowed: true
      },
      {
        icon: Users,
        description: "จัดการผู้ใช้อื่น",
        allowed: false
      },
      {
        icon: Newspaper,
        description: "จัดการข่าวสาร",
        allowed: false
      }
    ]
  },
  admin: {
    name: "ผู้ดูแลระบบ",
    color: "text-blue-800 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-700/30",
    permissions: [
      {
        icon: BarChart3,
        description: "สิทธิ์ทั้งหมดของ User",
        allowed: true
      },
      {
        icon: Newspaper,
        description: "จัดการข่าวสาร (เพิ่ม/แก้ไข/ลบ)",
        allowed: true
      },
      {
        icon: Settings,
        description: "จัดการสิทธิ์การเข้าถึงอุปกรณ์ของผู้ใช้",
        allowed: true
      },
      {
        icon: BarChart3,
        description: "ดูข้อมูลอุปกรณ์ทั้งหมด",
        allowed: true
      },
      {
        icon: Shield,
        description: "จัดการผู้ใช้ Superadmin",
        allowed: false
      }
    ]
  },
  superadmin: {
    name: "ผู้ดูแลระบบสูงสุด",
    color: "text-red-800 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-700/30",
    permissions: [
      {
        icon: Shield,
        description: "สิทธิ์ทั้งหมดของ Admin",
        allowed: true
      },
      {
        icon: Users,
        description: "จัดการผู้ใช้ทั้งหมด (เพิ่ม/ลบ/แก้ไข)",
        allowed: true
      },
      {
        icon: Settings,
        description: "เปลี่ยนสิทธิ์ผู้ใช้ (รวมถึง Admin และ Superadmin)",
        allowed: true
      },
      {
        icon: BarChart3,
        description: "เข้าถึงข้อมูลทั้งหมดในระบบ",
        allowed: true
      }
    ]
  }
};

export const getRoleDescription = (role: string): RoleDescription | null => {
  return ROLE_DESCRIPTIONS[role] || null;
};

export const getCurrentUserHighestRole = (roles: string[]): string => {
  if (roles.includes('superadmin')) return 'superadmin';
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('user')) return 'user';
  return 'user'; // default fallback
};

// Updated function that returns translated role descriptions
export const getTranslatedRoleDescription = (role: string): RoleDescription | null => {
  const { t } = useTranslation();
  
  const baseRole = ROLE_DESCRIPTIONS[role];
  if (!baseRole) return null;

  const translatedPermissions: RolePermission[] = role === 'user' ? [
    {
      icon: BarChart3,
      description: t('userManagement', 'permissions.viewRiceAnalysis' as any),
      allowed: true
    },
    {
      icon: Bell,
      description: t('userManagement', 'permissions.personalNotifications' as any),
      allowed: true
    },
    {
      icon: TrendingUp,
      description: t('userManagement', 'permissions.viewHistory' as any),
      allowed: true
    },
    {
      icon: Users,
      description: t('userManagement', 'permissions.manageUsers' as any),
      allowed: false
    },
    {
      icon: Newspaper,
      description: t('userManagement', 'permissions.manageNews' as any),
      allowed: false
    }
  ] : role === 'admin' ? [
    {
      icon: BarChart3,
      description: t('userManagement', 'permissions.allUserRights' as any),
      allowed: true
    },
    {
      icon: Newspaper,
      description: t('userManagement', 'permissions.manageNewsAdvanced' as any),
      allowed: true
    },
    {
      icon: Settings,
      description: t('userManagement', 'permissions.manageDeviceAccess' as any),
      allowed: true
    },
    {
      icon: BarChart3,
      description: t('userManagement', 'permissions.viewAllDevices' as any),
      allowed: true
    },
    {
      icon: Shield,
      description: t('userManagement', 'permissions.manageSuperadmin' as any),
      allowed: false
    }
  ] : [
    {
      icon: Shield,
      description: t('userManagement', 'permissions.allAdminRights' as any),
      allowed: true
    },
    {
      icon: Users,
      description: t('userManagement', 'permissions.manageAllUsers' as any),
      allowed: true
    },
    {
      icon: Settings,
      description: t('userManagement', 'permissions.changeUserRoles' as any),
      allowed: true
    },
    {
      icon: BarChart3,
      description: t('userManagement', 'permissions.accessAllData' as any),
      allowed: true
    }
  ];

  return {
    name: t('userManagement', `roles.${role}` as any),
    color: baseRole.color,
    bgColor: baseRole.bgColor,
    permissions: translatedPermissions
  };
};
