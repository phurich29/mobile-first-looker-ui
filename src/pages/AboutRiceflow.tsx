
import { AppLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, BarChart3, Shield, Users, ExternalLink, Phone } from "lucide-react";

export default function AboutRiceflow() {
  return (
    <AppLayout showFooterNav contentPaddingBottom="pb-32 md:pb-16">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-8 w-32 h-32 bg-emerald-300 rounded-full filter blur-3xl opacity-10 -z-10"></div>
      <div className="absolute bottom-20 left-8 w-40 h-40 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
      
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-800 dark:text-emerald-400 mb-4">
            รู้จัก Riceflow
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            ระบบตรวจสอบคุณภาพข้าวอัจฉริยะที่จะช่วยยกระดับการจัดการข้าวของคุณ
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-emerald-800 dark:text-emerald-400">
                  ตรวจสอบคุณภาพแบบเรียลไทม์
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                ติดตามคุณภาพข้าวแบบเรียลไทม์ด้วยเทคโนโลยีล้ำสมัย ตรวจสอบความชื้น ปริมาณเศษ และคุณภาพอื่นๆ
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-emerald-800 dark:text-emerald-400">
                  ระบบแจ้งเตือนอัจฉริยะ
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                รับการแจ้งเตือนทันทีเมื่อค่าคุณภาพข้าวเกินขีดจำกัดที่กำหนด ป้องกันปัญหาก่อนที่จะเกิดขึ้น
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-emerald-800 dark:text-emerald-400">
                  เป็นมิตรต่อสิ่งแวดล้อม
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                ช่วยลดการสูญเสียข้าวและเพิ่มประสิทธิภาพการจัดเก็บ ส่งผลดีต่อสิ่งแวดล้อมและต้นทุน
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-emerald-800 dark:text-emerald-400">
                  ใช้งานง่าย
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                อินเทอร์เฟซที่ใช้งานง่าย เหมาะสำหรับทุกระดับผู้ใช้ ตั้งแต่เกษตรกรไปจนถึงผู้ประกอบการ
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Image Section */}
        <div className="mb-12">
          <img 
            src="/lovable-uploads/49e4e3a9-d748-4edf-bd4f-726dd0b9fde9.png" 
            alt="เครื่องวิเคราะห์คุณภาพข้าว Panolyzer Rice Quality Analyzer" 
            className="w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          />
        </div>

        {/* About Section */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800/30">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 mb-4 text-center">
              ทำไมต้องเลือก Riceflow?
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Riceflow คือระบบตรวจสอบคุณภาพข้าวที่พัฒนาขึ้นเพื่อช่วยเหลือเกษตรกรและผู้ประกอบการในอุตสาหกรรมข้าว
                ให้สามารถจัดการคุณภาพข้าวได้อย่างมีประสิทธิภาพ
              </p>
              <p>
                ด้วยเทคโนโลยีการตรวจสอบแบบเรียลไทม์ คุณสามารถติดตามสถานะข้าวของคุณได้ตลอดเวลา
                ไม่ว่าจะเป็นการตรวจสอบความชื้น การวิเคราะห์ปริมาณเศษ หรือการประเมินคุณภาพโดยรวม
              </p>
              <p>
                ระบบของเราช่วยให้คุณตัดสินใจได้อย่างรวดเร็วและแม่นยำ ลดการสูญเสีย และเพิ่มผลกำไรจากการขายข้าว
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-400 mb-4">
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            ติดต่อเราเพื่อสอบถามข้อมูลเพิ่มเติมและเริ่มใช้งาน Riceflow
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
            >
              <a 
                href="tel:064-6545636"
                className="inline-flex items-center gap-2"
              >
                <Phone className="h-5 w-5" />
                โทร 064-6545636
              </a>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-3"
            >
              <a 
                href="https://c2tech.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                เข้าสู่เว็บไซต์
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
