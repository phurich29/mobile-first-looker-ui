
import React from "react";
import { MeasurementItem } from "@/components/MeasurementItem";
import { useAuth } from "@/components/AuthProvider";

export const WatchlistSection = () => {
  // ตรวจสอบสถานะการเข้าสู่ระบบ
  const { user } = useAuth();

  // ข้อมูลตัวอย่างเกี่ยวกับชั้นคุณภาพข้าวและความขาว
  const currentDate = new Date();
  const bangkokDate = new Date(currentDate.getTime() + 7 * 60 * 60 * 1000); // +7 ชั่วโมง
  
  const riceGrades = [
    {
      symbol: "class1",
      name: "ชั้น 1 (>7.0mm)",
      price: "88.6",
      percentageChange: 0, // ไม่แสดงการเปลี่ยนแปลง
      iconColor: "#f59e0b", // สีส้ม
      updatedAt: bangkokDate
    },
    {
      symbol: "class2",
      name: "ชั้น 2 (>6.6-7.0mm)",
      price: "8.1",
      percentageChange: 0,
      iconColor: "#6366f1", // สีม่วงอ่อน
      updatedAt: bangkokDate
    },
    {
      symbol: "class3",
      name: "ชั้น 3 (>6.2-6.6mm)",
      price: "2.7",
      percentageChange: 0,
      iconColor: "#f5d90a", // สีเหลือง
      updatedAt: bangkokDate
    },
    {
      symbol: "whiteness",
      name: "ความขาว",
      price: "42.3",
      percentageChange: 0,
      iconColor: "#7c3aed", // สีม่วง
      updatedAt: bangkokDate
    }
  ];

  return (
    <>
      <div className="px-[5%] mb-3 flex justify-between items-center" style={{ width: '100%', boxSizing: 'border-box' }}>
        <h2 className="font-semibold text-gray-700">{
          user ? "รายการที่ติดตาม" : "ตัวอย่างข้อมูล"
        }</h2>
        <a href="/measurements" className="text-sm text-green-600 font-medium">ดูทั้งหมด</a>
      </div>

      <div className="bg-white">
        {riceGrades.map((item) => (
          <MeasurementItem
            key={item.symbol}
            symbol={item.symbol}
            name={item.name}
            price={item.price}
            percentageChange={item.percentageChange}
            iconColor={item.iconColor}
            updatedAt={item.updatedAt}
          />
        ))}
      </div>
    </>
  );
};
