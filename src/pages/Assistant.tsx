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
              
              <div className="text-center p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl border-4 border-amber-800 shadow-lg">
                <img 
                  src="/lovable-uploads/fd764b37-53c9-4436-9555-35f3c0e80ce5.png" 
                  alt="นักปราชญ์" 
                  className="w-32 h-auto mx-auto rounded-lg shadow-md"
                />
                <h3 className="font-bold text-amber-900 mt-2">นักปราชญ์</h3>
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
            <Card className="relative border-4 border-amber-900 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 shadow-2xl h-full overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-amber-900"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-amber-900"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-amber-900"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-amber-900"></div>
              
              <CardHeader className="relative bg-gradient-to-r from-amber-800 to-amber-700 text-amber-50 rounded-none border-b-4 border-amber-900">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-transparent"></div>
                <CardTitle className="relative text-center text-xl font-bold flex items-center justify-center gap-2 text-shadow">
                  <Bot className="h-6 w-6" />
                  การจำแนกประเภทข้าว
                </CardTitle>
                {/* Decorative elements */}
                <div className="absolute top-2 left-4 w-4 h-4 border-2 border-amber-300 rotate-45 bg-amber-600"></div>
                <div className="absolute top-2 right-4 w-4 h-4 border-2 border-amber-300 rotate-45 bg-amber-600"></div>
              </CardHeader>
              <CardContent className="relative p-6 bg-gradient-to-b from-amber-50/50 to-yellow-50/50">
                <div className="space-y-4">
                  {/* Assistant Response */}
                  <DeviceDisplay />
                  
                  {/* Medieval-styled rice analysis panel */}
                  <div className="relative border-3 border-amber-800 rounded-lg p-4 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-inner">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-amber-900 text-lg">⚖️ ค่าความขาวปัจจุบัน:</span>
                      <span className="text-2xl font-bold text-amber-800 bg-amber-200 px-3 py-1 rounded border-2 border-amber-700">{whitenessValue.toFixed(1)}</span>
                    </div>
                    
                    <div className="relative text-center p-4 bg-gradient-to-br from-amber-200 to-yellow-200 rounded-lg border-2 border-amber-700 shadow-lg">
                      <div className="absolute top-1 left-1 w-3 h-3 bg-amber-600 rotate-45"></div>
                      <div className="absolute top-1 right-1 w-3 h-3 bg-amber-600 rotate-45"></div>
                      <div className="absolute bottom-1 left-1 w-3 h-3 bg-amber-600 rotate-45"></div>
                      <div className="absolute bottom-1 right-1 w-3 h-3 bg-amber-600 rotate-45"></div>
                      
                      <h3 className="text-2xl font-bold text-amber-900 mb-2 drop-shadow-md">⚱️ {riceAnalysis.title} ⚱️</h3>
                      <p className="text-amber-800 font-semibold">
                        {riceAnalysis.description}
                      </p>
                      {selectedDevice && confidence && valueRange && (
                        <div className="mt-3 text-sm text-amber-700 bg-amber-100 p-2 rounded border border-amber-600">
                          🎯 ความเชื่อมั่น: {confidence}% | 📏 ช่วงค่า: {valueRange}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medieval-styled AI Report scroll */}
                  <div className="relative bg-gradient-to-br from-yellow-100 to-amber-100 border-3 border-amber-800 rounded-lg p-4 shadow-lg">
                    {/* Scroll decorations */}
                    <div className="absolute -top-2 left-4 w-6 h-4 bg-amber-700 rounded-t-full border-2 border-amber-900"></div>
                    <div className="absolute -top-2 right-4 w-6 h-4 bg-amber-700 rounded-t-full border-2 border-amber-900"></div>
                    <div className="absolute -bottom-2 left-4 w-6 h-4 bg-amber-700 rounded-b-full border-2 border-amber-900"></div>
                    <div className="absolute -bottom-2 right-4 w-6 h-4 bg-amber-700 rounded-b-full border-2 border-amber-900"></div>
                    
                    <h4 className="font-bold text-amber-900 mb-3 text-lg border-b-2 border-amber-700 pb-2">📜 รายงานจากนักปราชญ์:</h4>
                    <div className="text-sm text-amber-900 space-y-2 bg-yellow-50/70 p-3 rounded border border-amber-600">
                      {selectedDevice ? (
                        <>
                          <div className="italic font-medium border-l-4 border-amber-600 pl-3">
                            <TypewriterReport key={longJooReport || 'default-report'} text={longJooReport || `เรียน ท่านผู้มีเกียรติ จากการตรวจสอบอย่างละเอียด ข้าวของท่านจัดอยู่ในประเภท '${riceAnalysis.title}'`} />
                          </div>
                          <div className="bg-amber-100 p-2 rounded border border-amber-500 space-y-1">
                            <p className="flex items-center gap-2"><span className="text-amber-700">⚖️</span> ค่าความขาว: <span className="font-bold">{whitenessValue.toFixed(1)}</span></p>
                            <p className="flex items-center gap-2"><span className="text-amber-700">🎯</span> การจำแนก: <span className="font-bold">{riceAnalysis.title}</span> - {classificationDetails || 'รอข้อมูลเพิ่มเติม'}</p>
                            <p className="flex items-center gap-2"><span className="text-amber-700">📈</span> แนวโน้ม: <span className="font-bold">{trend || 'ไม่สามารถระบุได้'}</span></p>
                          </div>
                        </>
                      ) : (
                        <div className="italic font-medium border-l-4 border-amber-600 pl-3">
                          <TypewriterReport key="no-device-selected" text="โปรดเลือกอุปกรณ์เพื่อรับฟังรายงานจากนักปราชญ์" />
                        </div>
                      )}
                      <p className="italic text-amber-700 mt-3 text-center font-semibold border-t border-amber-600 pt-2">"ข้าพเจ้าขอรับใช้ด้วยความเคารพ" 🙏</p>
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