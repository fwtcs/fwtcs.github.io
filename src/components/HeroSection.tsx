import heroBg from "@/assets/hero-bg-new.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background image - blurred */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px)",
        }}
      />

      {/* Floating hearts animation */}
      <div className="absolute inset-0 overflow-hidden z-5">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-heart"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-60px',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              className="text-pink-500/30"
              style={{
                transform: `scale(${0.8 + Math.random() * 1.2})`,
              }}
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="relative bg-white/95 rounded-lg shadow-2xl p-8 md:p-12 max-w-3xl mx-auto border-2 border-pink-500 transform rotate-1">
          {/* Corner hearts */}
          <div className="absolute -top-3 -left-3">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-pink-500">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                fill="currentColor"
              />
            </svg>
          </div>
          
          {/* Large outlined heart on the right */}
          <div className="absolute -top-6 -right-6 rotate-12">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" className="text-pink-500">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="white"
              />
            </svg>
          </div>

          {/* Decorative leaves - left */}
          <div className="absolute bottom-4 left-4 opacity-20">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="text-gray-400">
              <path d="M20 80 Q30 60, 40 50 Q50 40, 50 20" stroke="currentColor" strokeWidth="2" fill="none"/>
              <ellipse cx="35" cy="65" rx="8" ry="15" fill="currentColor" transform="rotate(-30 35 65)"/>
              <ellipse cx="45" cy="45" rx="8" ry="15" fill="currentColor" transform="rotate(-20 45 45)"/>
              <ellipse cx="48" cy="28" rx="6" ry="12" fill="currentColor" transform="rotate(-10 48 28)"/>
            </svg>
          </div>

          {/* Decorative leaves - right */}
          <div className="absolute bottom-4 right-4 opacity-20">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="text-gray-400">
              <path d="M80 80 Q70 60, 60 50 Q50 40, 50 20" stroke="currentColor" strokeWidth="2" fill="none"/>
              <ellipse cx="65" cy="65" rx="8" ry="15" fill="currentColor" transform="rotate(30 65 65)"/>
              <ellipse cx="55" cy="45" rx="8" ry="15" fill="currentColor" transform="rotate(20 55 45)"/>
              <ellipse cx="52" cy="28" rx="6" ry="12" fill="currentColor" transform="rotate(10 52 28)"/>
            </svg>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold text-purple-800 mb-3 tracking-tight"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Chúc mừng ngày
          </h1>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="bg-purple-700 text-white px-5 py-1.5 rounded-full text-sm font-semibold uppercase">
              Phụ nữ Việt Nam
            </span>
          </div>

          <div className="text-6xl md:text-8xl font-bold text-purple-900 mb-6">
            20/10
          </div>

          <p className="text-base md:text-lg text-purple-800/80 leading-relaxed max-w-xl mx-auto">
            Ngày hôm nay là dịp tôn vinh vẻ đẹp và tài năng của phụ nữ Việt Nam. Chúc các bạn nữ lớp A5 luôn tỏa sáng, tự tin và hạnh phúc trên con đường cuộc sống. Mong rằng những điều tốt đẹp sẽ đến với các bạn. Chúc mừng ngày 20/10!
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
