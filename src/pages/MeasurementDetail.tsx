
import React from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMeasurementThaiName } from "@/utils/measurements";

export default function MeasurementDetail() {
  const { measurementSymbol } = useParams<{ measurementSymbol: string }>();
  const measurementName = getMeasurementThaiName(measurementSymbol || "");

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-32">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost" 
            size="icon"
            asChild
            className="mr-2 text-emerald-600"
          >
            <Link to="/new-quality-measurements">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-emerald-800">{measurementName || measurementSymbol}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-center text-gray-500">หน้านี้อยู่ระหว่างการพัฒนา</p>
            <p className="text-center text-gray-500 mt-2">จะแสดงค่า {measurementName || measurementSymbol} ในทุกอุปกรณ์</p>
          </div>
        </div>
      </main>

      {/* Add space to prevent content from being hidden behind footer */}
      <div className="pb-32"></div>

      {/* Footer navigation */}
      <FooterNav />
    </div>
  );
}
