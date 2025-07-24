import React from "react";
import { DeviceDisplay } from "@/features/assistant/components/DeviceDisplay";
import { useMemo, useState } from "react";
import { AssistantProvider, useAssistant } from "@/features/assistant/context/AssistantContext";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Bot, HelpCircle, Calculator } from "lucide-react";
import { isRecentUpdate } from "@/features/equipment/components/card/utils/timeUtils";
import { useTypewriter } from '@/hooks/useTypewriter';
import { calculateYieldInHaab } from "@/utils/calculations";
import { useTranslation } from "@/hooks/useTranslation";
const TypewriterReport = ({
  text
}: {
  text: string;
}) => {
  const displayedText = useTypewriter(text, 30);
  return <p>"{displayedText}"</p>;
};
const AssistantContent = () => {
  const { t } = useTranslation();
  const {
    selectedDevice
  } = useAssistant();
  const longJooPhrases = ["มีอะไรให้ลุงช่วยมั้ยหลาน", "ข้าวล็อตนี้ดูดีนะ... อยากรู้รายละเอียดเพิ่มมั้ย?", "กดดูรายงานสิ ลุงวิเคราะห์ไว้ให้หมดแล้ว", `ค่าความขาว ${selectedDevice?.deviceData?.whiteness?.toFixed(1) || '...'} ถือว่าใช้ได้เลย`, "อยากให้ลุงดูอะไรเป็นพิเศษ บอกได้เลยนะ"];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [wholeKernelsInput, setWholeKernelsInput] = useState('');
  const [headRiceInput, setHeadRiceInput] = useState('');
  
  const handleChatboxClick = () => {
    setPhraseIndex(prevIndex => (prevIndex + 1) % longJooPhrases.length);
  };

  const calculateResults = () => {
    const wholeKernels = parseFloat(wholeKernelsInput) || 0;
    const headRice = parseFloat(headRiceInput) || 0;
    const totalPercent = wholeKernels + headRice;

    // 1. Calculate Yield in kg
    const yieldKg = (totalPercent * 660) / 100;

    // 2. Calculate contamination (10% of yield in kg)
    const contamination = yieldKg * 0.1;

    // 3. Subtract contamination from yield
    const netYieldKg = yieldKg - contamination;

    // 4. Convert to Haab (1 Haab = 60 kg)
    const yieldHaab = netYieldKg / 60;

    return {
      totalPercent: totalPercent.toFixed(2),
      yieldHaab: yieldHaab.toFixed(2)
    };
  };

  // Main display values
  const whitenessValue = selectedDevice?.deviceData?.whiteness ?? 0;

  // Detailed report values
  const confidence = selectedDevice?.deviceData?.confidence;
  const valueRange = selectedDevice?.deviceData?.value_range;
  const longJooReport = selectedDevice?.deviceData?.long_joo_report;
  const whitenessClassification = selectedDevice?.deviceData?.whiteness_classification;
  const classificationDetails = selectedDevice?.deviceData?.classification_details;
  const trend = selectedDevice?.deviceData?.trend;
  const yieldInHaab = selectedDevice?.deviceData ? calculateYieldInHaab(selectedDevice.deviceData) : 0;
  const wholeKernelsValue = selectedDevice?.deviceData?.whole_kernels ?? 0;
  const headRiceValue = selectedDevice?.deviceData?.head_rice ?? 0;
  const isDeviceOnline = selectedDevice ? isRecentUpdate(selectedDevice.updated_at, selectedDevice.deviceData) : false;
  const riceAnalysis = useMemo(() => {
    if (!selectedDevice) {
      return {
        title: t('assistant', 'waitingAnalysis'),
        description: t('assistant', 'selectDevice')
      };
    }
    if (whitenessValue >= 40 && whitenessValue <= 45) {
      return {
        title: "ข้าวขาว",
        description: "ผลการตรวจสอบ: ข้าวของท่านจัดอยู่ในเกณฑ์คุณภาพข้าวขาว"
      };
    } else if (whitenessValue >= 25 && whitenessValue <= 30) {
      return {
        title: "ข้าวนึ่ง",
        description: "ผลการตรวจสอบ: ข้าวของท่านจัดอยู่ในเกณฑ์คุณภาพข้าวนึ่ง"
      };
    } else {
      return {
        title: "ไม่สามารถระบุประเภท",
        description: `ค่าความขาว ${whitenessValue.toFixed(1)} อยู่นอกเกณฑ์การจำแนกประเภทข้าว`
      };
    }
  }, [selectedDevice, whitenessValue]);
  return <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-chinese-cream via-background to-chinese-cream/30">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Status Indicators */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              
              <div className="flex justify-center">
                <img src="/lovable-uploads/d1e48214-f533-48ef-b56e-2d827e8773f9.png" alt="Scholar" className="mx-auto" />
              </div>
              
              <div className="relative text-left p-4 bg-gradient-to-br from-amber-800 via-amber-900 to-black rounded-xl border-2 border-amber-700 shadow-lg text-white cursor-pointer group" onClick={handleChatboxClick}>
                <div className="absolute -top-3 left-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-[12px] border-b-amber-800"></div>
                <div className="flex items-start gap-4">
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-300">หลงจู๊</h3>
                    <p className="text-amber-50 italic">"{longJooPhrases[phraseIndex]}"</p>
                  </div>
                </div>
                <span className="absolute bottom-2 right-3 text-xs text-amber-400/50 group-hover:text-amber-400 transition-colors">- คลิกเพื่อคุยต่อ -</span>
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
                  {t('assistant', 'riceClassification')}
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
                      <span className="font-bold text-amber-900 text-lg">⚖️ {t('assistant', 'currentWhiteness')}:</span>
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
                      {selectedDevice && confidence && valueRange && <div className="mt-3 text-sm text-amber-700 bg-amber-100 p-2 rounded border border-amber-600">
                          🎯 ความเชื่อมั่น: {confidence}% | 📏 ช่วงค่า: {valueRange}
                        </div>}
                    </div>
                  </div>

                  {/* Medieval-styled AI Report scroll */}
                  <div className="relative bg-gradient-to-br from-yellow-100 to-amber-100 border-3 border-amber-800 rounded-lg p-4 shadow-lg">
                    {/* Scroll decorations */}
                    <div className="absolute -top-2 left-4 w-6 h-4 bg-amber-700 rounded-t-full border-2 border-amber-900"></div>
                    <div className="absolute -top-2 right-4 w-6 h-4 bg-amber-700 rounded-t-full border-2 border-amber-900"></div>
                    <div className="absolute -bottom-2 left-4 w-6 h-4 bg-amber-700 rounded-b-full border-2 border-amber-900"></div>
                    <div className="absolute -bottom-2 right-4 w-6 h-4 bg-amber-700 rounded-b-full border-2 border-amber-900"></div>
                    
                    <h4 className="font-bold text-amber-900 mb-3 text-lg border-b-2 border-amber-700 pb-2">📜 {t('assistant', 'scholarReport')}:</h4>
                    <div className="text-sm text-amber-900 space-y-2 bg-yellow-50/70 p-3 rounded border border-amber-600">
                      {selectedDevice ? <>
                          <div className="italic font-medium border-l-4 border-amber-600 pl-3">
                            <TypewriterReport key={longJooReport || 'default-report'} text={longJooReport || `เรียน ท่านผู้มีเกียรติ จากการตรวจสอบอย่างละเอียด ข้าวของท่านจัดอยู่ในประเภท '${riceAnalysis.title}'`} />
                          </div>
                          <div className="bg-amber-100 p-2 rounded border border-amber-500 space-y-1">
                            <p className="flex items-center gap-2"><span className="text-amber-700">⚖️</span> {t('assistant', 'currentWhiteness')}: <span className="font-bold">{whitenessValue.toFixed(1)}</span></p>
                            <p className="flex items-center gap-2"><span className="text-amber-700">🎯</span> {t('assistant', 'classification')}: <span className="font-bold">{riceAnalysis.title}</span> - {classificationDetails || t('assistant', 'waitingMoreData')}</p>
                            <p className="flex items-center gap-2"><span className="text-amber-700">📈</span> {t('assistant', 'trend')}: <span className="font-bold">{trend || t('assistant', 'cannotIdentify')}</span></p>
                          </div>
                        </> : <div className="italic font-medium border-l-4 border-amber-600 pl-3">
                          <TypewriterReport key="no-device-selected" text="โปรดเลือกอุปกรณ์เพื่อรับฟังรายงานจากนักปราชญ์" />
                        </div>}
                      <p className="italic text-amber-700 mt-3 text-center font-semibold border-t border-amber-600 pt-2">"{t('assistant', 'respectfullyServe')}" 🙏</p>
                    </div>
                  </div>

                  {/* Combined Percentage Display */}
                  <div className="relative border-3 border-amber-800 rounded-lg p-3 sm:p-4 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-inner">
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <h4 className="font-bold text-amber-900 text-sm sm:text-base lg:text-lg flex-shrink-0">%ข้าวต้น + %เต็มเมล็ด =</h4>
                        {selectedDevice && (
                          <p className="text-xs text-amber-800/80 mt-1">
                            (%ข้าวต้น: {headRiceValue.toFixed(2)}% + %เต็มเมล็ด: {wholeKernelsValue.toFixed(2)}%)
                          </p>
                        )}
                      </div>
                      <span className="text-lg sm:text-xl lg:text-3xl font-bold text-amber-800 bg-amber-200 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg border-2 border-amber-700 shadow-inner flex-shrink-0">
                        {selectedDevice ? `${(wholeKernelsValue + headRiceValue).toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Yield Percentage Display */}
                  <div className="relative border-3 border-amber-800 rounded-lg p-3 sm:p-4 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-inner">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="font-bold text-amber-900 text-sm sm:text-base lg:text-lg flex-shrink-0">🌾 ผลผลิต (หาบ):</h4>
                      <span className="text-lg sm:text-xl lg:text-3xl font-bold text-amber-800 bg-amber-200 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg border-2 border-amber-700 shadow-inner flex-shrink-0">
                        {selectedDevice ? `${yieldInHaab.toFixed(2)} หาบ` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Smart Calculator Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-start-3 lg:col-span-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold py-3 px-6 rounded-lg border-2 border-amber-900 shadow-[0_4px_#78350f] hover:-translate-y-0.5 hover:shadow-[0_6px_#78350f] active:translate-y-0.5 active:shadow-none transition-all duration-150">
                    <Calculator className="w-5 h-5 mr-2" />
                    หลงจู๊ Calculator
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-800">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold text-amber-900 flex items-center justify-center gap-2">
                      <Calculator className="w-6 h-6" />
                      เครื่องคำนวณอัจฉริยะ
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="wholeKernels" className="text-amber-900 font-bold">%ข้าวเต็มเมล็ด</Label>
                      <Input
                        id="wholeKernels"
                        type="number"
                        placeholder="ใส่เปอร์เซ็นต์ข้าวเต็มเมล็ด"
                        value={wholeKernelsInput}
                        onChange={(e) => setWholeKernelsInput(e.target.value)}
                        className="border-2 border-amber-600 focus:border-amber-800 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headRice" className="text-amber-900 font-bold">%ต้นข้าว</Label>
                      <Input
                        id="headRice"
                        type="number"
                        placeholder="ใส่เปอร์เซ็นต์ข้าวต้น"
                        value={headRiceInput}
                        onChange={(e) => setHeadRiceInput(e.target.value)}
                        className="border-2 border-amber-600 focus:border-amber-800 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>
                    
                    {(wholeKernelsInput || headRiceInput) && (
                      <div className="mt-6 space-y-4 p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg border-2 border-amber-700">
                        <h3 className="text-lg font-bold text-amber-900 text-center">📊 ผลการคำนวณ</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-amber-200 rounded border border-amber-600">
                            <span className="font-bold text-amber-900">%ข้าวต้น+%เต็มเมล็ด =</span>
                            <span className="text-lg font-bold text-amber-800">{calculateResults().totalPercent}%</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-2 bg-amber-200 rounded border border-amber-600">
                            <span className="font-bold text-amber-900">ผลหาบ:</span>
                            <span className="text-lg font-bold text-amber-800">{calculateResults().yieldHaab} หาบ</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-start-3 lg:col-span-3">
              <div className="relative border-3 border-amber-800 rounded-lg p-4 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-inner">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
                <div className="absolute top-1 left-1 w-3 h-3 bg-amber-600 rotate-45"></div>
                <div className="absolute top-1 right-1 w-3 h-3 bg-amber-600 rotate-45"></div>
                <div className="absolute bottom-1 left-1 w-3 h-3 bg-amber-600 rotate-45"></div>
                <div className="absolute bottom-1 right-1 w-3 h-3 bg-amber-600 rotate-45"></div>
                
                <h4 className="font-bold text-amber-900 mb-3 text-lg">📝 หมายเหตุ</h4>
                <div className="text-sm text-amber-900 space-y-2 bg-yellow-50/70 p-3 rounded border border-amber-600">
                  <p className="leading-relaxed">
                    *%ข้าวต้น คิดจากข้าวเต็ม+ข้าวต้นหลังจากการขัดขาว/ขัดมัน ที่ยังไม่ได้หักข้าวดีดออกจาการยิงสี
                  </p>
                  <p className="leading-relaxed">
                    ** การคำนวณหาบ คิดจากการหักข้าวดีดออกจากการยิงสี 10% ของข้าวต้นแล้ว
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>;
};
const Assistant = () => <AssistantProvider>
    <AssistantContent />
  </AssistantProvider>;
export default Assistant;