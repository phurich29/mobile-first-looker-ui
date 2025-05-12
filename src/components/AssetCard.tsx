
import React from "react";

type AssetCardProps = {
  symbol: string;
  name: string;
  value: string;
  amount: string;
  percentageChange: number;
  iconColor: string;
};

export const AssetCard: React.FC<AssetCardProps> = ({
  symbol,
  name,
  value,
  amount,
  percentageChange,
  iconColor,
}) => {
  const isPositive = percentageChange >= 0;
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2`}
            style={{ backgroundColor: iconColor }}
          >
            <span className="text-white font-bold">{symbol[0]}</span>
          </div>
          <div>
            <h3 className="font-bold">{symbol}</h3>
            <p className="text-xs text-gray-500">{name}</p>
          </div>
        </div>
        <div className={`text-xs font-medium ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
          {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
        </div>
      </div>
      <p className="text-xs text-gray-500">Portfolio Value</p>
      <div className="flex justify-between items-center">
        <p className="font-bold">${value}</p>
        <p className="text-xs text-gray-500">{amount} {symbol}</p>
      </div>
    </div>
  );
};
