
import React from "react";

type WatchlistItemProps = {
  symbol: string;
  name: string;
  price: string;
  percentageChange: number;
  iconColor: string;
};

export const WatchlistItem: React.FC<WatchlistItemProps> = ({
  symbol,
  name,
  price,
  percentageChange,
  iconColor,
}) => {
  const isPositive = percentageChange >= 0;
  
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100">
      <div className="flex items-center">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`}
          style={{ backgroundColor: iconColor }}
        >
          <span className="text-white font-bold">{symbol[0]}</span>
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="font-bold mr-2">{symbol}</h3>
            <span className="text-xs text-gray-500">{name}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">${price}</p>
        <p className={`text-xs font-medium ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
          {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};
