import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Crop } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import Cropper from 'react-easy-crop';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const uploadSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(100, 'Tiêu đề quá dài'),
  description: z.string().max(500, 'Mô tả quá dài').optional(),
  file: z.instanceof(File).refine((file) => file.size <= 25 * 1024 * 1024, "Kích thước tệp phải nhỏ hơn 25MB")
});

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UploadDialog = ({ open, onOpenChange }: UploadDialogProps) => {
  const { isAdmin } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Không có ngữ cảnh 2D');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas trống'));
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropSave = async () => {
    if (cropIndex === null || !croppedAreaPixels) return;

    try {
      const croppedBlob = await createCroppedImage(previews[cropIndex], croppedAreaPixels);
      const croppedFile = new File([croppedBlob], files[cropIndex].name, { type: 'image/jpeg' });
      
      const newFiles = [...files];
      newFiles[cropIndex] = croppedFile;
      
      const newPreviews = [...previews];
      URL.revokeObjectURL(newPreviews[cropIndex]);
      newPreviews[cropIndex] = URL.createObjectURL(croppedFile);
      
      setFiles(newFiles);
      setPreviews(newPreviews);
      setCropIndex(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      toast.success('Cắt ảnh thành công');
    } catch (error) {
      toast.error('Cắt ảnh thất bại');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`${file.name}: Vui lòng chọn tệp ảnh hoặc video`);
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name}: Tệp phải nhỏ hơn 25MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setFiles(validFiles);
    setPreviews(validFiles.map(file => URL.createObjectURL(file)));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(filePath);

        const imageTitle = !title.trim() ? 'none' : title;

        const { error: dbError } = await supabase
          .from('gallery_images')
          .insert({
            title: imageTitle,
            description: description || null,
            image_url: publicUrl,
            status: isAdmin ? 'approved' : 'pending'
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);

      const message = isAdmin 
        ? `Đã tải lên và duyệt ${files.length} hình ảnh!` 
        : `Đã tải lên ${files.length} hình ảnh! Đang chờ duyệt.`;
      toast.success(message);
      
      setTitle('');
      setDescription('');
      setFiles([]);
      setPreviews([]);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cropIndex !== null ? 'Cắt ảnh' : 'Tải ảnh lên'}</DialogTitle>
        </DialogHeader>

        {cropIndex !== null ? (
          <div className="space-y-4">
            <div className="relative w-full h-96 bg-black rounded-md">
              <Cropper
                image={previews[cropIndex]}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div>
              <Label>Phóng to / Thu nhỏ</Label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCropSave} className="flex-1">
                Lưu vùng cắt
              </Button>
              <Button onClick={() => setCropIndex(null)} variant="outline" className="flex-1">
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
          <div>
            <Label htmlFor="file">Ảnh{isAdmin ? ' (có thể chọn nhiều)' : ''}</Label>
            <div className="mt-2">
              {previews.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        {files[index]?.type.startsWith('video/') ? (
                          <video src={preview} controls className="w-full h-24 rounded-md object-cover" />
                        ) : (
                          <>
                            <img src={preview} alt={`Xem trước ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
                              onClick={() => setCropIndex(index)}
                            >
                              <Crop className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      setFiles([]);
                      setPreviews([]);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Xóa tất cả ({files.length})
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Nhấn để tải ảnh{isAdmin ? '' : ''} hoặc video
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Tối đa 25MB{isAdmin ? ' mỗi tệp' : ''}
                  </span>
                </label>
              )}
              <Input
                id="file"
                type="file"
                accept="image/*,video/*"
                multiple={isAdmin}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">
              Tiêu đề (Tùy chọn - sẽ dùng "none" nếu để trống)
            </Label>
            <Input
              id="title"
              placeholder="vd: Lớp trưởng"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả (tùy chọn)</Label>
            <Textarea
              id="description"
              placeholder="Thêm mô tả..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full"
          >
            {uploading ? 'Đang tải...' : `Tải lên ${files.length > 1 ? `${files.length} ảnh` : 'ảnh'}`}
          </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
