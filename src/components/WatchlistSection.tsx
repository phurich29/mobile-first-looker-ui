
import React from "react";
import { WatchlistItem } from "@/components/WatchlistItem";

interface WatchlistItemType {
  symbol: string;
  name: string;
  price: string;
  percentageChange: number;
  iconColor: string;
}

export const WatchlistSection = () => {
  // Sample data for watchlist
  const watchlist = [
    {
      symbol: "BTC/BUSD",
      name: "Bitcoin",
      price: "54,382.64",
      percentageChange: 15.3,
      iconColor: "#F7931A",
    },
    {
      symbol: "ETH/BUSD",
      name: "Ethereum",
      price: "4,145.61",
      percentageChange: -2.21,
      iconColor: "#627EEA",
    },
    {
      symbol: "ADA/BUSD",
      name: "Cardano",
      price: "1.21",
      percentageChange: 1.8,
      iconColor: "#8A33AE",
    },
  ];

  return (
    <>
      <div className="px-4 mb-3 flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">รายการที่ติดตาม</h2>
      </div>
      <div className="bg-white rounded-xl mx-4 overflow-hidden shadow-md border border-gray-100 mb-8">
        {watchlist.map((item) => (
          <WatchlistItem
            key={item.symbol}
            symbol={item.symbol}
            name={item.name}
            price={item.price}
            percentageChange={item.percentageChange}
            iconColor={item.iconColor}
          />
        ))}
      </div>
    </>
  );
};
