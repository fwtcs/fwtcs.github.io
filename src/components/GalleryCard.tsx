interface GalleryCardProps {
  image: string;
  title: string;
  description?: string | null;
  index: number;
  onClick: () => void;
}

const GalleryCard = ({ image, title, description, index, onClick }: GalleryCardProps) => {
  const isVideo = image.match(/\.(mp4|webm|ogg)$/i);
  
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl shadow-elegant transition-smooth hover:scale-105 hover:shadow-glow animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
    >
      <div className="aspect-[4/5] overflow-hidden">
        {isVideo ? (
          <video 
            src={image} 
            className="w-full h-full object-cover transition-smooth group-hover:scale-110"
          />
        ) : (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-smooth group-hover:scale-110"
          />
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-smooth">
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-primary-foreground text-xl font-semibold">
            {title}
          </h3>
          {description && (
            <p className="text-primary-foreground/90 text-sm mt-2">
              {description}
            </p>
          )}
        </div>
      </div>
      
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
        <svg 
          className="w-5 h-5 text-primary" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    </div>
  );
};

export default GalleryCard;
