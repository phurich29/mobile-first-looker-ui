
import { Shield, Users, Newspaper, TrendingUp, Bell, BarChart3, Settings } from "lucide-react";

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
