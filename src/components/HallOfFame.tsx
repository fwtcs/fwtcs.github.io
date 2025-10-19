import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HallOfFameCard from "./HallOfFameCard";
import { Loader2 } from "lucide-react";

interface HallOfFameProfile {
  id: string;
  name: string;
  image_url: string | null;
  social_link_1: string | null;
  social_link_2: string | null;
  position: number;
  locked: boolean;
}

const HallOfFame = () => {
  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ['hall-of-fame'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hall_of_fame')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as HallOfFameProfile[];
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('hall-of-fame-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'hall_of_fame' },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-primary via-purple-600 to-gold bg-clip-text text-transparent">
            Đại sảnh danh dự
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Kho ✨ females ✨ của lớp A5. Nhấn vào ảnh để xem thêm thông tin.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : profiles && profiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {profiles.map((profile, index) => (
                <HallOfFameCard 
                  key={profile.id} 
                  profile={profile}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có dữ liệu.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HallOfFame;
