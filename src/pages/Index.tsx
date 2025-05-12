
import { Header } from "@/components/Header";
import { AssetCard } from "@/components/AssetCard";
import { WatchlistItem } from "@/components/WatchlistItem";
import { SectionHeader } from "@/components/SectionHeader";
import { NewsCarousel } from "@/components/NewsCarousel";

const Index = () => {
  // Sample data for rice prices
  const riceUpdates = [
    {
      symbol: "ข้าวหอมมะลิ 100% ชั้น 2(66/67)",
      name: "",
      value: "3,700 - 3,850",
      amount: "บาท/100ก.ก.",
      percentageChange: 0,
      iconColor: "#8A33AE",
    },
    {
      symbol: "ข้าวหอมมะลิ 100% ชั้น 2(67/68)",
      name: "",
      value: "3,000 - 3,166",
      amount: "บาท/100ก.ก.",
      percentageChange: 0,
      iconColor: "#F7931A",
    },
    {
      symbol: "ปลายข้าวหอมมะลิ (67/68)",
      name: "",
      value: "1,300 - 1,320",
      amount: "บาท/100ก.ก.",
      percentageChange: 0,
      iconColor: "#627EEA",
    },
    {
      symbol: "ข้าวหอมมะลิจังหวัด(66/67)",
      name: "",
      value: "3,650 - 3,700",
      amount: "บาท/100ก.ก.",
      percentageChange: 0,
      iconColor: "#8A33AE",
    },
  ];

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

  const handleSeeAll = () => {
    console.log("See all rice prices clicked");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 pb-16">
        <div className="mt-4">
          <NewsCarousel />
          
          <SectionHeader title="ราคาข้าวจากสมาคมโรงสี" actionText="ดูทั้งหมด" onAction={handleSeeAll} />
          <div className="grid grid-cols-2 gap-3 px-4 mb-6">
            {riceUpdates.map((rice) => (
              <AssetCard
                key={rice.symbol}
                symbol={rice.symbol}
                name={rice.name}
                value={rice.value}
                amount={rice.amount}
                percentageChange={rice.percentageChange}
                iconColor={rice.iconColor}
              />
            ))}
          </div>

          <SectionHeader title="Watchlist" />
          <div className="bg-white rounded-xl mx-4 overflow-hidden">
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
