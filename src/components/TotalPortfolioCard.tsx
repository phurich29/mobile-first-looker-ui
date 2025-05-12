import React from 'react';
import { ArrowUp } from 'lucide-react';

type TotalPortfolioCardProps = {
  value: string;
  percentageChange: number;
};

export const TotalPortfolioCard = ({ value, percentageChange }: TotalPortfolioCardProps) => {
  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-4 p-5 shadow-xl mb-6 text-white relative overflow-hidden">
      {/* เพิ่มองค์ประกอบเพื่อความมีมิติ */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full bg-green-400/30"></div>
      
      <div className="relative z-10">
        <p className="text-sm font-medium mb-2 opacity-90">Total Portfolio Value</p>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold drop-shadow-md">${value}</h2>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center shadow-lg border border-white/30">
            <ArrowUp className="h-4 w-4 mr-1.5" />
            <span className="font-medium text-sm">{percentageChange}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
