
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
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex flex-col">
        <h3 className="font-bold text-base mb-1">{symbol}</h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">{name}</p>
          <p className="font-bold text-right">{value} {amount.split('/')[0]}</p>
        </div>
      </div>
    </div>
  );
};
