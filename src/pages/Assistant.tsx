import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bot, HelpCircle } from "lucide-react";

const Assistant = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            ผู้ช่วยระบบ RiceFlow
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ระบบช่วยเหลือและคำแนะนำในการใช้งาน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Bot className="h-6 w-6 text-emerald-600 mr-2" />
              <CardTitle className="text-lg">AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                ใช้งานผู้ช่วย AI สำหรับการวิเคราะห์และแนะนำเกี่ยวกับคุณภาพข้าว
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <MessageCircle className="h-6 w-6 text-blue-600 mr-2" />
              <CardTitle className="text-lg">แชทบอท</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                สอบถามข้อมูลและรับคำแนะนำผ่านระบบแชทอัตโนมัติ
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <HelpCircle className="h-6 w-6 text-purple-600 mr-2" />
              <CardTitle className="text-lg">คู่มือการใช้งาน</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                เรียนรู้วิธีการใช้งานระบบและฟีเจอร์ต่างๆ อย่างละเอียด
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ฟีเจอร์ที่กำลังพัฒนา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                  ระบบผู้ช่วย AI
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300">
                  ผู้ช่วยอัจฉริยะที่จะช่วยวิเคราะห์ข้อมูลคุณภาพข้าวและให้คำแนะนำเฉพาะ
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  แชทบอทแบบเรียลไทม์
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  สนทนาและขอคำปรึกษาเกี่ยวกับการจัดการคุณภาพข้าวแบบทันที
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-l-4 border-purple-500">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  ระบบช่วยเหลือแบบ Interactive
                </h3>
                <p className="text-purple-700 dark:text-purple-300">
                  คู่มือการใช้งานแบบโต้ตอบที่จะนำทางผู้ใช้ทีละขั้นตอน
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Assistant;