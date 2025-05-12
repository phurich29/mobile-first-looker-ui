import { Header } from "@/components/Header";
import { AssetCard } from "@/components/AssetCard";
import { WatchlistItem } from "@/components/WatchlistItem";
import { SectionHeader } from "@/components/SectionHeader";
import { NewsCarousel } from "@/components/NewsCarousel";

const Index = () => {
  // Sample data for assets
  const assets = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      value: "26.46",
      amount: "0.0012",
      percentageChange: 15.3,
      iconColor: "#F7931A",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      value: "37.30",
      amount: "0.009",
      percentageChange: 10.8,
      iconColor: "#627EEA",
    },
  ];

  // Rice price updates data
  const ricePriceUpdates = [
    {
      symbol: "ข้าวหอมมะลิ",
      name: "Premium Grade",
      price: "18,500",
      percentageChange: 2.3,
      iconColor: "#69A47A",
    },
    {
      symbol: "ข้าวขาว 5%",
      name: "White Rice",
      price: "11,800",
      percentageChange: -1.5,
      iconColor: "#A8C9B3",
    },
    {
      symbol: "ข้าวเหนียว",
      name: "Glutinous Rice",
      price: "14,250",
      percentageChange: 0.8,
      iconColor: "#1e6146",
    },
  ];

  const handleSeeAll = () => {
    console.log("See all assets clicked");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 pb-16">
        <div className="mt-4">
          <NewsCarousel />
          
          <SectionHeader title="Your Assets" actionText="See All" onAction={handleSeeAll} />
          <div className="grid grid-cols-2 gap-3 px-4 mb-6">
            {assets.map((asset) => (
              <AssetCard
                key={asset.symbol}
                symbol={asset.symbol}
                name={asset.name}
                value={asset.value}
                amount={asset.amount}
                percentageChange={asset.percentageChange}
                iconColor={asset.iconColor}
              />
            ))}
          </div>

          <SectionHeader title="ราคาข้าวจากสมาคมโรงสี" />
          <div className="bg-white rounded-xl mx-4 overflow-hidden">
            {ricePriceUpdates.map((item) => (
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
        </div>
      </main>

      {/* Simple navigation bar at bottom */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3">
        <button className="p-2">
          {/* Home icon - filled black to indicate current page */}
          <div className="w-6 h-1 bg-black mx-auto mt-1"></div>
        </button>
        <button className="p-2">
          {/* Circle button - just showing middle dot */}
          <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto"></div>
        </button>
        <button className="p-2">
          {/* Menu button - showing 3 lines */}
          <div className="w-6 h-1 bg-gray-400 mx-auto mb-1"></div>
        </button>
      </nav>
    </div>
  );
};

export default Index;
