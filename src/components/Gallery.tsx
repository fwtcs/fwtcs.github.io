import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GalleryCard from "./GalleryCard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Clock, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  status: string;
  created_at: string;
}

const Gallery = () => {
  const { isAdmin } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  const { data: images, isLoading, refetch } = useQuery({
    queryKey: ['gallery-images', isAdmin],
    queryFn: async () => {
      const query = supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!isAdmin) {
        query.eq('status', 'approved');
      } else {
        query.in('status', ['approved', 'pending']);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GalleryImage[];
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('gallery-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'gallery_images' },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleModerateImage = async (imageId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ status })
        .eq('id', imageId);

      if (error) throw error;

      toast.success(`Ảnh đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}!`);
      refetch();
    } catch (error) {
      console.error('Lỗi khi duyệt ảnh:', error);
      toast.error('Không thể cập nhật trạng thái ảnh');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Xóa ảnh thành công!');
      refetch();
    } catch (error) {
      console.error('Lỗi khi xóa ảnh:', error);
      toast.error('Không thể xóa ảnh');
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-primary via-purple-600 to-gold bg-clip-text text-transparent">
            Kho ảnh
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Kho ảnh của lớp A5 — nhấn vào ảnh để xem kích thước đầy đủ hoặc xem thêm thông tin.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : images && images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {images.map((item, index) => (
                <div key={item.id} className="relative group">
                  <GalleryCard 
                    image={item.image_url} 
                    title={item.title}
                    description={item.description}
                    index={index}
                    onClick={() => item.status === 'approved' && setSelectedImage(item)}
                  />
                  
                  {item.status === 'pending' && (
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center gap-4 p-4">
                      <div className="bg-yellow-500/90 text-black px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold">
                        <Clock className="w-4 h-4" />
                        Đang chờ duyệt
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleModerateImage(item.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleModerateImage(item.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {isAdmin && item.status === 'approved' && (
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có ảnh nào trong kho</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
          {selectedImage && (
            <div className="relative">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">{selectedImage.title}</h2>
                {selectedImage.description && (
                  <p className="text-muted-foreground mt-2">{selectedImage.description}</p>
                )}
              </div>
              <div className="p-4">
                {selectedImage.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video 
                    src={selectedImage.image_url} 
                    controls 
                    className="w-full rounded-lg"
                  />
                ) : (
                  <img 
                    src={selectedImage.image_url} 
                    alt={selectedImage.title}
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;
