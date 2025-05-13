
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { PriceFormValues, DocumentFormValues } from "../types";

export function usePriceOperations(
  refetchPrices: () => void,
  refetchDocs: () => void,
  resetPriceForm: () => void,
  resetDocForm: () => void,
  setSelectedPrice: (price: RicePrice | null) => void,
  setSelectedDocument: (doc: RicePriceDocument | null) => void,
  setIsEditDialogOpen: (open: boolean) => void,
  setIsDeleteDialogOpen: (open: boolean) => void,
  setIsAddDocDialogOpen: (open: boolean) => void,
  setIsDeleteDocDialogOpen: (open: boolean) => void
) {
  const { toast } = useToast();

  // Add new rice price
  const handleAddPrice = async (priceFormValues: PriceFormValues) => {
    try {
      console.log('Adding new rice price with values:', priceFormValues);
      
      // Prepare data for insertion
      const newRicePrice: Record<string, any> = {
        name: priceFormValues.name,
        category: 'general', // Default category
        document_date: priceFormValues.document_date,
        priceColor: priceFormValues.priceColor
      };

      // Only add price if it's not empty
      if (priceFormValues.price && priceFormValues.price.trim() !== '') {
        const priceValue = parseFloat(priceFormValues.price);
        if (!isNaN(priceValue)) {
          newRicePrice.price = priceValue;
        }
      } else {
        // If price is empty, set it to null
        newRicePrice.price = null;
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

  // Add new rice price document
  const handleAddDocument = async (docFormValues: DocumentFormValues) => {
    try {
      console.log('Adding new rice price document with values:', docFormValues);
      
      const { error } = await supabase
        .from('rice_price_documents')
        .insert({
          document_date: docFormValues.document_date,
          file_url: docFormValues.file_url
        });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast({
        title: "เพิ่มเอกสารสำเร็จ",
        description: "เพิ่มเอกสารราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetDocForm();
      setIsAddDocDialogOpen(false);
      refetchDocs();
    } catch (error: any) {
      console.error('Error in handleAddDocument:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มเอกสารได้",
        variant: "destructive",
      });
    }
  };

  // Update existing rice price
  const handleUpdatePrice = async (priceFormValues: PriceFormValues, selectedPrice: RicePrice | null) => {
    if (!selectedPrice) return;
    
    try {
      console.log('Updating rice price with values:', priceFormValues);
      
      // Prepare data for update
      const updateData: Record<string, any> = {
        name: priceFormValues.name,
        document_date: priceFormValues.document_date,
        priceColor: priceFormValues.priceColor
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

  // Delete rice price
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

  // Delete rice price document
  const handleDeleteDocument = async (selectedDocument: RicePriceDocument | null) => {
    if (!selectedDocument) return;
    
    try {
      console.log('Deleting rice price document:', selectedDocument);
      
      const { error } = await supabase
        .from('rice_price_documents')
        .delete()
        .eq('id', selectedDocument.id);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast({
        title: "ลบเอกสารสำเร็จ",
        description: "ลบเอกสารราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetDocForm();
      setSelectedDocument(null);
      setIsDeleteDocDialogOpen(false);
      refetchDocs();
    } catch (error: any) {
      console.error('Error in handleDeleteDocument:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบเอกสารได้",
        variant: "destructive",
      });
    }
  };

  return {
    handleAddPrice,
    handleAddDocument,
    handleUpdatePrice,
    handleDeletePrice,
    handleDeleteDocument
  };
}
