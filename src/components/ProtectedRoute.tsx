
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
  allowUnauthenticated?: boolean; // เพิ่มตัวเลือกสำหรับหน้าที่อนุญาตให้เข้าชมโดยไม่ต้องล็อกอิน
  path?: string; // เพิ่มตัวแปรเก็บเส้นทางปัจจุบันเพื่อใช้ในการตัดสินใจเรื่องการนำทาง
}

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  redirectTo = "/login",
  allowUnauthenticated = false, // ค่าเริ่มต้นคือไม่อนุญาต
  path = window.location.pathname, // ใช้เส้นทางปัจจุบันเป็นค่าเริ่มต้น
}: ProtectedRouteProps) => {
  const { user, userRoles, isLoading } = useAuth();

  // Show detailed console logs for debugging
  console.log("Protected route checking access:");
  console.log("- Required roles:", requiredRoles);
  console.log("- Current user roles:", userRoles);
  console.log("- User authenticated:", !!user);
  console.log("- Is still loading auth:", isLoading);
  console.log("- Allow unauthenticated:", allowUnauthenticated);

  // If auth is still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // ตรวจสอบว่าอนุญาตให้ผู้ที่ไม่ได้ล็อกอินเข้าชมหน้านี้หรือไม่
  if (!user && !allowUnauthenticated) {
    console.log("User not logged in, redirecting to", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }
  
  // ถ้าเข้าชมได้โดยไม่ต้องล็อกอินและผู้ใช้ไม่ได้ล็อกอิน ให้แสดงหน้า
  if (!user && allowUnauthenticated) {
    return <>{children}</>;
  }
  
  // ถ้ามีการล็อกอินแล้วและผู้ใช้อยู่ในสถานะ waiting_list เท่านั้น ให้ไปที่หน้า waiting
  // ยกเว้นกรณีที่กำลังอยู่ที่หน้า user-management ซึ่งอาจมีการเพิ่มผู้ใช้ใหม่ที่ควรจะอยู่ที่หน้าเดิม
  if (user && userRoles.includes('waiting_list') && 
      !userRoles.includes('user') && 
      !userRoles.includes('admin') && 
      !userRoles.includes('superadmin') && 
      path !== '/user-management' && 
      !path.includes('/user-management')) { // เพิ่มการตรวจสอบว่าไม่ได้อยู่ที่หน้า user-management
    console.log("User is in waiting list only, redirecting to waiting page");
    console.log("Current path:", path);
    return <Navigate to="/waiting" replace />;
  }

  // ถ้าผู้ใช้เป็น superadmin ให้สามารถเข้าถึงได้ทุกส่วน โดยไม่ต้องตรวจสอบ requiredRoles
  if (userRoles.includes('superadmin')) {
    console.log("User is a superadmin, granting access");
    return <>{children}</>;
  }

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ตามที่กำหนดหรือไม่ (ถ้ามีการกำหนด)
  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => userRoles.includes(role));
  
  if (!hasRequiredRole) {
    console.log("User doesn't have required role, redirecting to", redirectTo);
    console.log("User roles:", userRoles);
    console.log("Required roles:", requiredRoles);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
