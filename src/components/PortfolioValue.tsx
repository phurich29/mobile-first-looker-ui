
import React from "react";

type PortfolioValueProps = {
  value: string;
  percentageChange: number;
};

export const PortfolioValue: React.FC<PortfolioValueProps> = ({ value, percentageChange }) => {
  const isPositive = percentageChange >= 0;
  
  return (
    <div className="bg-crypto-c2etech rounded-xl p-5 text-white mb-6 mx-4">
      <p className="text-sm opacity-90 mb-1">Total Portfolio Value</p>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">${value}</h2>
        <div className={`rounded-full px-3 py-1 text-sm ${isPositive ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
          {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};
