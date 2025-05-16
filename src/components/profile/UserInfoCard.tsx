
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Clock, Calendar } from "lucide-react";

interface UserInfoCardProps {
  userEmail: string;
  lastSignIn: string;
  created: string;
  onChangePasswordClick: () => void;
}

export const UserInfoCard = ({ userEmail, lastSignIn, created, onChangePasswordClick }: UserInfoCardProps) => {
  return (
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
          onClick={onChangePasswordClick}
          variant="outline"
          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 md:px-6"
        >
          เปลี่ยนรหัสผ่าน
        </Button>
      </CardFooter>
    </Card>
  );
};
