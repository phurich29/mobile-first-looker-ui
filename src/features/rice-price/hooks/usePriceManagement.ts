
import { useDialogState } from "./dialog/useDialogState";
import { usePriceFormState } from "./form/usePriceFormState";
import { usePriceData } from "./data/usePriceData";
import { usePriceOperations } from "./usePriceOperations";
import { formatThaiDate } from "../utils";

export function usePriceManagement() {
  // Combine smaller hooks to create the complete functionality
  const {
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedPrice,
    setSelectedPrice,
    isAddDocDialogOpen,
    setIsAddDocDialogOpen,
    isDeleteDocDialogOpen,
    setIsDeleteDocDialogOpen,
    selectedDocument,
    setSelectedDocument,
    openEditDialog: baseOpenEditDialog,
    openDeleteDialog,
    openDeleteDocDialog
  } = useDialogState();

  const {
    priceFormValues,
    docFormValues,
    handlePriceFormChange,
    handleDocFormChange,
    resetPriceForm,
    resetDocForm,
    setPriceFormValues
  } = usePriceFormState();

  const {
    ricePrices,
    ricePriceDocuments,
    isPricesLoading,
    isDocsLoading,
    pricesError,
    docsError,
    refetchPrices,
    refetchDocs
  } = usePriceData();

  const {
    handleAddPrice,
    handleAddDocument,
    handleUpdatePrice,
    handleDeletePrice,
    handleDeleteDocument
  } = usePriceOperations(
    refetchPrices,
    refetchDocs,
    resetPriceForm,
    resetDocForm,
    setSelectedPrice,
    setSelectedDocument,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsAddDocDialogOpen,
    setIsDeleteDocDialogOpen
  );

  // Wrapped functions to connect the pieces
  const openEditDialog = (price: any) => {
    baseOpenEditDialog(price, setPriceFormValues);
  };

  const wrappedHandleAddPrice = () => {
    handleAddPrice(priceFormValues);
  };

  const wrappedHandleAddDocument = () => {
    handleAddDocument(docFormValues);
  };

  const wrappedHandleUpdatePrice = () => {
    handleUpdatePrice(priceFormValues, selectedPrice);
  };

  const wrappedHandleDeletePrice = () => {
    handleDeletePrice(selectedPrice);
  };

  const wrappedHandleDeleteDocument = () => {
    handleDeleteDocument(selectedDocument);
  };

  return {
    // States
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedPrice,
    isAddDocDialogOpen, 
    setIsAddDocDialogOpen,
    isDeleteDocDialogOpen, 
    setIsDeleteDocDialogOpen,
    selectedDocument,
    
    // Data
    ricePrices,
    ricePriceDocuments,
    isPricesLoading,
    isDocsLoading,
    pricesError,
    docsError,
    
    // Form values
    priceFormValues,
    docFormValues,
    
    // Handlers
    handlePriceFormChange,
    handleDocFormChange,
    openEditDialog,
    openDeleteDialog,
    openDeleteDocDialog,
    handleAddPrice: wrappedHandleAddPrice,
    handleAddDocument: wrappedHandleAddDocument,
    handleUpdatePrice: wrappedHandleUpdatePrice,
    handleDeletePrice: wrappedHandleDeletePrice,
    handleDeleteDocument: wrappedHandleDeleteDocument,
    
    // Utils
    formatThaiDate,
    refetchPrices,
    refetchDocs
  };
}
