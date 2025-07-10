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
import { Copy, Check, Download } from 'lucide-react';
import { useSharedLinks } from '@/hooks/useSharedLinks';
import { toast } from '@/hooks/use-toast';
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
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const { createSharedLink, getPublicLink } = useSharedLinks();

  // Generate QR Code when shareUrl changes
  useEffect(() => {
    if (shareUrl && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [shareUrl]);

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current) return;
    
    try {
      const link = document.createElement('a');
      link.download = `qr-code-${title || 'shared-link'}.png`;
      link.href = qrCanvasRef.current.toDataURL();
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

  const handleCreateLink = async () => {
    if (!title.trim()) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณากรอกชื่อลิงก์',
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
        title: 'สำเร็จ',
        description: 'สร้างลิงก์แชร์เรียบร้อยแล้ว',
      });
    } catch (error: any) {
      console.error('Failed to create link:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: error?.message || 'ไม่สามารถสร้างลิงก์แชร์ได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'คัดลอกแล้ว',
        description: 'ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถคัดลอกลิงก์ได้',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setTitle('');
    setShareUrl('');
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แชร์ข้อมูลการวิเคราะห์</DialogTitle>
          <DialogDescription>
            สร้างลิงก์สาธารณะเพื่อแชร์ข้อมูลการวิเคราะห์นี้ให้ผู้อื่นดู
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!shareUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อลิงก์</Label>
                <Input
                  id="title"
                  placeholder="เช่น ผลการวิเคราะห์ข้าวหอมมะลิ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ลิงก์แชร์</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* QR Code Section */}
              <div className="space-y-2">
                <Label>QR Code</Label>
                <div className="flex flex-col items-center space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <canvas
                    ref={qrCanvasRef}
                    className="border border-gray-300 dark:border-gray-600 rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadQR}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    บันทึก QR Code เป็น PNG
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!shareUrl ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreateLink} disabled={loading}>
                {loading ? 'กำลังสร้าง...' : 'สร้างลิงก์'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              เสร็จสิ้น
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};