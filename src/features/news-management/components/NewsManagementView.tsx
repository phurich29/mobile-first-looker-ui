
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchBar } from "./SearchBar";
import { NewsGrid } from "./NewsGrid";
import { NewsForm } from "./NewsForm";
import { NewsPreview } from "./NewsPreview";
import { useNewsManagement } from "../hooks/useNewsManagement";

export function NewsManagementView() {
  const {
    filteredNews,
    searchTerm,
    setSearchTerm,
    isLoading,
    isSubmitting,
    currentNews,
    setCurrentNews,
    isEditing,
    date,
    setDate,
    showCalendar,
    setShowCalendar,
    dialogOpen,
    setDialogOpen,
    previewDialogOpen,
    setPreviewDialogOpen,
    handleAddNews,
    handleEditNews,
    handlePreviewNews,
    handleSaveNews,
    handleDeleteNews,
    togglePublishStatus,
  } = useNewsManagement();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการข่าวสาร</h1>
        <p className="text-gray-600 mt-1">เพิ่ม แก้ไข และจัดการข่าวสารสำหรับผู้ใช้งานทั้งหมด</p>
      </div>
      
      {/* Search and add new news section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        
        <Button onClick={handleAddNews} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <PlusCircle className="h-4 w-4" />
          เพิ่มข่าวสารใหม่
        </Button>
      </div>
      
      <NewsGrid 
        isLoading={isLoading}
        filteredNews={filteredNews}
        onEdit={handleEditNews}
        onPreview={handlePreviewNews}
        onDelete={handleDeleteNews}
        onPublishToggle={togglePublishStatus}
      />

      {/* Dialog for adding/editing news */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}</DialogTitle>
          </DialogHeader>
          
          <NewsForm 
            currentNews={currentNews}
            isSubmitting={isSubmitting}
            date={date}
            setDate={setDate}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            setCurrentNews={setCurrentNews}
            onCancel={() => setDialogOpen(false)}
            onSave={handleSaveNews}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for previewing news */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ตัวอย่างข่าวสาร</DialogTitle>
          </DialogHeader>
          
          <NewsPreview 
            news={currentNews}
            isEditing={isEditing}
            onEdit={() => {
              setPreviewDialogOpen(false);
              setDialogOpen(true);
            }}
            onClose={() => setPreviewDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
