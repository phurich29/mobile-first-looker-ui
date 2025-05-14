
import { PlusCircle, LayoutGrid, List, ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "./SearchBar";
import { NewsGrid } from "./NewsGrid";
import { NewsForm } from "./NewsForm";
import { NewsPreview } from "./NewsPreview";
import { useNewsManagement } from "../hooks/useNewsManagement";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'published'>('newest');
  const isMobile = useIsMobile();
  
  const publishedCount = filteredNews.filter(news => news.published).length;
  const draftCount = filteredNews.filter(news => !news.published).length;

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">จัดการข่าวสาร</h1>
            <p className="text-gray-600 mt-1">เพิ่ม แก้ไข และจัดการข่าวสารสำหรับผู้ใช้งานทั้งหมด</p>
          </div>
          
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">
              เผยแพร่แล้ว: {publishedCount}
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
              ฉบับร่าง: {draftCount}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
              ทั้งหมด: {filteredNews.length}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Toolbar section */}
      <div className="bg-gray-50 rounded-lg p-3 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-auto flex items-center gap-3">
            <SearchBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
            
            {!isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>
                      {sortBy === 'newest' ? 'ล่าสุด' : 
                       sortBy === 'oldest' ? 'เก่าสุด' : 'สถานะการเผยแพร่'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="flex flex-col space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start text-sm"
                      onClick={() => setSortBy('newest')}
                    >
                      {sortBy === 'newest' && <Check className="h-4 w-4 mr-2" />}
                      ล่าสุด
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start text-sm"
                      onClick={() => setSortBy('oldest')}
                    >
                      {sortBy === 'oldest' && <Check className="h-4 w-4 mr-2" />}
                      เก่าสุด
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start text-sm"
                      onClick={() => setSortBy('published')}
                    >
                      {sortBy === 'published' && <Check className="h-4 w-4 mr-2" />}
                      สถานะการเผยแพร่
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            {!isMobile && (
              <div className="flex items-center gap-1 border rounded-md bg-white">
                <Button 
                  variant={viewType === 'grid' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-9"
                  onClick={() => setViewType('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewType === 'list' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-9"
                  onClick={() => setViewType('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <Button onClick={handleAddNews} className="bg-emerald-600 hover:bg-emerald-700 gap-2 whitespace-nowrap">
            <PlusCircle className="h-4 w-4" />
            เพิ่มข่าวสารใหม่
          </Button>
        </div>
      </div>
      
      <NewsGrid 
        isLoading={isLoading}
        filteredNews={filteredNews}
        onEdit={handleEditNews}
        onPreview={handlePreviewNews}
        onDelete={handleDeleteNews}
        onPublishToggle={togglePublishStatus}
        viewType={viewType}
        sortBy={sortBy}
      />

      {/* Dialog for adding/editing news */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">{isEditing ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for previewing news */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">ตัวอย่างข่าวสาร</DialogTitle>
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
