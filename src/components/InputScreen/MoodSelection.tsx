import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const moods = [
  // Positive moods
  'Happy', 'Excited', 'Curious', 'Silly', 'Calm', 'Brave',
  'Proud', 'Confident', 'Grateful', 'Peaceful', 'Energetic', 'Loving',
  // Challenging moods
  'Sad', 'Worried', 'Angry', 'Scared', 'Shy', 'Confused',
  'Frustrated', 'Lonely', 'Jealous', 'Nervous', 'Overwhelmed', 'Disappointed'
];

const MOODS_PER_PAGE = {
  default: 8,
  sm: 6,
  xs: 4
};

const MAX_MOODS = 3;

type MoodSelectionProps = {
  selectedMoods: string[];
  onChange: (moods: string[]) => void;
};

const MoodSelection: React.FC<MoodSelectionProps> = ({ selectedMoods, onChange }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMoodsPerPage = () => {
    if (windowWidth < 475) return MOODS_PER_PAGE.xs;
    if (windowWidth < 640) return MOODS_PER_PAGE.sm;
    return MOODS_PER_PAGE.default;
  };

  const moodsPerPage = getMoodsPerPage();
  const totalPages = Math.ceil(moods.length / moodsPerPage);
  
  const currentMoods = moods.slice(
    currentPage * moodsPerPage,
    (currentPage + 1) * moodsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const toggleMood = (mood: string) => {
    if (selectedMoods.includes(mood)) {
      onChange(selectedMoods.filter(m => m !== mood));
    } else if (selectedMoods.length < MAX_MOODS) {
      onChange([...selectedMoods, mood]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={prevPage}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Previous moods"
          disabled={currentPage === 0}
        >
          <ChevronLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${currentPage === 0 ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>
        
        <div className="flex-1 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
          {currentMoods.map((mood) => (
            <button
              key={mood}
              className={`
                py-2 sm:py-3 px-3 sm:px-4 rounded-full text-center transition-all relative text-sm sm:text-base
                ${
                  selectedMoods.includes(mood)
                    ? 'bg-secondary-500 text-white font-medium shadow-md'
                    : 'bg-white border border-gray-200 hover:border-secondary-300 hover:shadow-sm'
                }
                ${
                  !selectedMoods.includes(mood) && selectedMoods.length >= MAX_MOODS
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }
              `}
              onClick={() => toggleMood(mood)}
              disabled={!selectedMoods.includes(mood) && selectedMoods.length >= MAX_MOODS}
            >
              <span className="line-clamp-1">{mood}</span>
              {selectedMoods.includes(mood) && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {selectedMoods.indexOf(mood) + 1}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <button
          onClick={nextPage}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Next moods"
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${currentPage === totalPages - 1 ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>
      </div>
      
      <div className="mt-2 flex justify-between items-center text-xs sm:text-sm">
        <div className="text-gray-500">
          Page {currentPage + 1} of {totalPages}
        </div>
        <div className="text-gray-600">
          {selectedMoods.length}/{MAX_MOODS} selected
        </div>
      </div>
    </div>
  );
};

export default MoodSelection;