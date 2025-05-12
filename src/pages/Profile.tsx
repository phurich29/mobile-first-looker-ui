
import React, { useState } from 'react';
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const passwordSchema = z.object({
  password: z.string().min(6, {
    message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ 
        password: values.password 
      });

      if (error) {
        console.error("Password update error:", error);
        
        // Check for the specific error message about same password
        if (error.message.includes("same password")) {
          setErrorMessage("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน");
        } else {
          setErrorMessage(error.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
        }
        
        setShowErrorDialog(true);
        return;
      }

      // แสดง dialog สำเร็จ
      setShowSuccessDialog(true);
      
      // ปิด dialog และ reset form
      setShowPasswordDialog(false);
      form.reset();
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setErrorMessage(error.message || "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const userEmail = user?.email || "ไม่พบข้อมูลอีเมล";
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : "ไม่พบข้อมูลวันที่";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      <div className="container px-4 py-8 md:py-12 mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-emerald-800">ข้อมูลส่วนตัว</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ข้อมูลส่วนตัว */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>ข้อมูลผู้ใช้</CardTitle>
              <CardDescription>ข้อมูลบัญชีผู้ใช้ของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">อีเมลผู้ใช้</p>
                <p className="text-lg font-medium">{userEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">รหัสผู้ใช้</p>
                <p className="text-lg font-medium break-all">{user?.id || "ไม่พบข้อมูล"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">สมัครเมื่อ</p>
                <p className="text-lg font-medium">{created}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => setShowPasswordDialog(true)}
                variant="outline"
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                เปลี่ยนรหัสผ่าน
              </Button>
            </CardFooter>
          </Card>
          
          {/* กล่องแสดงสถานะ */}
          <Card>
            <CardHeader>
              <CardTitle>สถานะบัญชี</CardTitle>
              <CardDescription>สถานะการเข้าใช้งานปัจจุบัน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 flex items-center justify-between">
                <p className="text-emerald-800 font-medium">เข้าสู่ระบบแล้ว</p>
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">อีเมลที่ยืนยันแล้ว</p>
                <p className="text-lg font-medium">
                  {user?.email_confirmed_at ? "ยืนยันแล้ว ✓" : "ยังไม่ได้ยืนยัน"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog สำหรับเปลี่ยนรหัสผ่าน */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
              <DialogDescription>
                กำหนดรหัสผ่านใหม่ที่ปลอดภัยสำหรับบัญชีของคุณ
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รหัสผ่านใหม่</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="กำหนดรหัสผ่านใหม่" 
                          autoComplete="new-password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="ยืนยันรหัสผ่านใหม่" 
                          autoComplete="new-password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowPasswordDialog(false);
                      form.reset();
                    }}
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? "กำลังดำเนินการ..." : "ยืนยันการเปลี่ยนรหัสผ่าน"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog แสดงผลสำเร็จ */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>เปลี่ยนรหัสผ่านสำเร็จ</AlertDialogTitle>
              <AlertDialogDescription>
                รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว คุณสามารถใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งต่อไป
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>ตกลง</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog แสดงข้อผิดพลาด */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>เกิดข้อผิดพลาด</AlertDialogTitle>
              <AlertDialogDescription>
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>ตกลง</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Profile;
