import React, { useState } from 'react';
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
import { Copy, Edit, Trash2, ExternalLink, Check } from 'lucide-react';

export const SharedLinksSection: React.FC = () => {
  const { sharedLinks, loading, updateSharedLink, deleteSharedLink, getPublicLink } = useSharedLinks();
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());

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