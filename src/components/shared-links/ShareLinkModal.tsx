import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Download, Share2 } from 'lucide-react';
import { useSharedLinks } from '@/hooks/useSharedLinks';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { shareContent, getSharingCapabilities, getShareButtonText } from '@/utils/sharing';
import { isMobileDevice } from '@/utils/platform';
import QRCode from 'qrcode';

interface ShareLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: number;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  open,
  onOpenChange,
  analysisId,
}) => {
  const [title, setTitle] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const { createSharedLink, getPublicLink } = useSharedLinks();
  const { t } = useTranslation();
  
  // Get sharing capabilities
  const sharingCapabilities = getSharingCapabilities();
  const isMobile = isMobileDevice();

  // Generate QR Code when shareUrl changes
  useEffect(() => {
    if (shareUrl && qrCanvasRef.current) {
      // Responsive QR code size based on device
      const qrSize = isMobile ? 250 : 200;
      
      QRCode.toCanvas(qrCanvasRef.current, shareUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [shareUrl, isMobile]);

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current || !title) return;
    
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

  const handleCreateLink = async () => {
    if (!title.trim()) {
      toast({
        title: t('sharedLinks', 'errorToast'),
        description: t('sharedLinks', 'linkNameRequired'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating link for analysis ID:', analysisId, 'with title:', title);
      const result = await createSharedLink(analysisId, title.trim());
      const url = getPublicLink(result.share_token);
      setShareUrl(url);
      toast({
        title: t('sharedLinks', 'successToast'),
        description: t('sharedLinks', 'createLinkSuccess'),
      });
    } catch (error: any) {
      console.error('Failed to create link:', error);
      toast({
        title: t('sharedLinks', 'errorToast'),
        description: error?.message || t('sharedLinks', 'createLinkError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareLink = async () => {
    if (!shareUrl || !title) return;
    
    setSharing(true);
    
    try {
      const shareMethod = await shareContent(
        {
          title: `${title} - Rice Quality Analysis`,
          text: `ดูผลการวิเคราะห์คุณภาพข้าว: ${title}`,
          url: shareUrl
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
              setCopied(true);
              toast({
                title: t('sharedLinks', 'linkCopied'),
                description: t('sharedLinks', 'linkCopiedDescription'),
              });
              setTimeout(() => setCopied(false), 2000);
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
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t('sharedLinks', 'linkCopied'),
        description: t('sharedLinks', 'linkCopiedDescription'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t('sharedLinks', 'errorToast'),
        description: t('sharedLinks', 'copyLinkError'),
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setTitle('');
    setShareUrl('');
    setCopied(false);
    setSharing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('sharedLinks', 'shareAnalysisData')}</DialogTitle>
          <DialogDescription>
            {t('sharedLinks', 'shareAnalysisDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!shareUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">{t('sharedLinks', 'linkTitle')}</Label>
                <Input
                  id="title"
                  placeholder={t('sharedLinks', 'linkTitlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('sharedLinks', 'shareUrl')}</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  {/* Primary share button - Web Share API or Copy */}
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    onClick={handleShareLink}
                    disabled={sharing}
                    className="shrink-0"
                    title={sharingCapabilities.hasWebShare ? 'แชร์ลิงก์' : 'คัดลอกลิงก์'}
                  >
                    {sharing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : sharingCapabilities.hasWebShare ? (
                      <Share2 className="h-4 w-4" />
                    ) : copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  {/* Secondary copy button - only show if Web Share is available */}
                  {sharingCapabilities.hasWebShare && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="shrink-0"
                      title="คัดลอกลิงก์"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* QR Code Section */}
              <div className="space-y-2">
                <Label>{t('sharedLinks', 'qrCodeLabel')}</Label>
                <div className="flex flex-col items-center space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <canvas
                    ref={qrCanvasRef}
                    className="border border-gray-300 dark:border-gray-600 rounded"
                    style={{
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
                    {isMobile && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        สแกน QR Code ด้วยกล้องหรือแอปสแกน QR
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadQR}
                      className="gap-2 flex-1"
                    >
                      <Download className="h-4 w-4" />
                      {t('sharedLinks', 'downloadQrPng')}
                    </Button>
                    {isMobile && (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={handleShareLink}
                        disabled={sharing}
                        className="gap-2 flex-1"
                      >
                        {sharing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                        {getShareButtonText(sharingCapabilities.recommendedMethod as 'web_share' | 'clipboard' | 'manual')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!shareUrl ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t('sharedLinks', 'cancel')}
              </Button>
              <Button onClick={handleCreateLink} disabled={loading}>
                {loading ? t('sharedLinks', 'creating') : t('sharedLinks', 'createLink')}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              {t('sharedLinks', 'done')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};