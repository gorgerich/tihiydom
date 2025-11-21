import { ImageWithFallback } from './figma/ImageWithFallback';
import heroImage from 'figma:asset/13412c9ae8b313012ddb57cee49b5544e6d54e6f.png';

export function HeroSection() {
  return (
    <section className="relative w-full px-4 pt-8 pb-16 md:pb-20 lg:pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Hero Image Container with Rounded Corners */}
        <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[75vh] rounded-3xl md:rounded-[40px] overflow-hidden">
          {/* Background Image */}
          <img
            src={heroImage}
            alt="Тихая Память"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/75" />
          
          {/* Text Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-6 text-center -translate-y-[15%]">
            {/* Main Heading */}
            <h1 className="text-white mb-4 max-w-3xl tracking-tight drop-shadow-2xl mx-auto" style={{ fontFamily: 'var(--font-family-serif)', textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)' }}>
              {/* Mobile version */}
              <span className="md:hidden block text-2xl mx-auto" style={{ maxWidth: '340px', fontWeight: 40, transform: 'translateY(20%)' }}>
                Цифровой помощник по самостоятельной организации прощания без агентств и давления
              </span>
              {/* Desktop version */}
              <span className="hidden md:block" style={{ fontFamily: 'var(--font-family-display)', fontWeight: 40 }}>
                <span className="block text-3xl lg:text-4xl xl:text-5xl mb-1">
                  Цифровой помощник по самостоятельной
                </span>
                <span className="block text-3xl lg:text-4xl xl:text-5xl">
                  организации прощания без агентств и давления
                </span>
              </span>
            </h1>
            
            {/* Subtitle */}

          </div>
        </div>
      </div>
    </section>
  );
}