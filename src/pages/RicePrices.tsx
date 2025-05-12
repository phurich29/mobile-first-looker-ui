
import { Header } from "@/components/Header";
import { RicePriceTable } from "@/components/RicePriceTable";

export default function RicePrices() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">ราคาข้าว สมาคมโรงสีข้าวไทย</h1>
        <div className="mt-4">
          <RicePriceTable />
        </div>
      </main>
    </div>
  );
}
