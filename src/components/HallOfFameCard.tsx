import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Lock, Unlock, Link } from 'lucide-react';
import { EditProfileDialog } from './EditProfileDialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HallOfFameProfile {
  id: string;
  name: string;
  image_url: string | null;
  social_link_1: string | null;
  social_link_2: string | null;
  position: number;
  locked: boolean;
}

interface HallOfFameCardProps {
  profile: HallOfFameProfile;
  index: number;
}

const HallOfFameCard = ({ profile, index }: HallOfFameCardProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAdmin } = useAuth();

  const handleToggleLock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('hall_of_fame')
        .update({ locked: !profile.locked })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success(profile.locked ? 'Đã mở khóa mục này' : 'Đã khóa mục này');
    } catch (error) {
      console.error('Lỗi khi đổi trạng thái khóa:', error);
      toast.error('Không thể cập nhật trạng thái khóa');
    }
  };

  return (
    <>
      <div 
        className="relative aspect-square overflow-hidden rounded-2xl shadow-elegant transition-smooth hover:scale-105 hover:shadow-glow animate-fade-in cursor-pointer group"
        style={{ animationDelay: `${index * 0.03}s` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {profile.image_url ? (
          <img 
            src={profile.image_url} 
            alt={profile.name}
            className="w-full h-full object-cover transition-smooth group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Không có ảnh</span>
          </div>
        )}
        
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            <h3 className="text-primary-foreground text-xl font-semibold">
              {profile.name}
            </h3>
            <div className="flex flex-col gap-1 text-sm">
              {profile.social_link_1 && (
                <a
                  href={profile.social_link_1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/90 hover:text-primary-foreground transition-colors flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {profile.social_link_1.length > 30 
                      ? `${profile.social_link_1.slice(0, 30)}...` 
                      : profile.social_link_1}
                  </span>
                </a>
              )}
              {profile.social_link_2 && (
                <a
                  href={profile.social_link_2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/90 hover:text-primary-foreground transition-colors flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {profile.social_link_2.length > 30 
                      ? `${profile.social_link_2.slice(0, 30)}...` 
                      : profile.social_link_2}
                  </span>
                </a>
              )}
              {!profile.social_link_1 && !profile.social_link_2 && (
                <span className="text-primary-foreground/70 text-sm">🔗 Không có liên kết</span>
              )}
            </div>
            
            <div className="flex gap-2 mt-2">
              {!profile.locked && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEdit(true);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Chỉnh sửa
                </Button>
              )}
              {isAdmin && (
                <Button
                  size="sm"
                  variant={profile.locked ? "destructive" : "default"}
                  onClick={handleToggleLock}
                  className={profile.locked ? "" : "flex-1"}
                >
                  {profile.locked ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Đã khóa
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 mr-1" />
                      Khóa
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditProfileDialog
        profile={profile}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </>
  );
};

export default HallOfFameCard;
