import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bot, HelpCircle } from "lucide-react";

const Assistant = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-chinese-cream via-background to-chinese-cream/30">
        {/* Hero Section - หลงจู๊ Header */}
        <div className="relative border-4 border-chinese-gold bg-gradient-to-r from-chinese-red to-chinese-gold p-8 rounded-xl shadow-2xl mb-8">
          <div className="absolute inset-0 bg-chinese-gold/10 opacity-20 rounded-xl"></div>
          <div className="relative text-center">
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              🐉 หลงจู๊ ผู้พิทักษ์คุณภาพข้าว 🐉
            </h1>
            <p className="text-chinese-cream text-lg font-medium">
              ข้าพเจ้าขออนุญาตนำเรียนท่านผู้มีเกียรติ เกี่ยวกับคุณภาพข้าวในวันนี้
            </p>
          </div>
        </div>

        {/* Live Rice Classification Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Classification Card */}
          <Card className="border-2 border-chinese-jade bg-gradient-to-br from-chinese-cream to-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-chinese-jade to-chinese-green text-white rounded-t-lg">
              <CardTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
                <Bot className="h-6 w-6" />
                การจำแนกประเภทข้าว
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Mock Data - ข้าวขาว */}
                <div className="border-2 border-chinese-gold rounded-lg p-4 bg-gradient-to-r from-chinese-gold/10 to-chinese-gold/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-chinese-dark">ค่าความขาวปัจจุบัน:</span>
                    <span className="text-2xl font-bold text-chinese-red">42.5</span>
                  </div>
                  <div className="text-center p-4 bg-chinese-gold/20 rounded-lg border border-chinese-gold">
                    <h3 className="text-2xl font-bold text-chinese-red mb-2">🌾 ข้าวขาว 🌾</h3>
                    <p className="text-chinese-dark font-medium">
                      ขออนุญาตรายงานผลการตรวจสอบ: ข้าวของท่านมีคุณภาพระดับข้าวขาว
                    </p>
                    <div className="mt-3 text-sm text-chinese-green">
                      ความเชื่อมั่น: 95% | ช่วงค่า: 40-45
                    </div>
                  </div>
                </div>

                {/* AI Report */}
                <div className="bg-chinese-cream/50 border border-chinese-jade rounded-lg p-4">
                  <h4 className="font-semibold text-chinese-dark mb-2">🏛️ รายงานจากหลงจู๊:</h4>
                  <div className="text-sm text-chinese-dark space-y-1">
                    <p>"ท่านผู้มีเกียรติ กระผมขอรายงานว่า..."</p>
                    <p className="ml-4">📊 ค่าความขาว: 42.5 (อยู่ในเกณฑ์ข้าวขาว)</p>
                    <p className="ml-4">🎯 การจำแนก: ข้าวขาว คุณภาพดี</p>
                    <p className="ml-4">📈 แนวโน้ม: เสถียร</p>
                    <p className="italic text-chinese-green mt-2">"ข้าพเจ้าขอรับใช้ด้วยความเคารพ"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historical Data */}
          <Card className="border-2 border-chinese-red bg-gradient-to-br from-chinese-cream to-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-chinese-red to-chinese-gold text-white rounded-t-lg">
              <CardTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
                <MessageCircle className="h-6 w-6" />
                ประวัติการจำแนก
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-chinese-gold/10 rounded-lg border border-chinese-gold/30">
                  <span className="font-medium">เมื่อ 5 นาทีที่แล้ว</span>
                  <span className="px-3 py-1 bg-chinese-gold text-chinese-dark rounded-full text-sm font-bold">ข้าวขาว</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-chinese-jade/10 rounded-lg border border-chinese-jade/30">
                  <span className="font-medium">เมื่อ 15 นาทีที่แล้ว</span>
                  <span className="px-3 py-1 bg-chinese-jade text-white rounded-full text-sm font-bold">ข้าวนึ่ง</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-chinese-gold/10 rounded-lg border border-chinese-gold/30">
                  <span className="font-medium">เมื่อ 30 นาทีที่แล้ว</span>
                  <span className="px-3 py-1 bg-chinese-gold text-chinese-dark rounded-full text-sm font-bold">ข้าวขาว</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Chat Interface */}
        <Card className="border-4 border-chinese-red bg-gradient-to-br from-white to-chinese-cream shadow-2xl mb-8">
          <CardHeader className="bg-gradient-to-r from-chinese-red via-chinese-gold to-chinese-red text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8" />
              🗣️ สนทนากับหลงจู๊
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-chinese-cream/30 border-2 border-chinese-jade rounded-xl p-6 mb-4">
              <div className="text-center mb-4">
                <div className="inline-block p-3 bg-chinese-gold rounded-full">
                  <span className="text-2xl">🐉</span>
                </div>
              </div>
              <div className="text-chinese-dark">
                <p className="text-lg font-medium mb-3 text-center">
                  "ท่านผู้มีเกียรติ กระผมพร้อมให้คำปรึกษาเรื่องคุณภาพข้าว"
                </p>
                <div className="space-y-2 text-sm">
                  <p>• ถามเรื่องการจำแนกประเภทข้าว</p>
                  <p>• ขอคำแนะนำเรื่องคุณภาพ</p>
                  <p>• ดูประวัติการตรวจสอบ</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="พิมพ์คำถามของท่าน..." 
                className="flex-1 p-3 border-2 border-chinese-jade rounded-lg focus:outline-none focus:border-chinese-gold"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-chinese-red to-chinese-gold text-white rounded-lg font-bold hover:shadow-lg transition-all">
                ส่ง
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-chinese-gold to-chinese-gold/70 rounded-xl border-2 border-chinese-gold shadow-lg">
            <div className="text-3xl mb-2">⚖️</div>
            <h3 className="font-bold text-chinese-dark">ความแม่นยำ</h3>
            <p className="text-2xl font-bold text-chinese-red">95%</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-chinese-jade to-chinese-jade/70 rounded-xl border-2 border-chinese-jade shadow-lg">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold text-white">การตรวจสอบวันนี้</h3>
            <p className="text-2xl font-bold text-chinese-cream">127 ครั้ง</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-chinese-red to-chinese-red/70 rounded-xl border-2 border-chinese-red shadow-lg">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-bold text-white">คุณภาพเฉลี่ย</h3>
            <p className="text-2xl font-bold text-chinese-gold">A+</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Assistant;