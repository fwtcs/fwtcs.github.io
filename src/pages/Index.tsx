import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import HeroSection from "@/components/HeroSection";
import HallOfFame from "@/components/HallOfFame";
import Gallery from "@/components/Gallery";
import { UploadButton } from '@/components/UploadButton';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Index = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);
  const [hasShownLoading, setHasShownLoading] = useState(false);

  useEffect(() => {
    // Check if loading animation has been shown in this session
    const hasSeenAnimation = sessionStorage.getItem('hasSeenAnimation');
    if (hasSeenAnimation) {
      setShowLoading(false);
      setHasShownLoading(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setHasShownLoading(true);
    sessionStorage.setItem('hasSeenAnimation', 'true');
  };

  if (showLoading && !hasShownLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} />;
  }

  return (
    <main className="min-h-screen animate-fade-in">
      <HeroSection />
      <HallOfFame />
      <Gallery />
      <UploadButton />
      
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              © 2025 dd.std - Được tạo để chúc mừng ngày 20/10
            </p>
          </div>
          
          {user ? (
            isAdmin ? (
              <div className="flex justify-center">
                <Button onClick={() => navigate('/moderation')} variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Elevation: 1
                </Button>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Logged in! - Elevation: 0
              </p>
            )
          ) : (
            <div className="flex justify-center">
              <Button onClick={() => navigate('/auth')} variant="outline">
                login
              </Button>
            </div>
          )}
        </div>
      </footer>
    </main>
  );
};

export default Index;
