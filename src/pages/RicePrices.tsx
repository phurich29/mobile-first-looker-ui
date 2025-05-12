
import { Header } from "@/components/Header";

const RicePrices = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className="flex-1 pb-28 px-4 pt-6">
        <h1 className="text-2xl font-semibold text-gray-700 mb-6">ราคาข้าว</h1>
        {/* Content will be added here in future updates */}
      </main>

      {/* Navigation bar at bottom */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around py-4 shadow-xl rounded-t-3xl backdrop-blur-sm bg-white/90" style={{ maxHeight: '80px' }}>
        <button className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Home</span>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-6 h-1 bg-emerald-600 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-emerald-600 font-medium">Market</span>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default RicePrices;
