
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentFormValues } from "../../types";

export function useDocumentAdd(
  refetchDocs: () => void, 
  resetDocForm: () => void, 
  setIsAddDocDialogOpen: (open: boolean) => void
) {
  const { toast } = useToast();

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

  return { handleAddDocument };
}
