
import { Header } from "@/components/Header";
import { RicePriceTable } from "@/components/RicePriceTable";

export default function RicePrices() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-28">
        <h1 className="text-2xl font-bold mb-4">ราคาข้าว สมาคมโรงสีข้าวไทย</h1>
        <div className="mt-4">
          <RicePriceTable />
        </div>
      </main>

      {/* Navigation bar */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around py-4 shadow-xl rounded-t-3xl backdrop-blur-sm bg-white/90" style={{ maxHeight: '80px' }}>
        <a href="/" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Home</span>
        </a>
        <a href="/market" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Market</span>
        </a>
        <a href="/measurements" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">รายการวัด</span>
        </a>
        <a href="/profile" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Profile</span>
        </a>
      </nav>
    </div>
  );
}
