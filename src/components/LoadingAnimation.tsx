import { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  onComplete: () => void;
}

export const LoadingAnimation = ({ onComplete }: LoadingAnimationProps) => {
  const [showHeart, setShowHeart] = useState(false);
  const [moveHeart, setMoveHeart] = useState(false);
  const [showCredits, setShowCredits] = useState(true);

  useEffect(() => {
    // Start heart drawing animation immediately
    setShowHeart(true);

    // Start moving heart to top-right after drawing completes (2s)
    const moveTimer = setTimeout(() => {
      setMoveHeart(true);
      setShowCredits(false);
    }, 2000);

    // Complete animation and reveal site
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2300);

    return () => {
      clearTimeout(moveTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      {showHeart && (
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          className={`transition-all duration-300 ${
            moveHeart ? 'fixed top-4 right-4 w-16 h-16' : ''
          }`}
          style={{
            transform: moveHeart ? 'scale(0.5)' : 'scale(1)',
          }}
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke="#ec4899"
            strokeWidth="2"
            fill="none"
            className="heart-path"
            style={{
              strokeDasharray: 100,
              strokeDashoffset: 100,
              animation: 'drawHeart 2s ease-in-out forwards',
            }}
          />
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="#ec4899"
            className="heart-fill"
            style={{
              opacity: 0,
              animation: 'fillHeart 0.3s ease-in-out 1.7s forwards',
            }}
          />
        </svg>
      )}
      {showCredits && (
        <p className="fixed bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground text-sm animate-fade-in">
          made with ❤️ by dangdump and EmphathyTokens
        </p>
      )}
    </div>
  );
};
