
interface PriceTableErrorProps {
  error: Error;
}

export function PriceTableError({ error }: PriceTableErrorProps) {
  return (
    <div className="text-center py-8">
      <p className="text-red-500 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
      <p className="text-gray-500 text-sm">{error.message}</p>
    </div>
  );
}
