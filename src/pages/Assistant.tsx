import React from "react";
import { DeviceDisplay } from "@/features/assistant/components/DeviceDisplay";
import { useMemo } from "react";
import { AssistantProvider, useAssistant } from "@/features/assistant/context/AssistantContext";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bot, HelpCircle } from "lucide-react";
import { useTypewriter } from '@/hooks/useTypewriter';

const TypewriterReport = ({ text }: { text: string }) => {
  const displayedText = useTypewriter(text, 30);
  return <p>"{displayedText}"</p>;
};

const AssistantContent = () => {
    const { selectedDevice } = useAssistant();

  // Main display values
  const whitenessValue = selectedDevice?.deviceData?.whiteness ?? 0;

  // Detailed report values
  const confidence = selectedDevice?.deviceData?.confidence;
  const valueRange = selectedDevice?.deviceData?.value_range;
  const longJooReport = selectedDevice?.deviceData?.long_joo_report;
  const whitenessClassification = selectedDevice?.deviceData?.whiteness_classification;
    const classificationDetails = selectedDevice?.deviceData?.classification_details;
    const trend = selectedDevice?.deviceData?.trend;

    const riceAnalysis = useMemo(() => {
    if (!selectedDevice) {
      return {
        title: "รอการวิเคราะห์",
        description: "กรุณาเลือกอุปกรณ์เพื่อดูผลการตรวจสอบ",
      };
    }

    if (whitenessValue >= 40 && whitenessValue <= 45) {
      return {
        title: "ข้าวขาว",
        description: "ผลการตรวจสอบ: ข้าวของท่านจัดอยู่ในเกณฑ์คุณภาพข้าวขาว",
      };
    } else if (whitenessValue >= 25 && whitenessValue <= 30) {
      return {
        title: "ข้าวนึ่ง",
        description: "ผลการตรวจสอบ: ข้าวของท่านจัดอยู่ในเกณฑ์คุณภาพข้าวนึ่ง",
      };
    } else {
      return {
                title: "ไม่สามารถระบุประเภท",
        description: `ค่าความขาว ${whitenessValue.toFixed(1)} อยู่นอกเกณฑ์การจำแนกประเภทข้าว`,
      };
    }
  }, [selectedDevice, whitenessValue]);
    return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-chinese-cream via-background to-chinese-cream/30">
        {/* Hero Section - หลงจู๊ Header */}
        <div className="relative border-4 border-chinese-gold bg-gradient-to-r from-chinese-red to-chinese-gold p-8 rounded-xl shadow-2xl mb-8">
          <div className="absolute inset-0 bg-chinese-gold/10 opacity-20 rounded-xl"></div>
          <div className="relative text-center">
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              หลงจู๊ AI assistant
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
            <CardContent className="p-0 w-full">
              <div className="space-y-4">
                {/* Assistant Response */}
                <DeviceDisplay />
                <div className="border-2 border-chinese-gold rounded-lg p-4 bg-gradient-to-r from-chinese-gold/10 to-chinese-gold/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-chinese-dark">ค่าความขาวปัจจุบัน:</span>
                    <span className="text-2xl font-bold text-chinese-red">{whitenessValue.toFixed(1)}</span>
                  </div>
                  <div className="text-center p-4 bg-chinese-gold/20 rounded-lg border border-chinese-gold">
                    <h3 className="text-2xl font-bold text-chinese-red mb-2">🌾 {riceAnalysis.title} 🌾</h3>
                    <p className="text-chinese-dark font-medium">
                      {riceAnalysis.description}
                    </p>
                    {selectedDevice && confidence && valueRange && (
                      <div className="mt-3 text-sm text-chinese-green">
                        ความเชื่อมั่น: {confidence}% | ช่วงค่า: {valueRange}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Report */}
                <div className="bg-chinese-cream/50 border border-chinese-jade rounded-lg p-4">
                  <h4 className="font-semibold text-chinese-dark mb-2">🏛️ รายงานจากหลงจู๊:</h4>
                  <div className="text-sm text-chinese-dark space-y-1">
                    {selectedDevice ? (
                      <>
                        <TypewriterReport key={longJooReport || 'default-report'} text={longJooReport || `เรียน ท่านผู้มีเกียรติ จากการตรวจสอบอย่างละเอียด ข้าวของท่านจัดอยู่ในประเภท '${riceAnalysis.title}'`} />
                        <p className="ml-4">📊 ค่าความขาว: {whitenessValue.toFixed(1)}</p>
                        <p className="ml-4">🎯 การจำแนก: {riceAnalysis.title} - {classificationDetails || 'รอข้อมูลเพิ่มเติม'}</p>
                        <p className="ml-4">📈 แนวโน้ม: {trend || 'ไม่สามารถระบุได้'}</p>
                      </>
                    ) : (
                      <TypewriterReport key="no-device-selected" text="โปรดเลือกอุปกรณ์เพื่อรับฟังรายงานจากหลงจู๊" />
                    )}
                    <p className="italic text-chinese-green mt-2">"ข้าพเจ้าขอรับใช้ด้วยความเคารพ"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for the second column if needed */}
          <div></div>
        </div>



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

const Assistant = () => (
  <AssistantProvider>
    <AssistantContent />
  </AssistantProvider>
);

export default Assistant;