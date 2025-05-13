
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { RicePrice, RicePriceFormValues, RicePriceDocument, RicePriceDocumentFormValues } from "@/features/user-management/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { formatDate } from "@/features/user-management/utils";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RicePriceManagement() {
  const { userRoles } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("prices");
  const isMobile = useIsMobile();
  
  // Rice Price Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<RicePrice | null>(null);
  
  // Rice Price Document Dialog States
  const [isAddDocDialogOpen, setIsAddDocDialogOpen] = useState(false);
  const [isDeleteDocDialogOpen, setIsDeleteDocDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<RicePriceDocument | null>(null);
  
  const [priceFormValues, setPriceFormValues] = useState<RicePriceFormValues>({
    name: '',
    price: '',
    category: 'กข',
    priceColor: 'black'
  });

  const [docFormValues, setDocFormValues] = useState<RicePriceDocumentFormValues>({
    document_date: new Date().toISOString().split('T')[0],
    file_url: ''
  });

  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    const { data, error } = await supabase
      .from('rice_prices')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as RicePrice[];
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
    
    return data as RicePriceDocument[];
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
  const handlePriceFormChange = (field: keyof RicePriceFormValues, value: string | number) => {
    setPriceFormValues({
      ...priceFormValues,
      [field]: value
    });
  };

  // Handle document form input changes
  const handleDocFormChange = (field: keyof RicePriceDocumentFormValues, value: string) => {
    setDocFormValues({
      ...docFormValues,
      [field]: value
    });
  };

  // Reset price form values
  const resetPriceForm = () => {
    setPriceFormValues({
      name: '',
      price: '',
      category: 'กข',
      priceColor: 'black'
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
      price: price.price ? price.price.toString() : '',
      category: price.category,
      priceColor: price.priceColor || 'black'
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
          price: priceFormValues.price,
          category: priceFormValues.category,
          priceColor: priceFormValues.priceColor
        });
      
      if (error) throw error;
      
      toast({
        title: "เพิ่มข้อมูลสำเร็จ",
        description: "เพิ่มข้อมูลราคาข้าวเรียบร้อยแล้ว",
      });
      
      resetPriceForm();
      setIsAddDialogOpen(false);
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
          price: priceFormValues.price,
          category: priceFormValues.category,
          priceColor: priceFormValues.priceColor
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

  // Get text color class based on price color
  const getPriceColorClass = (color: string = 'black') => {
    switch (color) {
      case 'green': return 'text-emerald-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-900';
    }
  };

  // Check if user is not a superadmin
  if (!userRoles.includes('superadmin')) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
        <Header />
        <main className="flex-1 p-4">
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold text-gray-600 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
            <p className="text-gray-500">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
          </div>
        </main>
        <FooterNav />
      </div>
    );
  }

  if (isPricesLoading || isDocsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
        <Header />
        <main className="flex-1 p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </main>
        <FooterNav />
      </div>
    );
  }

  if (pricesError || docsError) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
        <Header />
        <main className="flex-1 p-4">
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold text-gray-600 mb-2">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-500">{((pricesError || docsError) as Error).message}</p>
            <Button 
              onClick={() => {
                refetchPrices();
                refetchDocs();
              }} 
              className="mt-4"
            >
              ลองใหม่
            </Button>
          </div>
        </main>
        <FooterNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-800">จัดการราคาข้าว</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="prices">ราคาข้าว</TabsTrigger>
            <TabsTrigger value="documents">เอกสารราคาข้าวจากสมาคม</TabsTrigger>
          </TabsList>
          
          {/* Tab content for Rice Prices */}
          <TabsContent value="prices">
            <div className="flex justify-end mb-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    เพิ่มราคาข้าวใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มราคาข้าวใหม่</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">ชื่อข้าว</Label>
                      <Input
                        id="name"
                        value={priceFormValues.name}
                        onChange={(e) => handlePriceFormChange('name', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">ราคา (บาท/100กก.)</Label>
                      <Input
                        id="price"
                        value={priceFormValues.price}
                        onChange={(e) => handlePriceFormChange('price', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">ประเภท</Label>
                      <Select
                        value={priceFormValues.category}
                        onValueChange={(value) => handlePriceFormChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภทข้าว" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="กข">กข</SelectItem>
                          <SelectItem value="หอมมะลิ">หอมมะลิ</SelectItem>
                          <SelectItem value="ปทุมธานี">ปทุมธานี</SelectItem>
                          <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>สีของราคา</Label>
                      <RadioGroup 
                        value={priceFormValues.priceColor} 
                        onValueChange={(value) => handlePriceFormChange('priceColor', value)}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="black" id="color-black" />
                          <Label htmlFor="color-black" className="font-normal">สีดำ</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="green" id="color-green" />
                          <Label htmlFor="color-green" className="font-normal text-emerald-600">สีเขียว</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="red" id="color-red" />
                          <Label htmlFor="color-red" className="font-normal text-red-600">สีแดง</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">ยกเลิก</Button>
                    </DialogClose>
                    <Button onClick={handleAddPrice}>บันทึก</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>รายการราคาข้าว</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveTable>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อข้าว</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>ราคา (บาท/100กก.)</TableHead>
                      <TableHead>อัพเดทเมื่อ</TableHead>
                      <TableHead className="text-right">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ricePrices && ricePrices.length > 0 ? (
                      ricePrices.map((price) => (
                        <TableRow key={price.id}>
                          <TableCell className={isMobile ? "whitespace-normal" : "whitespace-nowrap"}>
                            <div className="font-medium">{price.name}</div>
                          </TableCell>
                          <TableCell>{price.category}</TableCell>
                          <TableCell className={getPriceColorClass(price.priceColor)}>
                            {price.price}
                          </TableCell>
                          <TableCell className={isMobile ? "whitespace-normal" : "whitespace-nowrap"}>
                            {formatDate(price.updated_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`flex ${isMobile ? "flex-col gap-1" : "justify-end space-x-2"}`}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex items-center text-blue-600 hover:text-blue-800"
                                onClick={() => openEditDialog(price)}
                              >
                                <Edit size={16} className="mr-1" />
                                แก้ไข
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex items-center text-red-600 hover:text-red-800"
                                onClick={() => openDeleteDialog(price)}
                              >
                                <Trash2 size={16} className="mr-1" />
                                ลบ
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">ไม่พบข้อมูลราคาข้าว</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </ResponsiveTable>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab content for Price Documents */}
          <TabsContent value="documents">
            <div className="flex justify-end mb-4">
              <Dialog open={isAddDocDialogOpen} onOpenChange={setIsAddDocDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Upload size={16} />
                    เพิ่มเอกสารราคาข้าว
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มเอกสารราคาข้าว</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="document_date">วันที่ของเอกสาร</Label>
                      <Input
                        id="document_date"
                        type="date"
                        value={docFormValues.document_date}
                        onChange={(e) => handleDocFormChange('document_date', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="file_url">URL ไฟล์เอกสาร</Label>
                      <Input
                        id="file_url"
                        value={docFormValues.file_url}
                        onChange={(e) => handleDocFormChange('file_url', e.target.value)}
                        placeholder="https://example.com/rice-prices/document.pdf"
                      />
                      <p className="text-xs text-gray-500 mt-1">ระบุ URL ของไฟล์เอกสาร เช่น PDF หรือรูปภาพ</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">ยกเลิก</Button>
                    </DialogClose>
                    <Button onClick={handleAddDocument}>บันทึก</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>เอกสารราคาข้าวจากสมาคมโรงสีข้าวไทย</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveTable>
                  <TableHeader>
                    <TableRow>
                      <TableHead>วันที่</TableHead>
                      <TableHead>ลิงก์เอกสาร</TableHead>
                      <TableHead>อัพเดทเมื่อ</TableHead>
                      <TableHead className="text-right">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ricePriceDocuments && ricePriceDocuments.length > 0 ? (
                      ricePriceDocuments.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell className={isMobile ? "whitespace-normal" : "whitespace-nowrap"}>
                            {formatThaiDate(document.document_date)}
                          </TableCell>
                          <TableCell>
                            <a 
                              href={document.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              ดูเอกสาร
                            </a>
                          </TableCell>
                          <TableCell className={isMobile ? "whitespace-normal" : "whitespace-nowrap"}>
                            {formatDate(document.updated_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center text-red-600 hover:text-red-800"
                              onClick={() => openDeleteDocDialog(document)}
                            >
                              <Trash2 size={16} className="mr-1" />
                              ลบ
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">ไม่พบข้อมูลเอกสารราคาข้าว</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </ResponsiveTable>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขราคาข้าว</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">ชื่อข้าว</Label>
              <Input
                id="edit-name"
                value={priceFormValues.name}
                onChange={(e) => handlePriceFormChange('name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">ราคา (บาท/100กก.)</Label>
              <Input
                id="edit-price"
                value={priceFormValues.price}
                onChange={(e) => handlePriceFormChange('price', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">ประเภท</Label>
              <Select
                value={priceFormValues.category}
                onValueChange={(value) => handlePriceFormChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทข้าว" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="กข">กข</SelectItem>
                  <SelectItem value="หอมมะลิ">หอมมะลิ</SelectItem>
                  <SelectItem value="ปทุมธานี">ปทุมธานี</SelectItem>
                  <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>สีของราคา</Label>
              <RadioGroup 
                value={priceFormValues.priceColor} 
                onValueChange={(value) => handlePriceFormChange('priceColor', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black" id="edit-color-black" />
                  <Label htmlFor="edit-color-black" className="font-normal">สีดำ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="green" id="edit-color-green" />
                  <Label htmlFor="edit-color-green" className="font-normal text-emerald-600">สีเขียว</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="red" id="edit-color-red" />
                  <Label htmlFor="edit-color-red" className="font-normal text-red-600">สีแดง</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button onClick={handleUpdatePrice}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Price Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>คุณต้องการลบข้อมูลราคาข้าว <span className="font-semibold">{selectedPrice?.name}</span> ใช่หรือไม่?</p>
            <p className="text-sm text-gray-500 mt-2">การกระทำนี้ไม่สามารถยกเลิกได้</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeletePrice}>ลบข้อมูล</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Document Dialog */}
      <Dialog open={isDeleteDocDialogOpen} onOpenChange={setIsDeleteDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบเอกสาร</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>คุณต้องการลบเอกสารราคาข้าววันที่ <span className="font-semibold">{selectedDocument && formatThaiDate(selectedDocument.document_date)}</span> ใช่หรือไม่?</p>
            <p className="text-sm text-gray-500 mt-2">การกระทำนี้ไม่สามารถยกเลิกได้</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteDocument}>ลบเอกสาร</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FooterNav />
    </div>
  );
}
