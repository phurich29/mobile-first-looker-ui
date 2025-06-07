
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
    <div className="overflow-x-hidden">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">จัดการข่าวสาร</h1>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">เพิ่ม แก้ไข และจัดการข่าวสารสำหรับผู้ใช้งานทั้งหมด</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-700/30 dark:text-emerald-300 dark:border-emerald-600/50 dark:hover:bg-emerald-700/40">
              เผยแพร่แล้ว: {publishedCount}
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/70 dark:hover:bg-slate-700/60">
              ฉบับร่าง: {draftCount}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-600/50 dark:hover:bg-blue-700/40">
              ทั้งหมด: {filteredNews.length}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Toolbar section */}
      <div className="bg-gray-50 dark:bg-slate-800/60 rounded-lg p-3 mb-6 border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col justify-between items-start gap-4">
          <div className="w-full md:w-auto flex items-center gap-3">
            <SearchBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
            
            {!isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-600">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>
                      {sortBy === 'newest' ? 'ล่าสุด' : 
                       sortBy === 'oldest' ? 'เก่าสุด' : 'สถานะการเผยแพร่'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex flex-col space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start text-sm dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-gray-100"
                      onClick={() => setSortBy('newest')}
                    >
                      {sortBy === 'newest' && <Check className="h-4 w-4 mr-2" />}
                      ล่าสุด
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start text-sm dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-gray-100"
                      onClick={() => setSortBy('oldest')}
                    >
                      {sortBy === 'oldest' && <Check className="h-4 w-4 mr-2" />}
                      เก่าสุด
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start text-sm dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-gray-100"
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
              <div className="flex items-center gap-1 border rounded-md bg-white dark:border-slate-600 dark:bg-slate-700/50">
                <Button 
                  variant={viewType === 'grid' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className={`h-9 ${viewType === 'grid' ? 'dark:bg-slate-600 dark:text-gray-100 dark:hover:bg-slate-500' : 'dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-200'}`}
                  onClick={() => setViewType('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewType === 'list' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className={`h-9 ${viewType === 'list' ? 'dark:bg-slate-600 dark:text-gray-100 dark:hover:bg-slate-500' : 'dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-200'}`}
                  onClick={() => setViewType('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <Button onClick={handleAddNews} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800 gap-2 whitespace-nowrap">
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
        <DialogContent className="max-w-3xl p-6 dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl dark:text-gray-100">{isEditing ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}</DialogTitle>
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
        <DialogContent className="max-w-3xl dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl dark:text-gray-100">ตัวอย่างข่าวสาร</DialogTitle>
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
    </div>
  );
}
