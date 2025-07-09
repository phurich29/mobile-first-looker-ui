import React from "react";
import { DeviceDisplay } from "@/features/assistant/components/DeviceDisplay";
import { useMemo } from "react";
import { AssistantProvider, useAssistant } from "@/features/assistant/context/AssistantContext";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bot, HelpCircle } from "lucide-react";
import { isRecentUpdate } from "@/features/equipment/components/card/utils/timeUtils";
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

  const isDeviceOnline = selectedDevice ? isRecentUpdate(selectedDevice.updated_at, selectedDevice.deviceData) : false;

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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Status Indicators */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-chinese-gold to-chinese-gold/70 rounded-xl border-2 border-chinese-gold shadow-lg">
                <div className="text-3xl mb-2">🖥️</div>
                <h3 className="font-bold text-chinese-dark truncate">
                  {selectedDevice ? selectedDevice.display_name : 'ยังไม่ได้เลือกอุปกรณ์'}
                </h3>
                <p className={`text-2xl font-bold ${isDeviceOnline ? 'text-green-500' : 'text-red-500'}`}>
                  {isDeviceOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-chinese-jade to-chinese-jade/70 rounded-xl border-2 border-chinese-jade shadow-lg">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-bold text-white">จำนวนเมล็ด</h3>
                <p className="text-2xl font-bold text-chinese-cream">
                  {selectedDevice?.deviceData?.output?.toLocaleString() || 'N/A'}
                </p>
              </div>
              
              <div className="text-left p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-700 shadow-lg text-white">
                <h3 className="font-bold text-white mb-2 text-center">พื้นข้าวเต็มเมล็ด</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-semibold col-span-2">ชั้น 1 (&gt;7.0mm):</div>
                  <div className="text-right">{selectedDevice?.deviceData?.class1?.toFixed(2) || 'N/A'}%</div>
                  
                  <div className="font-semibold col-span-2">ชั้น 2 (&gt;6.6-7.0mm):</div>
                  <div className="text-right">{selectedDevice?.deviceData?.class2?.toFixed(2) || 'N/A'}%</div>
                  
                  <div className="font-semibold col-span-2">ชั้น 3 (&gt;6.2-6.6mm):</div>
                  <div className="text-right">{selectedDevice?.deviceData?.class3?.toFixed(2) || 'N/A'}%</div>
                  
                  <div className="font-semibold col-span-2">เมล็ดสั้น (≤6.2mm):</div>
                  <div className="text-right">{selectedDevice?.deviceData?.short_grain?.toFixed(2) || 'N/A'}%</div>

                  <div className="font-semibold col-span-2">ข้าวลีบ:</div>
                  <div className="text-right">{selectedDevice?.deviceData?.imperfection_rate?.toFixed(2) || 'N/A'}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Rice Classification Dashboard */}
          <div className="lg:col-span-3">
            <Card className="border-2 border-chinese-jade bg-gradient-to-br from-chinese-cream to-white shadow-xl h-full">
              <CardHeader className="bg-gradient-to-r from-chinese-jade to-chinese-green text-white rounded-t-lg">
                <CardTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
                  <Bot className="h-6 w-6" />
                  การจำแนกประเภทข้าว
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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