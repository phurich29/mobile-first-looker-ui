
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
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border-l-4" style={{ borderLeftColor: iconColor }}>
      <div className="flex flex-col">
        <h3 className="font-bold text-base text-gray-800 mb-2 truncate">{symbol}</h3>
        <div className="flex justify-between items-center">
          <p className="font-medium text-crypto-c2etech text-right">{value} {amount.split('/')[0]}</p>
        </div>
      </div>
    </div>
  );
};
