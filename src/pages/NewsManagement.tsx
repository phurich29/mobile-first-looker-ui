
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MoreVertical, PlusCircle, Trash2, Pencil, Search, CalendarIcon, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

// Interface สำหรับข้อมูลข่าวสาร
interface NewsItem {
  id: string;
  title: string;
  content: string;
  publish_date: string; // ISO string from database
  updated_at: string;   // ISO string from database
  published: boolean;
  image_url?: string;
}

export default function NewsManagement() {
  // สถานะสำหรับการจัดการข่าวสาร
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // สถานะสำหรับฟอร์มเพิ่ม/แก้ไขข่าวสาร
  const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({
    title: "",
    content: "",
    published: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const { user, userRoles } = useAuth();
  
  // Function to load news from Supabase
  const fetchNews = async () => {
    setIsLoading(true);
    
    try {
      let { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publish_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setNewsItems(data as NewsItem[]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('ไม่สามารถโหลดข้อมูลข่าวสารได้');
    } finally {
      setIsLoading(false);
    }
  };
  
  // โหลดข้อมูลข่าวสารเมื่อเข้าสู่หน้า
  useEffect(() => {
    fetchNews();
  }, []);

  // กรองข่าวตามคำค้นหา
  const filteredNews = newsItems.filter(news => 
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    news.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // จัดการการเพิ่มข่าวใหม่
  const handleAddNews = () => {
    setCurrentNews({
      title: "",
      content: "",
      published: false,
    });
    setDate(new Date());
    setIsEditing(false);
    setDialogOpen(true);
  };

  // จัดการการแก้ไขข่าว
  const handleEditNews = (news: NewsItem) => {
    setCurrentNews(news);
    setDate(new Date(news.publish_date));
    setIsEditing(true);
    setDialogOpen(true);
  };

  // จัดการการดูตัวอย่างข่าว
  const handlePreviewNews = (news: NewsItem) => {
    setCurrentNews(news);
    setPreviewDialogOpen(true);
  };

  // จัดการการบันทึกข่าว
  const handleSaveNews = async () => {
    if (!currentNews.title || !currentNews.content) {
      toast.error("กรุณากรอกหัวข้อและเนื้อหาข่าวให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditing && currentNews.id) {
        // อัพเดทข่าวที่มีอยู่
        const { error } = await supabase
          .from('news')
          .update({
            title: currentNews.title,
            content: currentNews.content,
            publish_date: date.toISOString(),
            published: currentNews.published,
            image_url: currentNews.image_url
          })
          .eq('id', currentNews.id);
          
        if (error) throw error;
        toast.success("อัพเดทข่าวสารเรียบร้อยแล้ว");
      } else {
        // เพิ่มข่าวใหม่
        const { error } = await supabase
          .from('news')
          .insert({
            title: currentNews.title,
            content: currentNews.content,
            publish_date: date.toISOString(),
            published: currentNews.published || false,
            image_url: currentNews.image_url
          });
          
        if (error) throw error;
        toast.success("เพิ่มข่าวสารใหม่เรียบร้อยแล้ว");
      }
      
      // โหลดข่าวใหม่หลังจากบันทึก
      fetchNews();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error("ไม่สามารถบันทึกข่าวสารได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  // จัดการการลบข่าว
  const handleDeleteNews = async (id: string) => {
    if (!confirm("คุณต้องการลบข่าวสารนี้ใช่หรือไม่?")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // อัพเดตรายการข่าวหลังจากลบ
      setNewsItems(prevNews => prevNews.filter(news => news.id !== id));
      toast.success("ลบข่าวสารเรียบร้อยแล้ว");
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error("ไม่สามารถลบข่าวสารได้");
    } finally {
      setIsLoading(false);
    }
  };

  // จัดการการเปลี่ยนสถานะการเผยแพร่
  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ published: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // อัพเดตรายการข่าวหลังจากเปลี่ยนสถานะ
      setNewsItems(prevNews => 
        prevNews.map(news => 
          news.id === id 
            ? { ...news, published: !news.published } 
            : news
        )
      );
      
      const newStatus = !currentStatus;
      toast.success(`${newStatus ? "เผยแพร่" : "ยกเลิกการเผยแพร่"}ข่าวสารเรียบร้อยแล้ว`);
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error("ไม่สามารถเปลี่ยนสถานะการเผยแพร่ได้");
    }
  };

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงหน้านี้หรือไม่
  const isAuthorized = userRoles.some(role => ["admin", "superadmin"].includes(role));

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
          <p className="text-gray-600 mb-6">กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์เข้าถึงการจัดการข่าวสาร</p>
          <Button onClick={() => window.location.href = '/'} className="bg-emerald-600 hover:bg-emerald-700">
            กลับสู่หน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-8 pb-32">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">จัดการข่าวสาร</h1>
          <p className="text-gray-600 mt-1">เพิ่ม แก้ไข และจัดการข่าวสารสำหรับผู้ใช้งานทั้งหมด</p>
        </div>
        
        {/* ส่วนค้นหาและเพิ่มข่าวใหม่ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาข่าวสาร..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddNews} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <PlusCircle className="h-4 w-4" />
            เพิ่มข่าวสารใหม่
          </Button>
        </div>
        
        {/* แสดงตัวโหลดขณะกำลังดึงข้อมูล */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">ไม่พบข่าวสารที่ตรงกับการค้นหา</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map((news) => (
              <Card key={news.id} className={`overflow-hidden border ${news.published ? 'border-emerald-100' : 'border-gray-200'}`}>
                <CardHeader className="p-4 pb-2 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium text-gray-800 line-clamp-2">
                      {news.title}
                    </CardTitle>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mt-1 h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48" align="end">
                        <div className="flex flex-col space-y-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="justify-start gap-2 font-normal"
                            onClick={() => handlePreviewNews(news)}
                          >
                            <Eye className="h-4 w-4" />
                            ดูตัวอย่าง
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="justify-start gap-2 font-normal"
                            onClick={() => handleEditNews(news)}
                          >
                            <Pencil className="h-4 w-4" />
                            แก้ไข
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="justify-start gap-2 font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteNews(news.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            ลบ
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>
                      วันที่เผยแพร่: {format(new Date(news.publish_date), "d MMM yyyy", { locale: th })}
                    </span>
                    <span className={news.published ? "text-emerald-600" : "text-gray-400"}>
                      {news.published ? "เผยแพร่แล้ว" : "ร่าง"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {news.content}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs"
                    onClick={() => handleEditNews(news)}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    variant={news.published ? "outline" : "default"}
                    size="sm"
                    className={news.published ? "text-xs border-emerald-200 hover:bg-emerald-50" : "text-xs bg-emerald-600 hover:bg-emerald-700"}
                    onClick={() => togglePublishStatus(news.id, news.published)}
                  >
                    {news.published ? "ยกเลิกการเผยแพร่" : "เผยแพร่"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialog สำหรับเพิ่ม/แก้ไขข่าวสาร */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">หัวข้อข่าวสาร</Label>
              <Input
                id="title"
                placeholder="ใส่หัวข้อข่าวสาร"
                value={currentNews.title || ""}
                onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">เนื้อหาข่าวสาร</Label>
              <Textarea
                id="content"
                placeholder="ใส่เนื้อหาข่าวสาร"
                rows={6}
                value={currentNews.content || ""}
                onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="image_url">URL รูปภาพ (ไม่บังคับ)</Label>
              <Input
                id="image_url"
                placeholder="https://example.com/image.jpg"
                value={currentNews.image_url || ""}
                onChange={(e) => setCurrentNews({ ...currentNews, image_url: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>วันที่เผยแพร่</Label>
              <div className="relative">
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-gray-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        if (newDate) {
                          setDate(newDate);
                          setShowCalendar(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={currentNews.published || false}
                onChange={(e) => setCurrentNews({ ...currentNews, published: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-600"
              />
              <Label htmlFor="published" className="cursor-pointer">เผยแพร่ทันที</Label>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button 
              onClick={handleSaveNews} 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : "บันทึกข่าวสาร"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog สำหรับดูตัวอย่างข่าวสาร */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ตัวอย่างข่าวสาร</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{currentNews.title}</h3>
            
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>
                วันที่เผยแพร่: {currentNews.publish_date && format(new Date(currentNews.publish_date), "PPP", { locale: th })}
              </span>
              <span className={currentNews.published ? "text-emerald-600" : "text-gray-400"}>
                {currentNews.published ? "เผยแพร่แล้ว" : "ร่าง"}
              </span>
            </div>
            
            {currentNews.image_url && (
              <div className="mb-4">
                <img 
                  src={currentNews.image_url} 
                  alt={currentNews.title} 
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                    toast.error("ไม่สามารถโหลดรูปภาพได้");
                  }} 
                />
              </div>
            )}
            
            <div className="prose max-w-full">
              <p className="whitespace-pre-wrap">{currentNews.content}</p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">ปิด</Button>
            </DialogClose>
            {isEditing && (
              <Button 
                onClick={() => {
                  setPreviewDialogOpen(false);
                  setDialogOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                แก้ไขข่าวสาร
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <FooterNav />
    </div>
  );
}
