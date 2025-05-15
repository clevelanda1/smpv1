import React, { useState, useEffect, useRef } from 'react';

interface FeatureCard {
  headline: string;
  description: string;
  color: 'primary' | 'secondary' | 'accent';
}

const featureCards: FeatureCard[] = [
  {
    headline: "Stories as Unique as They Are",
    description: "Create stories that respond to your child's world—their mood, interests, daily experiences, and learning level. No guesswork, just perfectly delivered stories every time.",
    color: 'secondary'
  },
  {
    headline: "Where Stories Become Solutions",
    description: "Big feelings in little hearts need special care. Together, you'll navigate real world problems and overwhelming emotions through stories that open doors to meaningful conversations and deeper bonds.",
    color: 'primary'
  },
  {
    headline: "Small Things That Bring You Closer",
    description: "While other apps isolate family time—ours encourages it. Thoughtful pauses throughout each story spark meaningful moments. Create new memories, not missed opportunities.",
    color: 'accent'
  },
  {
    headline: "Every Child Deserves to Be the Star",
    description: "Watch your child's eyes light up as they become the hero of their own adventures. Build self-esteem and teach valuable life lessons through personalized storytelling.",
    color: 'secondary'
  }
];

const SCROLL_INTERVAL = 5000;
const TRANSITION_DURATION = 900;

const FeatureCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featureCards.length);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, TRANSITION_DURATION);
    }, SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused]);

  const translateX = -currentIndex * 100;

  const getColorClasses = (color: 'primary' | 'secondary' | 'accent', index: number) => {
    const isActive = currentIndex === index;
    const colorMap = {
      primary: {
        bg: 'bg-secondary-50/50',
        gradient: 'from-secondary-600 to-secondary-500'
      },
      secondary: {
        bg: 'bg-primary-50/50',
        gradient: 'from-primary-600 to-primary-500'
      },
      accent: {
        bg: 'bg-accent-50/50',
        gradient: 'from-accent-600 to-accent-500'
      }
    };
    return colorMap[color];
  };

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  };

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100 group hover:shadow-2xl transition-shadow duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={containerRef}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-50 z-10">
        <div 
          className={`h-full transition-all duration-300 ${
            isPaused ? 'transition-none' : ''
          }`}
          style={{ 
            width: `${((currentIndex + 1) / featureCards.length) * 100}%`,
            backgroundColor: currentIndex === 0 ? '#0891B2' : 
                           currentIndex === 1 ? '#FF6B6B' : 
                           currentIndex === 2 ? '#10B981' : '#0891B2'
          }}
        />
      </div>

      {/* Cards Container */}
      <div 
        className={`flex transform ${
          isTransitioning ? 'transition-transform duration-800 ease-in-out' : ''
        }`}
        style={{ transform: `translateX(${translateX}%)` }}
      >
        {featureCards.map((card, index) => {
          const colors = getColorClasses(card.color, index);
          return (
            <div 
              key={index}
              className={`w-full flex-shrink-0 p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-500 ${
                currentIndex === index ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
              }`}
              style={{ minHeight: '400px' }}
            >
              <div className="max-w-2xl mx-auto">
                <h3 className={`text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent
                  transform transition-all duration-500 ${currentIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}>
                  {card.headline}
                </h3>
                
                <p className={`text-gray-600 mx-auto leading-relaxed text-base sm:text-lg
                  transform transition-all duration-500 delay-100 ${currentIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}>
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
        {featureCards.map((card, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all duration-300`}
            style={{
              width: currentIndex === index ? '2rem' : '0.5rem',
              backgroundColor: currentIndex === index ? 
                (card.color === 'primary' ? '#FF6B6B' : 
                 card.color === 'secondary' ? '#0891B2' : '#10B981') : 
                '#E5E7EB'
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Keyboard Navigation */}
      <div className="sr-only">
        <button
          onClick={() => handleDotClick((currentIndex - 1 + featureCards.length) % featureCards.length)}
          aria-label="Previous slide"
        >
          Previous
        </button>
        <button
          onClick={() => handleDotClick((currentIndex + 1) % featureCards.length)}
          aria-label="Next slide"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FeatureCarousel;