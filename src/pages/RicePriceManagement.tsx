
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useAuth } from "@/components/AuthProvider";
import { usePriceManagement } from "@/features/rice-price/hooks/usePriceManagement";
import { ManagementTabs } from "@/features/rice-price/components/ManagementTabs";
import { AddPriceDialog } from "@/features/rice-price/components/AddPriceDialog";
import { EditPriceDialog } from "@/features/rice-price/components/EditPriceDialog";
import { DeletePriceDialog } from "@/features/rice-price/components/DeletePriceDialog";
import { AddDocumentDialog } from "@/features/rice-price/components/AddDocumentDialog";
import { DeleteDocumentDialog } from "@/features/rice-price/components/DeleteDocumentDialog";
import { AccessDeniedView } from "@/features/rice-price/components/AccessDeniedView";
import { ErrorView } from "@/features/rice-price/components/ErrorView";
import { LoadingView } from "@/features/rice-price/components/LoadingView";

export default function RicePriceManagement() {
  const { userRoles } = useAuth();
  const {
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
    handleAddPrice,
    handleAddDocument,
    handleUpdatePrice,
    handleDeletePrice,
    handleDeleteDocument,
    
    // Utils
    refetchPrices,
    refetchDocs
  } = usePriceManagement();

  // Check if user is not a superadmin
  if (!userRoles.includes('superadmin')) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 p-4">
          <AccessDeniedView />
        </main>
        <FooterNav />
      </div>
    );
  }

  if (isPricesLoading || isDocsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 flex items-center justify-center">
          <LoadingView />
        </main>
        <FooterNav />
      </div>
    );
  }

  if (pricesError || docsError) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 p-4">
          <ErrorView 
            error={(pricesError || docsError) as Error} 
            onRetry={() => {
              refetchPrices();
              refetchDocs();
            }}
          />
        </main>
        <FooterNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64 overflow-hidden">
      <Header />
      <main className="flex-1 p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-800">จัดการราคาข้าว</h1>
        </div>
        
        <ManagementTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ricePrices={ricePrices}
          ricePriceDocuments={ricePriceDocuments}
          onOpenAddPrice={() => setIsAddDialogOpen(true)}
          onOpenAddDoc={() => setIsAddDocDialogOpen(true)}
          onEditPrice={openEditDialog}
          onDeletePrice={openDeleteDialog}
          onDeleteDocument={openDeleteDocDialog}
        />
        
        {/* Add Price Dialog */}
        <AddPriceDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          formValues={priceFormValues}
          onValueChange={handlePriceFormChange}
          onSubmit={handleAddPrice}
        />
        
        {/* Edit Price Dialog */}
        <EditPriceDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          formValues={priceFormValues}
          onValueChange={handlePriceFormChange}
          onSubmit={handleUpdatePrice}
        />
        
        {/* Delete Price Dialog */}
        <DeletePriceDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          price={selectedPrice}
          onConfirm={handleDeletePrice}
        />
        
        {/* Add Document Dialog */}
        <AddDocumentDialog
          open={isAddDocDialogOpen}
          onOpenChange={setIsAddDocDialogOpen}
          formValues={docFormValues}
          onValueChange={handleDocFormChange}
          onSubmit={handleAddDocument}
        />
        
        {/* Delete Document Dialog */}
        <DeleteDocumentDialog
          open={isDeleteDocDialogOpen}
          onOpenChange={setIsDeleteDocDialogOpen}
          document={selectedDocument}
          onConfirm={handleDeleteDocument}
        />
      </main>

      <FooterNav />
    </div>
  );
}
