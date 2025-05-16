
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Clock, Calendar, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserInfoCardProps {
  userEmail: string;
  lastSignIn: string;
  created: string;
  onChangePasswordClick: () => void;
}

export const UserInfoCard = ({ userEmail, lastSignIn, created, onChangePasswordClick }: UserInfoCardProps) => {
  return (
    <Card className="md:col-span-2 shadow-lg border border-emerald-100 dark:border-emerald-900/40 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-50/25 dark:from-emerald-900/10 dark:to-transparent -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl flex items-center">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-1.5 rounded-md mr-3">
            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-emerald-800 dark:text-emerald-300">ข้อมูลผู้ใช้</span>
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">ข้อมูลบัญชีผู้ใช้ของคุณ</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5 pb-6">
        <div className="bg-white/80 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30 transform transition-all duration-200 hover:bg-white dark:hover:bg-gray-800/70 hover:shadow-md">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">อีเมลผู้ใช้</p>
          <p className="text-base md:text-lg font-medium text-gray-800 dark:text-gray-100">{userEmail}</p>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30 flex items-start md:items-center transform transition-all duration-200 hover:bg-white dark:hover:bg-gray-800/70 hover:shadow-md">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-full mr-3 flex-shrink-0">
            <Clock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">เข้าสู่ระบบครั้งล่าสุด</p>
            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{lastSignIn}</p>
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30 flex items-start md:items-center transform transition-all duration-200 hover:bg-white dark:hover:bg-gray-800/70 hover:shadow-md">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-full mr-3 flex-shrink-0">
            <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">สมัครเมื่อ</p>
            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{created}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="py-5 flex flex-wrap gap-3 bg-gray-50/80 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800/50 rounded-b-lg">
        <Button 
          onClick={onChangePasswordClick}
          variant="outline"
          className="border-emerald-500 text-emerald-700 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-6 gap-2 font-medium"
        >
          <KeyRound className="w-4 h-4" /> เปลี่ยนรหัสผ่าน
        </Button>
      </CardFooter>
    </Card>
  );
};
