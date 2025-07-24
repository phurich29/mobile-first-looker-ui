export const translations = {
  mainMenu: {
    home: { th: 'หน้าหลัก', en: 'Home' },
    device: { th: 'อุปกรณ์', en: 'Device' },
    profile: { th: 'ข้อมูลส่วนตัว', en: 'Profile' },
    notificationsHistory: { th: 'ประวัติการแจ้งเตือน', en: 'Notifications History' },
    userManagement: { th: 'จัดการผู้ใช้งาน', en: 'User Management' },
    ricePrice: { th: 'ราคาข้าว', en: 'Rice Price' },
    news: { th: 'ข่าวสาร', en: 'News' },
    aboutRiceflow: { th: 'เกี่ยวกับ Riceflow', en: 'About Riceflow' },
  },
  login: {
    login: { th: 'เข้าสู่ระบบ', en: 'Login' },
    logout: { th: 'ออกจากระบบ', en: 'Logout' },
    email: { th: 'อีเมล', en: 'Email' },
    password: { th: 'รหัสผ่าน', en: 'Password' },
    forgotPassword: { th: 'ลืมรหัสผ่าน', en: 'Forgot Password' },
    register: { th: 'สมัครสมาชิก', en: 'Register' },
  },
  device: {
    equipment: { th: 'อุปกรณ์', en: 'Equipment' },
    deviceCode: { th: 'รหัสอุปกรณ์', en: 'Device Code' },
    deviceName: { th: 'ชื่ออุปกรณ์', en: 'Device Name' },
    status: { th: 'สถานะ', en: 'Status' },
    online: { th: 'ออนไลน์', en: 'Online' },
    offline: { th: 'ออฟไลน์', en: 'Offline' },
    lastUpdate: { th: 'อัปเดตล่าสุด', en: 'Last Update' },
    manageUsers: { th: 'จัดการผู้ใช้', en: 'Manage Users' },
    deleteDevice: { th: 'ลบอุปกรณ์', en: 'Delete Device' },
  },
  profile: {
    profile: { th: 'ข้อมูลส่วนตัว', en: 'Profile' },
    name: { th: 'ชื่อ', en: 'Name' },
    email: { th: 'อีเมล', en: 'Email' },
    role: { th: 'บทบาท', en: 'Role' },
    save: { th: 'บันทึก', en: 'Save' },
    changePassword: { th: 'เปลี่ยนรหัสผ่าน', en: 'Change Password' },
  },
  buttons: {
    save: { th: 'บันทึก', en: 'Save' },
    cancel: { th: 'ยกเลิก', en: 'Cancel' },
    delete: { th: 'ลบ', en: 'Delete' },
    edit: { th: 'แก้ไข', en: 'Edit' },
    add: { th: 'เพิ่ม', en: 'Add' },
    close: { th: 'ปิด', en: 'Close' },
    confirm: { th: 'ยืนยัน', en: 'Confirm' },
    back: { th: 'กลับ', en: 'Back' },
  },
  general: {
    loading: { th: 'กำลังโหลด...', en: 'Loading...' },
    error: { th: 'เกิดข้อผิดพลาด', en: 'Error' },
    success: { th: 'สำเร็จ', en: 'Success' },
    noData: { th: 'ไม่มีข้อมูล', en: 'No Data' },
    search: { th: 'ค้นหา', en: 'Search' },
    filter: { th: 'กรอง', en: 'Filter' },
    language: { th: 'ภาษา', en: 'Language' },
    notifications: { th: 'แจ้งเตือน', en: 'Notifications' },
    thai: { th: 'ไทย', en: 'Thai' },
    english: { th: 'อังกฤษ', en: 'English' },
  }
} as const;

export type TranslationKey = keyof typeof translations;
export type TranslationSubKey<T extends TranslationKey> = keyof typeof translations[T];