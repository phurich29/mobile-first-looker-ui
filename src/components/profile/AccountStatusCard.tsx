
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface AccountStatusCardProps {
  user: User | null;
}

export const AccountStatusCard = ({ user }: AccountStatusCardProps) => {
  return (
    <Card className="shadow-lg h-fit border border-blue-100 dark:border-blue-900/40 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-50/25 dark:from-blue-900/10 dark:to-transparent -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-md mr-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-blue-800 dark:text-blue-300">สถานะบัญชี</span>
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">สถานะการเข้าใช้งานปัจจุบัน</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-6">
        <div className="bg-emerald-50/90 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-5 flex items-center justify-between transform transition-all duration-200 hover:shadow-md hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-800/40 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-emerald-800 dark:text-emerald-300 font-medium">
              เข้าสู่ระบบแล้ว
            </p>
          </div>
          <div className="bg-emerald-200/50 dark:bg-emerald-800/30 px-2 py-1 rounded-md text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Active
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700/30 transform transition-all duration-200 hover:bg-white dark:hover:bg-gray-800/70 hover:shadow-md">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">สถานะการยืนยันอีเมล</p>
          {user?.email_confirmed_at ? (
            <div className="flex items-center gap-2 bg-emerald-50/60 dark:bg-emerald-900/20 py-2 px-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-emerald-700 dark:text-emerald-300 font-medium">ยืนยันแล้ว</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50/60 dark:bg-amber-900/20 py-2 px-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-amber-700 dark:text-amber-300 font-medium">ยังไม่ได้ยืนยัน</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
