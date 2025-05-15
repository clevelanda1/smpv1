import React from 'react';
import { SkipBack, Settings, Type } from 'lucide-react';
import { ScrollControlState } from '../../types';
import { Bookmark, Sliders, Play, Pause, SkipStart } from 'react-bootstrap-icons';

interface ScrollControlsProps {
  controls: ScrollControlState;
  setControls: React.Dispatch<React.SetStateAction<ScrollControlState>>;
  onReset: () => void;
}

const ScrollControls: React.FC<ScrollControlsProps> = ({
  controls,
  setControls,
  onReset,
}) => {
  const toggleScrolling = () => {
    setControls(prev => ({ ...prev, isScrolling: !prev.isScrolling }));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseInt(e.target.value);
    setControls(prev => ({ ...prev, scrollSpeed: speed }));
  };

  const handleTextSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value);
    setControls(prev => ({ ...prev, textSize: size }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
        <Sliders className="w-5 h-5" />
        Reading Controls
      </h3>
      
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Restart story"
        >
          <SkipStart className="w-4 h-4" />
          <span className="text-sm">Restart</span>
        </button>
        
        <button
          onClick={toggleScrolling}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
            ${
              controls.isScrolling 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-accent-100 text-accent-500 hover:bg-accent-200'
            }
          `}
          aria-label={controls.isScrolling ? 'Pause scrolling' : 'Start scrolling'}
        >
          {controls.isScrolling ? (
            <>
              <Pause className="w-4 h-4" />
              <span className="text-sm">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span className="text-sm">Play</span>
            </>
          )}
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Reading Speed</span>
            <span className="font-medium text-primary-600">{controls.scrollSpeed}/10</span>
          </div>
          
          <input
            type="range"
            min="1"
            max="10"
            value={controls.scrollSpeed}
            onChange={handleSpeedChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Slower</span>
            <span>Faster</span>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text Size
            </span>
            <span className="font-medium text-primary-600">{controls.textSize}/5</span>
          </div>
          
          <input
            type="range"
            min="1"
            max="5"
            value={controls.textSize}
            onChange={handleTextSizeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Smaller</span>
            <span>Larger</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollControls;