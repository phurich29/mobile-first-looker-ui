
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice } from "@/features/user-management/types";

export function usePriceDelete(
  refetchPrices: () => void, 
  resetPriceForm: () => void,
  setSelectedPrice: (price: RicePrice | null) => void,
  setIsDeleteDialogOpen: (open: boolean) => void
) {
  const { toast } = useToast();

  const handleDeletePrice = async (selectedPrice: RicePrice | null) => {
    if (!selectedPrice) return;
    
    try {
      console.log('Deleting rice price:', selectedPrice);
      
      const { error } = await supabase
        .from('rice_prices')
        .delete()
        .eq('id', selectedPrice.id);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast({
        title: "ลบข้อมูลสำเร็จ",
        description: "ลบข้อมูลราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetPriceForm();
      setSelectedPrice(null);
      setIsDeleteDialogOpen(false);
      refetchPrices();
    } catch (error: any) {
      console.error('Error in handleDeletePrice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  return { handleDeletePrice };
}
