
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";

export default function Waiting() {
  const { user, userRoles, signOut } = useAuth();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has roles other than waiting_list, redirect to home
  if (!userRoles.includes('waiting_list') || userRoles.includes('user') || 
      userRoles.includes('admin') || userRoles.includes('superadmin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">รอการอนุมัติ</CardTitle>
          <CardDescription>
            บัญชีของคุณอยู่ในขั้นตอนการตรวจสอบ
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            <p className="text-center">
              ขณะนี้บัญชีของคุณอยู่ในรายชื่อรอการอนุมัติ
              <br />
              กรุณารอการตรวจสอบจากผู้ดูแลระบบ
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-800 mb-2">ขั้นตอนการอนุมัติ:</h3>
            <ol className="list-decimal ml-5 space-y-2 text-gray-600">
              <li>ผู้ดูแลระบบจะตรวจสอบข้อมูลของคุณ</li>
              <li>เมื่อได้รับการอนุมัติ คุณจะได้รับแจ้งเตือนทางอีเมล</li>
              <li>หลังจากนั้น คุณจะสามารถเข้าสู่ระบบและใช้งานได้ทันที</li>
            </ol>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => signOut()}
            className="w-full max-w-xs"
          >
            ออกจากระบบ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
