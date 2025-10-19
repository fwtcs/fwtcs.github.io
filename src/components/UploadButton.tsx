import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { UploadDialog } from './UploadDialog';

export const UploadButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 px-6 z-50"
      >
        <Upload className="w-5 h-5 mr-2" />
        Tải ảnh
      </Button>

      <UploadDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
