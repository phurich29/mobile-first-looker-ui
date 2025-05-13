
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice } from "@/features/user-management/types";
import { PriceFormValues } from "../../types";

export function usePriceUpdate(
  refetchPrices: () => void, 
  resetPriceForm: () => void,
  setSelectedPrice: (price: RicePrice | null) => void,
  setIsEditDialogOpen: (open: boolean) => void
) {
  const { toast } = useToast();

  const handleUpdatePrice = async (priceFormValues: PriceFormValues, selectedPrice: RicePrice | null) => {
    if (!selectedPrice) return;
    
    try {
      console.log('Updating rice price with values:', priceFormValues);
      
      // Prepare data for update
      const updateData: any = {
        name: priceFormValues.name,
        document_date: priceFormValues.document_date
      };

      // Only update price if it's not empty
      if (priceFormValues.price && priceFormValues.price.trim() !== '') {
        const priceValue = parseFloat(priceFormValues.price);
        if (!isNaN(priceValue)) {
          updateData.price = priceValue;
        }
      } else {
        // If price is empty, set it to null
        updateData.price = null;
      }
      
      const { error } = await supabase
        .from('rice_prices')
        .update(updateData)
        .eq('id', selectedPrice.id);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast({
        title: "อัพเดทข้อมูลสำเร็จ",
        description: "อัพเดทข้อมูลราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetPriceForm();
      setSelectedPrice(null);
      setIsEditDialogOpen(false);
      refetchPrices();
    } catch (error: any) {
      console.error('Error in handleUpdatePrice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  return { handleUpdatePrice };
}
