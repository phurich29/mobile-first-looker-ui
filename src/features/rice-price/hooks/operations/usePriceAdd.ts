
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PriceFormValues } from "../../types";

export function usePriceAdd(refetchPrices: () => void, resetPriceForm: () => void) {
  const { toast } = useToast();

  const handleAddPrice = async (priceFormValues: PriceFormValues) => {
    try {
      console.log('Adding new rice price with values:', priceFormValues);
      
      // Prepare data for insertion
      const newRicePrice: any = {
        name: priceFormValues.name,
        category: 'general', // Default category
        document_date: priceFormValues.document_date
      };

      // Handle price field - it can now be any text
      if (priceFormValues.price && priceFormValues.price.trim() !== '') {
        // Store price as text directly - no conversion needed anymore
        newRicePrice.price = priceFormValues.price.trim();
      } else {
        // If price is empty, set it to null
        newRicePrice.price = null;
      }
      
      // Store price color if provided
      if (priceFormValues.priceColor) {
        newRicePrice.priceColor = priceFormValues.priceColor;
      }
      
      console.log('Sending data to Supabase:', newRicePrice);
      
      const { data, error } = await supabase
        .from('rice_prices')
        .insert(newRicePrice)
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Successfully added rice price, response:', data);
      
      toast({
        title: "เพิ่มข้อมูลสำเร็จ",
        description: "เพิ่มข้อมูลราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetPriceForm();
      refetchPrices();
    } catch (error: any) {
      console.error('Error in handleAddPrice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  return { handleAddPrice };
}
