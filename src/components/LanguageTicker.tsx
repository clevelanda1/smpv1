import React, { useState, useEffect, useRef } from 'react';

interface Language {
  name: string;
  nativeName: string;
  textColor: string;
}

const languages: Language[] = [
  { name: 'English', nativeName: 'English', textColor: '#0891B2' }, // primary-500
  { name: 'Spanish', nativeName: 'Español', textColor: '#FF6B6B' }, // secondary-500
  { name: 'French', nativeName: 'Français', textColor: '#0891B2' }, // primary-500
  { name: 'Chinese', nativeName: '简体中文', textColor: '#FF6B6B' }, // secondary-500
  { name: 'German', nativeName: 'Deutsch', textColor: '#0891B2' }, // primary-500
  { name: 'Portuguese', nativeName: 'Português', textColor: '#FF6B6B' }, // secondary-500
  { name: 'Italian', nativeName: 'Italiano', textColor: '#0891B2' }, // primary-500
  { name: 'Japanese', nativeName: '日本語', textColor: '#FF6B6B' }, // secondary-500
  { name: 'Russian', nativeName: 'Русский', textColor: '#0891B2' }, // primary-500
  { name: 'Hindi', nativeName: 'हिन्दी', textColor: '#FF6B6B' }, // secondary-500
];

const LanguageTicker: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [itemWidth, setItemWidth] = useState(100); // Adjusted width since we removed the circles
  
  // Calculate how many items we can display
  useEffect(() => {
    const calculateVisibleItems = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newVisibleCount = Math.ceil(containerWidth / itemWidth) + 1;
        setVisibleCount(newVisibleCount);
      }
    };
    
    calculateVisibleItems();
    window.addEventListener('resize', calculateVisibleItems);
    return () => window.removeEventListener('resize', calculateVisibleItems);
  }, [itemWidth]);
  
  // Continuous animation effect
  useEffect(() => {
    if (isPaused) return;
    
    let animationId: number;
    
    const animate = () => {
      setScrollPosition(prev => (prev + 0.5) % (languages.length * itemWidth));
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, itemWidth, languages.length]);
  
  // Create a duplicated array for continuous scrolling
  const displayLanguages = [...languages, ...languages, ...languages];
  
  return (
    <div className="w-full mx-auto">
      <div 
        ref={containerRef}
        className="relative py-1 rounded-xl overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
        
        {/* Scrolling container */}
        <div className="py-4 px-10 overflow-hidden relative">
          <div 
            className="inline-flex"
            style={{ 
              transform: `translateX(-${scrollPosition}px)`,
              transition: 'transform 0.05s linear'
            }}
          >
            {displayLanguages.map((lang, index) => (
              <div 
                key={`${lang.name}-${index}`} 
                className="flex-shrink-0 px-6"
                style={{ width: `${itemWidth}px` }}
              >
                <div className="flex flex-col items-center gap-1 group">
                  {/* Status indicator using accent color - now at the top */}
                  <div className="w-2 h-2 rounded-full bg-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-1"></div>
                  
                  <div className="text-center">
                    {/* Language name with respective color */}
                    <p className="text-base font-semibold" style={{ color: lang.textColor }}>
                      {lang.name}
                    </p>
                    <p className="text-xs text-gray-500">{lang.nativeName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTicker;