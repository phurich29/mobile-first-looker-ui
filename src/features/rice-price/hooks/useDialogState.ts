
import { useState } from "react";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { PriceFormValues } from "../types";

export function useDialogState() {
  const [activeTab, setActiveTab] = useState("prices");
  
  // States for rice price management dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<RicePrice | null>(null);
  
  // States for document management dialogs
  const [isAddDocDialogOpen, setIsAddDocDialogOpen] = useState(false);
  const [isDeleteDocDialogOpen, setIsDeleteDocDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<RicePriceDocument | null>(null);

  // Open edit dialog with selected price data
  const openEditDialog = (price: RicePrice, setPriceFormValues: (values: PriceFormValues) => void) => {
    setSelectedPrice(price);
    setPriceFormValues({
      name: price.name,
      price: price.price.toString(),
      priceColor: price.priceColor || 'black',
      document_date: price.document_date || new Date().toISOString().split('T')[0]
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog with selected price data
  const openDeleteDialog = (price: RicePrice) => {
    setSelectedPrice(price);
    setIsDeleteDialogOpen(true);
  };

  // Open delete document dialog with selected document
  const openDeleteDocDialog = (document: RicePriceDocument) => {
    setSelectedDocument(document);
    setIsDeleteDocDialogOpen(true);
  };

  return {
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
    openEditDialog,
    openDeleteDialog,
    openDeleteDocDialog
  };
}
