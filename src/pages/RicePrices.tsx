
import { Header } from "@/components/Header";
import { RicePriceTable } from "@/components/RicePriceTable";
import { useIsMobile } from "@/hooks/use-mobile";
import { FooterNav } from "@/components/FooterNav";

export default function RicePrices() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-28">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-4 text-emerald-800`}>
          ราคาข้าว สมาคมโรงสีข้าวไทย
        </h1>
        <div className="mt-4">
          <RicePriceTable />
        </div>
      </main>

      <FooterNav />
    </div>
  );
}
