import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  image_url: string | null;
  social_link_1: string | null;
  social_link_2: string | null;
}

interface EditProfileDialogProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog = ({ profile, open, onOpenChange }: EditProfileDialogProps) => {
  const [name, setName] = useState(profile.name);
  const [socialLink1, setSocialLink1] = useState(profile.social_link_1 || '');
  const [socialLink2, setSocialLink2] = useState(profile.social_link_2 || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(profile.image_url || '');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      console.error('Lỗi khi tải ảnh:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const normalizeUrl = (url: string): string => {
    if (!url || !url.trim()) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalizedLink1 = normalizeUrl(socialLink1);
      const normalizedLink2 = normalizeUrl(socialLink2);

      const { error } = await supabase
        .from('hall_of_fame')
        .update({
          name,
          image_url: imageUrl || null,
          social_link_1: normalizedLink1 || null,
          social_link_2: normalizedLink2 || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Cập nhật hồ sơ thành công!');
      onOpenChange(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật hồ sơ:', error);
      toast.error('Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* námepase */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên..."
            />
          </div>

          {/* avn */}
          <div className="space-y-2">
            <Label htmlFor="image">Ảnh đại diện</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Xem trước ảnh" 
                className="w-full h-40 object-cover rounded-lg mt-2"
              />
            )}
          </div>

          {/* 11 */}
          <div className="space-y-2">
            <Label htmlFor="social1">Liên kết mạng xã hội #1</Label>
            <Input
              id="social1"
              value={socialLink1}
              onChange={(e) => setSocialLink1(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* 22 */}
          <div className="space-y-2">
            <Label htmlFor="social2">Liên kết mạng xã hội #2</Label>
            <Input
              id="social2"
              value={socialLink2}
              onChange={(e) => setSocialLink2(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* act */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
