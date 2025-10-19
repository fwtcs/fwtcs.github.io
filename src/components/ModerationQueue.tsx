import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Check, X, Loader2 } from 'lucide-react';

interface PendingImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

export const ModerationQueue = () => {
  const [images, setImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingImages = async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load pending images');
      return;
    }

    setImages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingImages();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('moderation-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'gallery_images' },
        () => fetchPendingImages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleModerate = async (imageId: string, newStatus: 'approved' | 'rejected') => {
    setProcessing(imageId);

    const { error } = await supabase
      .from('gallery_images')
      .update({ status: newStatus })
      .eq('id', imageId);

    setProcessing(null);

    if (error) {
      toast.error('Failed to update image status');
    } else {
      toast.success(`Image ${newStatus}!`);
      fetchPendingImages();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No images pending moderation</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <img
            src={image.image_url}
            alt={image.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{image.title}</h3>
              {image.description && (
                <p className="text-sm text-muted-foreground mt-1">{image.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(image.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleModerate(image.id, 'approved')}
                disabled={processing === image.id}
                className="flex-1"
              >
                {processing === image.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleModerate(image.id, 'rejected')}
                disabled={processing === image.id}
                variant="destructive"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
