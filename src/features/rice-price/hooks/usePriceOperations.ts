
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { usePriceAdd } from "./operations/usePriceAdd";
import { useDocumentAdd } from "./operations/useDocumentAdd";
import { usePriceUpdate } from "./operations/usePriceUpdate";
import { usePriceDelete } from "./operations/usePriceDelete";
import { useDocumentDelete } from "./operations/useDocumentDelete";

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
  // Import individual operation hooks
  const { handleAddPrice } = usePriceAdd(
    refetchPrices,
    resetPriceForm
  );
  
  const { handleAddDocument } = useDocumentAdd(
    refetchDocs,
    resetDocForm,
    setIsAddDocDialogOpen
  );
  
  const { handleUpdatePrice } = usePriceUpdate(
    refetchPrices,
    resetPriceForm,
    setSelectedPrice,
    setIsEditDialogOpen
  );
  
  const { handleDeletePrice } = usePriceDelete(
    refetchPrices,
    resetPriceForm,
    setSelectedPrice,
    setIsDeleteDialogOpen
  );
  
  const { handleDeleteDocument } = useDocumentDelete(
    refetchDocs,
    resetDocForm,
    setSelectedDocument,
    setIsDeleteDocDialogOpen
  );

  // Return all operations as a unified API
  return {
    handleAddPrice,
    handleAddDocument,
    handleUpdatePrice,
    handleDeletePrice,
    handleDeleteDocument
  };
}
