
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Shield, Clock, Calendar, Mail } from "lucide-react";

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
  const isMobile = useIsMobile();

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
  
  // Format last sign in time
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : "ไม่มีข้อมูล";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      <div className="container px-3 py-6 md:py-12 pb-24 mx-auto max-w-6xl">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-800">ข้อมูลส่วนตัว</h1>
        </div>
        
        <div className={`grid ${!isMobile ? 'grid-cols-1 md:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
          {/* ข้อมูลส่วนตัว */}
          <Card className="md:col-span-2 shadow-md border-t-4 border-t-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl md:text-2xl flex items-center">
                <Mail className="w-5 h-5 mr-2 text-emerald-600" />
                ข้อมูลผู้ใช้
              </CardTitle>
              <CardDescription>ข้อมูลบัญชีผู้ใช้ของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">อีเมลผู้ใช้</p>
                <p className="text-base md:text-lg font-medium">{userEmail}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-start md:items-center">
                <Clock className="w-5 h-5 mt-1 md:mt-0 mr-3 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">เข้าสู่ระบบครั้งล่าสุด</p>
                  <p className="text-base font-medium">{lastSignIn}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-start md:items-center">
                <Calendar className="w-5 h-5 mt-1 md:mt-0 mr-3 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">สมัครเมื่อ</p>
                  <p className="text-base font-medium">{created}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-4 flex flex-wrap gap-3 bg-gray-50 rounded-b-lg mt-2">
              <Button 
                onClick={() => setShowPasswordDialog(true)}
                variant="outline"
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 md:px-6"
              >
                เปลี่ยนรหัสผ่าน
              </Button>
            </CardFooter>
          </Card>
          
          {/* กล่องแสดงสถานะ */}
          <Card className="shadow-md h-fit border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl md:text-2xl flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                สถานะบัญชี
              </CardTitle>
              <CardDescription>สถานะการเข้าใช้งานปัจจุบัน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 flex items-center justify-between">
                <p className="text-emerald-800 font-medium flex items-center">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                  เข้าสู่ระบบแล้ว
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">อีเมลที่ยืนยันแล้ว</p>
                <p className="text-base font-medium flex items-center">
                  {user?.email_confirmed_at ? (
                    <>
                      <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                      ยืนยันแล้ว
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                      ยังไม่ได้ยืนยัน
                    </>
                  )}
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
      
      <FooterNav />
    </div>
  );
};

export default Profile;
