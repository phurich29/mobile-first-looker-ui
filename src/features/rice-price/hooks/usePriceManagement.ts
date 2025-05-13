import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { PriceFormValues, DocumentFormValues } from "../types";

export function usePriceManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("prices");
  
  // Initialize with today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // States for rice price management
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<RicePrice | null>(null);
  
  // States for document management
  const [isAddDocDialogOpen, setIsAddDocDialogOpen] = useState(false);
  const [isDeleteDocDialogOpen, setIsDeleteDocDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<RicePriceDocument | null>(null);
  
  // Form values
  const [priceFormValues, setPriceFormValues] = useState<PriceFormValues>({
    name: '',
    price: '',
    priceColor: 'black',
    document_date: today
  });

  const [docFormValues, setDocFormValues] = useState<DocumentFormValues>({
    document_date: today,
    file_url: ''
  });

  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    const { data, error } = await supabase
      .from('rice_prices')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as unknown as RicePrice[];
  };

  // Function to fetch rice price documents
  const fetchRicePriceDocuments = async () => {
    const { data, error } = await supabase
      .from('rice_price_documents')
      .select('*')
      .order('document_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as unknown as RicePriceDocument[];
  };

  // Use React Query to fetch and cache rice prices
  const { 
    data: ricePrices, 
    isLoading: isPricesLoading, 
    error: pricesError, 
    refetch: refetchPrices 
  } = useQuery({
    queryKey: ['ricePrices'],
    queryFn: fetchRicePrices
  });

  // Use React Query to fetch and cache rice price documents
  const { 
    data: ricePriceDocuments, 
    isLoading: isDocsLoading, 
    error: docsError, 
    refetch: refetchDocs 
  } = useQuery({
    queryKey: ['ricePriceDocuments'],
    queryFn: fetchRicePriceDocuments
  });

  // Handle rice price form input changes
  const handlePriceFormChange = (field: keyof PriceFormValues, value: string) => {
    setPriceFormValues({
      ...priceFormValues,
      [field]: value
    });
  };

  // Handle document form input changes
  const handleDocFormChange = (field: keyof DocumentFormValues, value: string) => {
    setDocFormValues({
      ...docFormValues,
      [field]: value
    });
  };

  // Reset price form values (keeping the date)
  const resetPriceForm = () => {
    // Keep the current document_date value
    const currentDate = priceFormValues.document_date;
    
    setPriceFormValues({
      name: '',
      price: '',
      priceColor: 'black',
      document_date: currentDate // Preserve the date value
    });
    setSelectedPrice(null);
  };

  // Reset document form values
  const resetDocForm = () => {
    setDocFormValues({
      document_date: new Date().toISOString().split('T')[0],
      file_url: ''
    });
    setSelectedDocument(null);
  };

  // Open edit dialog with selected price data
  const openEditDialog = (price: RicePrice) => {
    setSelectedPrice(price);
    setPriceFormValues({
      name: price.name,
      price: price.price.toString(),
      priceColor: price.priceColor || 'black',
      document_date: price.document_date || today
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

  // Add new rice price
  const handleAddPrice = async () => {
    try {
      const { error } = await supabase
        .from('rice_prices')
        .insert({
          name: priceFormValues.name,
          price: parseFloat(priceFormValues.price), // Convert to number
          category: 'general', // Default category
          document_date: priceFormValues.document_date
        });
      
      if (error) throw error;
      
      toast({
        title: "เพิ่มข้อมูลสำเร็จ",
        description: "เพิ่มข้อมูลราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetPriceForm();
      refetchPrices();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  // Add new rice price document
  const handleAddDocument = async () => {
    try {
      const { error } = await supabase
        .from('rice_price_documents')
        .insert({
          document_date: docFormValues.document_date,
          file_url: docFormValues.file_url
        });
      
      if (error) throw error;
      
      toast({
        title: "เพิ่มเอกสารสำเร็จ",
        description: "เพิ่มเอกสารราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetDocForm();
      setIsAddDocDialogOpen(false);
      refetchDocs();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มเอกสารได้",
        variant: "destructive",
      });
    }
  };

  // Update existing rice price
  const handleUpdatePrice = async () => {
    if (!selectedPrice) return;
    
    try {
      const { error } = await supabase
        .from('rice_prices')
        .update({
          name: priceFormValues.name,
          price: parseFloat(priceFormValues.price), // Convert to number
          document_date: priceFormValues.document_date
        })
        .eq('id', selectedPrice.id);
      
      if (error) throw error;
      
      toast({
        title: "อัพเดทข้อมูลสำเร็จ",
        description: "อัพเดทข้อมูลราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetPriceForm();
      setIsEditDialogOpen(false);
      refetchPrices();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  // Delete rice price
  const handleDeletePrice = async () => {
    if (!selectedPrice) return;
    
    try {
      const { error } = await supabase
        .from('rice_prices')
        .delete()
        .eq('id', selectedPrice.id);
      
      if (error) throw error;
      
      toast({
        title: "ลบข้อมูลสำเร็จ",
        description: "ลบข้อมูลราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetPriceForm();
      setIsDeleteDialogOpen(false);
      refetchPrices();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  // Delete rice price document
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      const { error } = await supabase
        .from('rice_price_documents')
        .delete()
        .eq('id', selectedDocument.id);
      
      if (error) throw error;
      
      toast({
        title: "ลบเอกสารสำเร็จ",
        description: "ลบเอกสารราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetDocForm();
      setIsDeleteDocDialogOpen(false);
      refetchDocs();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบเอกสารได้",
        variant: "destructive",
      });
    }
  };

  // Format date for display in Thai format
  const formatThaiDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
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
    handleAddPrice,
    handleAddDocument,
    handleUpdatePrice,
    handleDeletePrice,
    handleDeleteDocument,
    
    // Utils
    formatThaiDate,
    refetchPrices,
    refetchDocs
  };
}
