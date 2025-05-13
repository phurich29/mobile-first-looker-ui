
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RicePriceDocument } from "@/features/user-management/types";

export function useDocumentDelete(
  refetchDocs: () => void, 
  resetDocForm: () => void,
  setSelectedDocument: (doc: RicePriceDocument | null) => void,
  setIsDeleteDocDialogOpen: (open: boolean) => void
) {
  const { toast } = useToast();

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

  return { handleDeleteDocument };
}
