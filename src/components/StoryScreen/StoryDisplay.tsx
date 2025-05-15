import React, { useState, useEffect, useRef } from 'react';
import { useStory } from '../../context/StoryContext';
import { useAuth } from '../../context/AuthContext';
import { ScrollControlState } from '../../types';
import { Bookmark } from 'react-bootstrap-icons';
import StoryRating from './StoryRating';
import ScrollControls from './ScrollControls';
import { supabase } from '../../lib/supabase';
import { FileText, ChevronLeft, ChevronRight, ArrowLeft } from 'react-bootstrap-icons';

const StoryDisplay: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state } = useStory();
  const { user } = useAuth();
  const storyRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const [currentStory, setCurrentStory] = useState(state.story);
  const [currentStoryInput, setCurrentStoryInput] = useState(state.input);
  const [savedStories, setSavedStories] = useState<any[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [lastStory, setLastStory] = useState<any>(null);
  const [customCharacters, setCustomCharacters] = useState<Record<string, string>>({});
  const [scrollControls, setScrollControls] = useState<ScrollControlState>({
    isScrolling: false,
    scrollSpeed: 5,
    textSize: 3,
  });

  useEffect(() => {
    if (user) {
      loadSavedStories();
      loadLastStory();
      fetchCustomCharacters();
    }
  }, [user]);

  useEffect(() => {
    // Clean up scroll interval on unmount
    return () => {
      if (scrollIntervalRef.current) {
        window.clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollControls.isScrolling) {
      // Start scrolling
      const speed = 11 - scrollControls.scrollSpeed; // Invert speed (1 = fastest, 10 = slowest)
      scrollIntervalRef.current = window.setInterval(() => {
        if (storyRef.current) {
          storyRef.current.scrollTop += 1;

          // Check if we've reached the bottom
          const { scrollTop, scrollHeight, clientHeight } = storyRef.current;
          if (scrollTop + clientHeight >= scrollHeight) {
            setScrollControls(prev => ({ ...prev, isScrolling: false }));
            if (scrollIntervalRef.current) {
              window.clearInterval(scrollIntervalRef.current);
              scrollIntervalRef.current = null;
            }
          }
        }
      }, speed * 10); // Adjust scroll speed (50ms - 500ms interval)
    } else {
      // Stop scrolling
      if (scrollIntervalRef.current) {
        window.clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
  }, [scrollControls.isScrolling, scrollControls.scrollSpeed]);

  const fetchCustomCharacters = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_characters')
        .select('id, name');

      if (error) throw error;

      const characterMap = (data || []).reduce((acc: Record<string, string>, char) => {
        acc[char.id] = char.name;
        return acc;
      }, {});

      setCustomCharacters(characterMap);
    } catch (error) {
      console.error('Error fetching custom characters:', error);
    }
  };

  const getCharacterName = (characterId: string) => {
    // Check if it's a custom character
    if (customCharacters[characterId]) {
      return customCharacters[characterId];
    }

    // Default character mapping
    const defaultCharacters: Record<string, string> = {
      'dog': 'Buddy the Dog',
      'cat': 'Luna the Cat',
      'mouse': 'Pip the Mouse',
      'rabbit': 'Hop the Rabbit',
      'duck': 'Waddles the Duck',
      'bird': 'Sky the Bird',
      'bear': 'Bruno the Bear',
      'lion': 'Leo the Lion',
      'tiger': 'Raja the Tiger',
      'elephant': 'Echo the Elephant',
      'monkey': 'Milo the Monkey',
      'princess': 'Princess Luna',
      'superhero': 'Captain Awesome',
      'explorer': 'Explorer Max',
      'unicorn': 'Sparkle the Unicorn',
      'dragon': 'Drake the Dragon',
      'wizard': 'Merlin the Wizard',
      'storyteller': 'Storyteller Sam'
    };

    return defaultCharacters[characterId] || characterId;
  };

  const loadLastStory = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_stories')
        .select('*')
        .eq('user_id', user?.id)
        .eq('rating', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setLastStory(data);
      if (data && !state.story) {
        setCurrentStory(data.story_content);
        setCurrentStoryInput(data.story_input);
        setCurrentStoryIndex(0);
      }
    } catch (error) {
      console.error('Error loading last story:', error);
    }
  };

  const loadSavedStories = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_stories')
        .select('*')
        .eq('user_id', user?.id)
        .eq('rating', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedStories(data || []);
    } catch (error) {
      console.error('Error loading saved stories:', error);
    }
  };

  const getStoryLabel = () => {
    if (currentStoryIndex === 0) {
      return 'Last Story';
    }
    return `Story ${currentStoryIndex} of ${savedStories.length}`;
  };

  const navigateStories = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (currentStoryIndex === 0) {
        // Moving from last story to first saved story
        if (savedStories.length > 0) {
          setCurrentStory(savedStories[0].story_content);
          setCurrentStoryInput(savedStories[0].story_input);
          setCurrentStoryIndex(1);
        }
      } else {
        const nextIndex = currentStoryIndex === savedStories.length ? 0 : currentStoryIndex + 1;
        if (nextIndex === 0) {
          // Return to last story
          const storyToShow = state.story || lastStory?.story_content;
          const inputToShow = state.input || lastStory?.story_input;
          setCurrentStory(storyToShow);
          setCurrentStoryInput(inputToShow);
        } else {
          setCurrentStory(savedStories[nextIndex - 1].story_content);
          setCurrentStoryInput(savedStories[nextIndex - 1].story_input);
        }
        setCurrentStoryIndex(nextIndex);
      }
    } else {
      if (currentStoryIndex === 0 && savedStories.length > 0) {
        // From last story to last saved story
        setCurrentStory(savedStories[savedStories.length - 1].story_content);
        setCurrentStoryInput(savedStories[savedStories.length - 1].story_input);
        setCurrentStoryIndex(savedStories.length);
      } else if (currentStoryIndex === 1) {
        // From first saved story to last story
        const storyToShow = state.story || lastStory?.story_content;
        const inputToShow = state.input || lastStory?.story_input;
        setCurrentStory(storyToShow);
        setCurrentStoryInput(inputToShow);
        setCurrentStoryIndex(0);
      } else {
        // Navigate through saved stories
        const prevIndex = currentStoryIndex - 1;
        setCurrentStory(savedStories[prevIndex - 1].story_content);
        setCurrentStoryInput(savedStories[prevIndex - 1].story_input);
        setCurrentStoryIndex(prevIndex);
      }
    }
    
    if (storyRef.current) {
      storyRef.current.scrollTop = 0;
      setScrollControls(prev => ({ ...prev, isScrolling: false }));
    }
  };

  const handleReset = () => {
    if (storyRef.current) {
      storyRef.current.scrollTop = 0;
      setScrollControls(prev => ({ ...prev, isScrolling: false }));
    }
  };

  const formatParenthesesText = (text: string) => {
    return text.replace(/(\([^)]+\))/g, '<span class="text-primary-300">$1</span>');
  };

  const getTextSizeClasses = (baseSize: string) => {
    const sizes = {
      1: 'text-sm sm:text-base',
      2: 'text-base sm:text-lg',
      3: 'text-lg sm:text-xl',
      4: 'text-xl sm:text-2xl',
      5: 'text-2xl sm:text-3xl',
    };
    return sizes[scrollControls.textSize as keyof typeof sizes] || baseSize;
  };

  const formatStory = (text: string) => {
    if (!text) return null;

    try {
      const jsonStory = JSON.parse(text);
      if (jsonStory.chapters) {
        return jsonStory.chapters.map((chapter: any, index: number) => (
          <div key={index} className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-600 mb-4 sm:mb-6">
              {chapter.chapterTitle || `Chapter ${index + 1}`}
            </h2>
            {chapter.content.split('\n').map((paragraph: string, pIndex: number) => (
              <p 
                key={`${index}-${pIndex}`} 
                className={`${getTextSizeClasses('text-base sm:text-lg')} leading-relaxed mb-4 sm:mb-6`}
                dangerouslySetInnerHTML={{ __html: formatParenthesesText(paragraph.trim()) }}
              />
            ))}
          </div>
        ));
      }
      if (jsonStory.title && jsonStory.story) {
        return (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
              {jsonStory.title}
            </h1>
            {jsonStory.story.split('\n').map((paragraph: string, index: number) => (
              <p 
                key={index} 
                className={`${getTextSizeClasses('text-base sm:text-lg')} leading-relaxed mb-4 sm:mb-6`}
                dangerouslySetInnerHTML={{ __html: formatParenthesesText(paragraph.trim()) }}
              />
            ))}
          </>
        );
      }
    } catch (e) {
      // If not JSON, process as plain text
    }

    // Handle plain text with natural breaks
    const sections = text
      .split(/\n\n+/)
      .filter(section => section.trim().length > 0);

    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim().length > 0);
      
      const isTitle = lines[0] && (
        lines[0].includes('Chapter') ||
        lines[0].length < 50 ||
        /^[A-Z][^.!?]*$/.test(lines[0])
      );

      if (isTitle && lines.length > 1) {
        return (
          <div key={index} className="mb-6 sm:mb-8">
            {index === 0 ? (
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">{lines[0]}</h1>
            ) : (
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-600 mb-4 sm:mb-6">{lines[0]}</h2>
            )}
            {lines.slice(1).map((line, lineIndex) => (
              <p 
                key={`${index}-${lineIndex}`} 
                className={`${getTextSizeClasses('text-base sm:text-lg')} leading-relaxed mb-4 sm:mb-6`}
                dangerouslySetInnerHTML={{ __html: formatParenthesesText(line.trim()) }}
              />
            ))}
          </div>
        );
      }

      return lines.map((line, lineIndex) => (
        <p 
          key={`${index}-${lineIndex}`} 
          className={`${getTextSizeClasses('text-base sm:text-lg')} leading-relaxed mb-4 sm:mb-6`}
          dangerouslySetInnerHTML={{ __html: formatParenthesesText(line.trim()) }}
        />
      ));
    });
  };

  // Show message if no stories available
  if (!state.story && !lastStory && savedStories.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors rounded-lg hover:bg-primary-50 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Create Story
        </button>
        <div className="text-center text-gray-600">
          No saved stories found. Create a new story to get started!
        </div>
      </div>
    );
  }

  const showNavigationControls = Boolean(state.story || lastStory || savedStories.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors rounded-lg hover:bg-primary-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Create Story
        </button>
        
        {showNavigationControls && (
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigateStories('prev')}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Previous story"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <span className="text-sm text-gray-600">
              {getStoryLabel()}
            </span>

            <button
              onClick={() => navigateStories('next')}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Next story"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-accent-500 to-accent-400 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  A Story for {currentStoryInput?.childName || 'Your Child'}
                </h3>
              </div>

              <span className="text-xs sm:text-sm bg-white/10 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-white/90 font-medium">
                {currentStoryInput?.storyLength || '5'} minutes
              </span>
            </div>
          </div>
          
          <div 
            ref={storyRef}
            className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-[65vh] lg:h-[75vh] story-container"
          >
            <div className="prose max-w-none prose-primary">
              {formatStory(currentStory)}
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-72 flex flex-col gap-4 sm:gap-6">
          <ScrollControls
            controls={scrollControls}
            setControls={setScrollControls}
            onReset={handleReset}
          />
          
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-4 sm:p-6 border border-primary-100/0">
            <h3 className="font-medium text-primary-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              Story Details
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li className="flex items-center justify-between">
                <span className="text-gray-600">Development Stage</span>
                <span className="font-medium text-primary-700">
                  {currentStoryInput?.developmentalStage || 'Not specified'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-600">Characters</span>
                <span className="font-medium text-primary-700">
                  {currentStoryInput?.characters?.map(getCharacterName).join(', ') || 'Not specified'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-600">Moods</span>
                <span className="font-medium text-primary-700">
                  {currentStoryInput?.childMoods?.join(', ') || 'Not specified'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-600">Language</span>
                <span className="font-medium text-primary-700">
                  {currentStoryInput?.language || 'Not specified'}
                </span>
              </li>
              {currentStoryInput?.additionalDetails && (
                <li className="pt-2 border-t border-primary-100">
                  <span className="block text-gray-600 mb-1">Custom Details</span>
                  <span className="font-medium text-primary-700">{currentStoryInput.additionalDetails}</span>
                </li>
              )}
            </ul>
          </div>

          <StoryRating 
            storyContent={currentStory} 
            storyInput={currentStoryInput}
            onSave={loadSavedStories}
            isSaved={currentStoryIndex !== 0}
            storyId={currentStoryIndex === 0 ? undefined : savedStories[currentStoryIndex - 1]?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default StoryDisplay;