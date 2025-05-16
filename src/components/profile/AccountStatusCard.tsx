
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface AccountStatusCardProps {
  user: User | null;
}

export const AccountStatusCard = ({ user }: AccountStatusCardProps) => {
  return (
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
  );
};
