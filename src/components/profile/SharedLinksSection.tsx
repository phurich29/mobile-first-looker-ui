import React, { useState, useRef, useEffect } from 'react';
import { useSharedLinks } from '@/hooks/useSharedLinks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Copy, Edit, Trash2, ExternalLink, Check, QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';

export const SharedLinksSection: React.FC = () => {
  const { sharedLinks, loading, updateSharedLink, deleteSharedLink, getPublicLink } = useSharedLinks();
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
  const [showQrCode, setShowQrCode] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR Code when showQrCode changes
  useEffect(() => {
    if (showQrCode && qrCanvasRef.current) {
      const url = getPublicLink(showQrCode);
      QRCode.toCanvas(qrCanvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [showQrCode, getPublicLink]);

  const handleDownloadQR = (shareToken: string, title: string) => {
    if (!qrCanvasRef.current) return;
    
    try {
      // สร้าง canvas ใหม่สำหรับรวม QR Code และข้อความ
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return;

      const qrCanvas = qrCanvasRef.current;
      const padding = 20;
      const fontSize = 16;
      
      // คำนวณขนาด canvas รวม
      finalCanvas.width = qrCanvas.width + (padding * 2);
      finalCanvas.height = qrCanvas.height + (padding * 3) + fontSize + 10;
      
      // เติมพื้นหลังสีขาว
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      
      // วาด QR Code
      ctx.drawImage(qrCanvas, padding, padding);
      
      // เพิ่มข้อความ
      ctx.fillStyle = '#000000';
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'center';
      const textY = qrCanvas.height + padding * 2 + fontSize;
      ctx.fillText(title, finalCanvas.width / 2, textY);
      
      // บันทึกรูป
      const link = document.createElement('a');
      link.download = `qr-code-${title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      link.href = finalCanvas.toDataURL();
      link.click();
      
      toast({
        title: 'สำเร็จ',
        description: 'บันทึก QR Code เรียบร้อยแล้ว',
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึก QR Code ได้',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async (shareToken: string) => {
    try {
      const url = getPublicLink(shareToken);
      await navigator.clipboard.writeText(url);
      setCopiedLinks(prev => new Set([...prev, shareToken]));
      toast({
        title: 'คัดลอกแล้ว',
        description: 'ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว',
      });
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(shareToken);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถคัดลอกลิงก์ได้',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const result = await updateSharedLink(id, { is_active: !currentStatus });
    if (result) {
      toast({
        title: 'อัปเดตสำเร็จ',
        description: `ลิงก์ถูก${!currentStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}แล้ว`,
      });
    } else {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะลิงก์ได้',
        variant: 'destructive',
      });
    }
  };

  const handleEditTitle = async (id: string) => {
    if (!editTitle.trim()) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณากรอกชื่อลิงก์',
        variant: 'destructive',
      });
      return;
    }

    const result = await updateSharedLink(id, { title: editTitle.trim() });
    if (result) {
      toast({
        title: 'อัปเดตสำเร็จ',
        description: 'ชื่อลิงก์ถูกอัปเดตแล้ว',
      });
      setEditingLink(null);
      setEditTitle('');
    } else {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตชื่อลิงก์ได้',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    const success = await deleteSharedLink(id);
    if (success) {
      toast({
        title: 'ลบสำเร็จ',
        description: 'ลิงก์ถูกลบแล้ว',
      });
    } else {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถลบลิงก์ได้',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (link: any) => {
    setEditingLink(link.id);
    setEditTitle(link.title);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ลิงก์แชร์ของฉัน</CardTitle>
          <CardDescription>จัดการลิงก์แชร์ข้อมูลการวิเคราะห์ของคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">กำลังโหลด...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ลิงก์แชร์ของฉัน</CardTitle>
        <CardDescription>จัดการลิงก์แชร์ข้อมูลการวิเคราะห์ของคุณ</CardDescription>
      </CardHeader>
      <CardContent>
        {sharedLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            ยังไม่มีลิงก์แชร์
          </div>
        ) : (
          <div className="space-y-4">
            {sharedLinks.map((link) => (
              <div
                key={link.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{link.title}</h4>
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      สร้างเมื่อ: {formatDate(link.created_at)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      อัปเดตล่าสุด: {formatDate(link.updated_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={link.is_active}
                      onCheckedChange={() => handleToggleActive(link.id, link.is_active)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(link.share_token)}
                    className="flex items-center gap-1"
                  >
                    {copiedLinks.has(link.share_token) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copiedLinks.has(link.share_token) ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getPublicLink(link.share_token), '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    เปิดลิงก์
                  </Button>

                  <Dialog open={showQrCode === link.share_token} onOpenChange={(open) => {
                    if (!open) setShowQrCode(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQrCode(link.share_token)}
                        className="flex items-center gap-1"
                      >
                        <QrCode className="h-3 w-3" />
                        QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>QR Code</DialogTitle>
                        <DialogDescription>
                          สแกน QR Code เพื่อเข้าถึงลิงก์แชร์
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="flex flex-col items-center space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <canvas
                          ref={qrCanvasRef}
                          className="border border-gray-300 dark:border-gray-600 rounded"
                        />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.title}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadQR(link.share_token, link.title)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          บันทึก QR Code เป็น PNG
                        </Button>
                      </div>

                      <DialogFooter>
                        <Button onClick={() => setShowQrCode(null)}>
                          ปิด
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={editingLink === link.id} onOpenChange={(open) => {
                    if (!open) {
                      setEditingLink(null);
                      setEditTitle('');
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(link)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        แก้ไข
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>แก้ไขชื่อลิงก์</DialogTitle>
                        <DialogDescription>
                          เปลี่ยนชื่อลิงก์แชร์ของคุณ
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">ชื่อลิงก์</Label>
                        <Input
                          id="edit-title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="กรอกชื่อลิงก์ใหม่"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingLink(null);
                            setEditTitle('');
                          }}
                        >
                          ยกเลิก
                        </Button>
                        <Button onClick={() => handleEditTitle(link.id)}>
                          บันทึก
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        ลบ
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                          คุณแน่ใจหรือไม่ที่จะลบลิงก์ "{link.title}" การกระทำนี้ไม่สามารถยกเลิกได้
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteLink(link.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          ลบ
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};