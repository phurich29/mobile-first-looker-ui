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
import { Copy, Edit, Trash2, ExternalLink, Check, QrCode, Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useTranslation } from '@/hooks/useTranslation';
import { shareContent, getSharingCapabilities, getShareButtonText } from '@/utils/sharing';
import { isMobileDevice } from '@/utils/platform';

export const SharedLinksSection: React.FC = () => {
  const { t, language } = useTranslation();
  const { sharedLinks, loading, updateSharedLink, deleteSharedLink, getPublicLink } = useSharedLinks();
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
  const [showQrCode, setShowQrCode] = useState<string | null>(null);
  const [sharingLinks, setSharingLinks] = useState<Set<string>>(new Set());
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get sharing capabilities
  const sharingCapabilities = getSharingCapabilities();
  const isMobile = isMobileDevice();

  // Function to generate QR code
  const generateQRCode = (token: string) => {
    if (!qrCanvasRef.current) return;
    
    const url = getPublicLink(token);
    console.log('Generating QR code for token:', token);
    console.log('Generated URL:', url);
    
    // Clear previous QR code
    const canvas = qrCanvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Responsive QR code size
    const qrSize = isMobile ? 250 : 200;
    
    // Generate new QR code
    QRCode.toCanvas(qrCanvasRef.current, url, {
      width: qrSize,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(() => {
      console.log('QR code generated successfully for URL:', url);
    }).catch((error) => {
      console.error('QR code generation failed:', error);
    });
  };

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
        title: t('sharedLinks', 'successToast'),
        description: t('sharedLinks', 'downloadQrSuccess'),
      });
    } catch (error) {
      toast({
        title: t('sharedLinks', 'errorToast'),
        description: t('sharedLinks', 'downloadQrError'),
        variant: 'destructive',
      });
    }
  };

  const handleShareLink = async (shareToken: string, title: string) => {
    setSharingLinks(prev => new Set([...prev, shareToken]));
    
    try {
      const url = getPublicLink(shareToken);
      
      const shareMethod = await shareContent(
        {
          title: `${title} - Rice Quality Analysis`,
          text: `ดูผลการวิเคราะห์คุณภาพข้าว: ${title}`,
          url: url
        },
        {
          fallbackToClipboard: true,
          onSuccess: () => {
            if (sharingCapabilities.hasWebShare) {
              toast({
                title: t('sharedLinks', 'shareSuccess'),
                description: t('sharedLinks', 'shareSuccessDescription'),
              });
            } else {
              setCopiedLinks(prev => new Set([...prev, shareToken]));
              toast({
                title: t('sharedLinks', 'copySuccess'),
                description: t('sharedLinks', 'copySuccessDescription'),
              });
              setTimeout(() => {
                setCopiedLinks(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(shareToken);
                  return newSet;
                });
              }, 2000);
            }
          },
          onError: (error) => {
            console.error('Share failed:', error);
            toast({
              title: t('sharedLinks', 'errorToast'),
              description: t('sharedLinks', 'shareError'),
              variant: 'destructive',
            });
          }
        }
      );
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setSharingLinks(prev => {
        const newSet = new Set(prev);
        newSet.delete(shareToken);
        return newSet;
      });
    }
  };

  const handleCopyLink = async (shareToken: string) => {
    try {
      const url = getPublicLink(shareToken);
      await navigator.clipboard.writeText(url);
      setCopiedLinks(prev => new Set([...prev, shareToken]));
      toast({
        title: t('sharedLinks', 'copySuccess'),
        description: t('sharedLinks', 'copySuccessDescription'),
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
        title: t('sharedLinks', 'errorToast'),
        description: t('sharedLinks', 'copyError'),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const result = await updateSharedLink(id, { is_active: !currentStatus });
    if (result) {
      toast({
        title: t('sharedLinks', 'updateSuccess'),
        description: !currentStatus ? t('sharedLinks', 'linkActivated') : t('sharedLinks', 'linkDeactivated'),
      });
    } else {
      toast({
        title: t('sharedLinks', 'errorToast'),
        description: t('sharedLinks', 'updateStatusError'),
        variant: 'destructive',
      });
    }
  };

  const handleEditTitle = async (id: string) => {
    if (!editTitle.trim()) {
      toast({
        title: t('sharedLinks', 'errorToast'),
        description: t('sharedLinks', 'enterLinkNameError'),
        variant: 'destructive',
      });
      return;
    }

    const result = await updateSharedLink(id, { title: editTitle.trim() });
    if (result) {
      toast({
        title: t('sharedLinks', 'updateSuccess'),
        description: t('sharedLinks', 'updateNameSuccess'),
      });
      setEditingLink(null);
      setEditTitle('');
    } else {
      toast({
        title: t('sharedLinks', 'errorToast'),
        description: t('sharedLinks', 'updateNameError'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    const success = await deleteSharedLink(id);
    if (success) {
      toast({
        title: t('sharedLinks', 'deleteSuccess'),
        description: t('sharedLinks', 'linkDeleted'),
      });
    } else {
      toast({
        title: t('sharedLinks', 'errorToast'),
        description: t('sharedLinks', 'deleteError'),
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (link: any) => {
    setEditingLink(link.id);
    setEditTitle(link.title);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
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
          <CardTitle>{t('sharedLinks', 'title')}</CardTitle>
          <CardDescription>{t('sharedLinks', 'description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">{t('sharedLinks', 'loading')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sharedLinks', 'title')}</CardTitle>
        <CardDescription>{t('sharedLinks', 'description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {sharedLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('sharedLinks', 'noSharedLinks')}
          </div>
        ) : (
          <div className="space-y-4">
            {sharedLinks.map((link) => (
              <div
                key={link.id}
                className="border rounded-lg p-3 md:p-4 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <h4 className="font-medium text-base md:text-lg">{link.title}</h4>
                        <Dialog open={editingLink === link.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditingLink(null);
                            setEditTitle('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(link)}
                              className="h-6 w-6 p-0 hover:bg-muted"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="sr-only">แก้ไข</span>
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
                      </div>
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active ? t('sharedLinks', 'active') : t('sharedLinks', 'inactive')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 mb-3">
                      <p className="text-xs text-muted-foreground">
                        {t('sharedLinks', 'createdAt')}: {formatDate(link.created_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('sharedLinks', 'lastUpdated')}: {formatDate(link.updated_at)}
                      </p>
                    </div>
                    
                    <div className="mt-2 bg-muted/30 p-3 rounded-md">
                      <p className="text-xs font-medium mb-2">
                        {t('sharedLinks', 'qrCodeDescription')}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 bg-background p-2 rounded border">
                        <span className="text-sm text-muted-foreground break-all flex-1 min-w-[200px]">
                          {getPublicLink(link.share_token)}
                        </span>
                        {/* Primary share/copy button */}
                        <Button
                          variant="default"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleShareLink(link.share_token, link.title)}
                          disabled={sharingLinks.has(link.share_token)}
                          title={sharingCapabilities.hasWebShare ? 'แชร์ลิงก์' : 'คัดลอกลิงก์'}
                        >
                          {sharingLinks.has(link.share_token) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : sharingCapabilities.hasWebShare ? (
                            <Share2 className="h-4 w-4" />
                          ) : copiedLinks.has(link.share_token) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {sharingCapabilities.hasWebShare ? 'แชร์ลิงก์' : 'คัดลอกลิงก์'}
                          </span>
                        </Button>
                        {/* Secondary copy button - only show if Web Share is available */}
                        {sharingCapabilities.hasWebShare && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                            onClick={() => handleCopyLink(link.share_token)}
                            title="คัดลอกลิงก์"
                          >
                            {copiedLinks.has(link.share_token) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            <span className="sr-only">คัดลอกลิงก์</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-2 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-muted-foreground">
                        {link.is_active ? t('sharedLinks', 'enabled') : t('sharedLinks', 'disabled')}
                      </span>
                      <Switch
                        checked={link.is_active}
                        onCheckedChange={() => handleToggleActive(link.id, link.is_active)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <Dialog open={showQrCode === link.share_token} onOpenChange={(open) => {
                    if (!open) setShowQrCode(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQrCode(link.share_token)}
                        className="flex items-center gap-1 w-full sm:w-auto justify-center"
                      >
                        <QrCode className="h-4 w-4" />
                        {t('sharedLinks', 'shareLink')}
                      </Button>
                    </DialogTrigger>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex items-center gap-1 w-full sm:w-auto justify-center">
                        <Trash2 className="h-4 w-4" />
                        {t('buttons', 'delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                          คุณแน่ใจหรือไม่ว่าต้องการลบลิงก์ "{link.title}"? การกระทำนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLink(link.id)}>
                          ลบ
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                    <DialogContent 
                      className="sm:max-w-md"
                      onOpenAutoFocus={(event) => {
                        event.preventDefault();
                        setTimeout(() => generateQRCode(link.share_token), 100);
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle>แชร์ลิงค์</DialogTitle>
                        <DialogDescription>
                          สแกน QR Code เพื่อเข้าถึงลิงก์แชร์
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center space-y-5 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <canvas
                          ref={qrCanvasRef}
                          className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                          style={{
                            maxWidth: '100%',
                            height: 'auto'
                          }}
                        />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.title}</p>
                          {isMobile && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              สแกน QR Code ด้วยกล้องหรือแอปสแกน QR
                            </p>
                          )}
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-3 items-stretch mt-4 w-full">
                          <Button
                            variant="outline"
                            onClick={() => handleDownloadQR(link.share_token, link.title)}
                            className="flex items-center justify-center gap-2 py-5 sm:py-2 flex-1"
                          >
                            <Download className="h-4 w-4" />
                            ดาวน์โหลด QR Code
                          </Button>
                          <Button
                            onClick={() => handleShareLink(link.share_token, link.title)}
                            disabled={sharingLinks.has(link.share_token)}
                            className="flex items-center justify-center gap-2 py-5 sm:py-2 flex-1"
                          >
                            {sharingLinks.has(link.share_token) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : sharingCapabilities.hasWebShare ? (
                              <Share2 className="h-4 w-4" />
                            ) : copiedLinks.has(link.share_token) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {getShareButtonText(sharingCapabilities.recommendedMethod)}
                          </Button>
                        </DialogFooter>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};