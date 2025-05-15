import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useStory } from '../../context/StoryContext';
import { supabase } from '../../lib/supabase';
import CharacterSelection from './CharacterSelection';
import MoodSelection from './MoodSelection';
import AdvancedOptions from './AdvancedOptions';
import { Sparkles, User, Globe, MessageSquare, LibrarySquare as SquareLibrary, Bird, Feather, Award } from 'lucide-react';
import { Bookmark, ChatLeft, ClipboardMinus, Clock, Rocket, Shuffle } from 'react-bootstrap-icons';
import toast from 'react-hot-toast';

const getStoryLengths = (isStarterPlan: boolean) => {
  if (isStarterPlan) {
    return [
      { value: '5', label: '5 minutes', description: 'Quick story for young listeners' },
    ];
  }
  return [
    { value: '5', label: '5 minutes', description: 'Quick story for young listeners' },
    { value: '10', label: '10 minutes', description: 'Balanced story with more depth' },
    { value: '15', label: '15 minutes', description: 'Great for an immersive experience' },
  ];
};

const developmentalStages = [
  { value: 'toddler', label: 'Toddler/Early Preschool', ageRange: '2-3 years' },
  { value: 'preschool', label: 'Preschool/Kindergarten', ageRange: '4-5 years' },
  { value: 'early-elementary', label: 'Early Elementary', ageRange: '6-7 years' },
  { value: 'middle-elementary', label: 'Middle Elementary', ageRange: '8-9 years' },
  { value: 'upper-elementary', label: 'Upper Elementary', ageRange: '10-12 years' },
];

const languages = [
  { value: "English", label: "English", nativeName: "English" },
  { value: "Spanish", label: "Spanish", nativeName: "Español" },
  { value: "French", label: "French", nativeName: "Français" },
  { value: "Chinese", label: "Chinese (Simplified)", nativeName: "简体中文" },
  { value: "German", label: "German", nativeName: "Deutsch" },
  { value: "Portuguese", label: "Portuguese", nativeName: "Português" },
  { value: "Italian", label: "Italian", nativeName: "Italiano" },
  { value: "Japanese", label: "Japanese", nativeName: "日本語" },
  { value: "Russian", label: "Russian", nativeName: "Русский" },
  { value: "Hindi", label: "Hindi", nativeName: "हिन्दी" }
];

const placeholderExamples = [
  "Include a lesson about sharing with others",
  "Focus on overcoming fear of the dark",
  "Include themes about making new friends",
  "Add elements about dealing with a new sibling",
  "Include messages about being kind to animals",
  "Focus on the importance of telling the truth",
  "Add themes about trying new foods",
  "Include lessons about patience and persistence",
  "Focus on dealing with different emotions",
  "Add elements about respecting differences",
];

const InputForm = () => {
  const { state, updateInput, generateStoryFromInput, saveTemplate } = useStory();
  const { user } = useAuth();
  const { hasActiveSubscription, subscriptionDetails } = useSubscription();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isStarterPlan = subscriptionDetails?.price_id === 'price_1RMjaQPLXvC55IxstFbeHc3I';
  const storyLengths = getStoryLengths(isStarterPlan);

  useEffect(() => {
    if (isStarterPlan && state.input.storyLength !== '5') {
      updateInput({ storyLength: '5' });
    }
  }, [isStarterPlan, subscriptionDetails]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    if (!state.input.childName.trim()) {
      return "Please enter the child's name";
    }
    if (state.input.childMoods.length === 0) {
      return "Please select at least one mood";
    }
    if (state.input.characters.length === 0) {
      return "Please select at least one character";
    }
    if (state.input.saveAsTemplate && !state.input.templateName?.trim()) {
      return "Please enter a template name";
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    if (!user) {
      navigate('/auth/sign-up');
      return;
    }

    if (!hasActiveSubscription) {
      toast.error('Please subscribe to generate stories');
      navigate('/pricing');
      return;
    }

    const { data: usageData } = await supabase
      .from('user_story_usage')
      .select('*')
      .single();

    if (usageData?.monthly_limit && usageData.stories_remaining <= 0) {
      toast.error('You have reached your monthly story limit. Please upgrade your plan for unlimited stories.');
      navigate('/pricing');
      return;
    }
    
    const error = validateForm();
    if (error) {
      setValidationError(error);
      toast.error(error);
      return;
    }
    
    setValidationError('');
    setIsSubmitting(true);
    
    try {
      if (state.input.saveAsTemplate && state.input.templateName) {
        await saveTemplate(state.input.templateName);
      }
      
      await generateStoryFromInput();
      toast.success('Your magical story has been created!');
    } catch (error) {
      toast.error('Failed to process your request. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailsKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const currentValue = textarea.value;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      if (selectionStart === selectionEnd && selectionStart === 0) {
        updateInput({ additionalDetails: placeholderExamples[placeholderIndex] });
      } else {
        const nextIndex = (placeholderIndex + 1) % placeholderExamples.length;
        setPlaceholderIndex(nextIndex);
        updateInput({ additionalDetails: placeholderExamples[nextIndex] });
      }
    }
  };

  const handleFormInteraction = (e: React.MouseEvent<HTMLElement>) => {
    if (!user) {
      const target = e.target as HTMLElement;
      
      // Allow interaction with dropdowns and their options
      if (target.tagName === 'SELECT' || target.tagName === 'OPTION') {
        return;
      }
      
      // Allow interaction with labels
      if (target.tagName === 'LABEL') {
        return;
      }
      
      // Block interaction with buttons and other interactive elements
      const button = target.closest('button');
      if (button && 
          !button.closest('.advanced-options') &&
          !button.getAttribute('aria-label')?.includes('characters') &&
          !button.getAttribute('aria-label')?.includes('moods')) {
        e.preventDefault();
        e.stopPropagation();
        navigate('/auth/sign-up');
      }
    }

    if (!hasActiveSubscription) {
      const target = e.target as HTMLElement;
      
      // Allow interaction with dropdowns and their options
      if (target.tagName === 'SELECT' || target.tagName === 'OPTION') {
        return;
      }
      
      // Allow interaction with labels
      if (target.tagName === 'LABEL') {
        return;
      }
      
      const button = target.closest('button');
      if (button && 
          !button.closest('.advanced-options') &&
          !button.getAttribute('aria-label')?.includes('characters') &&
          !button.getAttribute('aria-label')?.includes('moods')) {
        e.preventDefault();
        e.stopPropagation();
        navigate('/pricing');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} onClick={handleFormInteraction} className="space-y-8 sm:space-y-12">
      <div className="space-y-6 sm:space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <Bookmark className="w-5 h-5 text-accent-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label htmlFor="childName" className="block text-sm font-medium text-gray-700">
                Child's Name
              </label>
              <input
                id="childName"
                type="text"
                value={state.input.childName}
                onChange={(e) => {
                  updateInput({ childName: e.target.value });
                  if (hasAttemptedSubmit) {
                    setValidationError(validateForm());
                  }
                }}
                className="w-full h-[52px] px-4 text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 placeholder-gray-400"
                placeholder="Enter name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="developmentalStage" className="block text-sm font-medium text-gray-700">
                Development Stage
              </label>
              <select
                id="developmentalStage"
                value={state.input.developmentalStage}
                onChange={(e) => updateInput({ developmentalStage: e.target.value as any })}
                className="w-full h-[52px] px-4 pr-10 text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                {developmentalStages.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label} ({stage.ageRange})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Story Settings Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <Clock className="w-5 h-5 text-accent-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Story Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label htmlFor="storyLength" className="block text-sm font-medium text-gray-700">
                Story Length
              </label>
              <div className={`relative ${isStarterPlan ? 'cursor-not-allowed' : ''}`}>
                <select
                  id="storyLength"
                  value={state.input.storyLength}
                  onChange={(e) => updateInput({ storyLength: e.target.value as '5' | '10' | '15' })}
                  className={`
                    w-full h-[52px] px-4 pr-10 text-base rounded-xl border border-gray-200 
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 
                    appearance-none
                    ${isStarterPlan ? 'opacity-75 cursor-not-allowed bg-gray-100' : ''}
                  `}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  disabled={isStarterPlan}
                >
                  {storyLengths.map((length) => (
                    <option key={length.value} value={length.value}>
                      {length.label} - {length.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Story Language
              </label>
              <select
                id="language"
                value={state.input.language}
                onChange={(e) => updateInput({ language: e.target.value as typeof languages[number]['value'] })}
                className="w-full h-[52px] px-4 pr-10 text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mood Selection Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <ClipboardMinus className="w-5 h-5 text-accent-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Child's Mood</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              How is your child feeling today? (Select up to 3)
            </label>
            <MoodSelection
              selectedMoods={state.input.childMoods}
              onChange={(moods) => {
                updateInput({ childMoods: moods });
                if (hasAttemptedSubmit) {
                  setValidationError(validateForm());
                }
              }}
            />
          </div>
        </div>

        {/* Character Selection Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <Rocket className="w-5 h-5 text-accent-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Story Characters</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Choose main characters for the story (Select up to 2)
            </label>
            <CharacterSelection
              selectedCharacters={state.input.characters}
              onChange={(characters) => {
                updateInput({ characters });
                if (hasAttemptedSubmit) {
                  setValidationError(validateForm());
                }
              }}
              childAge={getAgeFromStage(state.input.developmentalStage)}
            />
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <ChatLeft className="w-5 h-5 text-accent-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Additional Details</h2>
          </div>

          <div>
            <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-2">
              Any specific or personal related elements to include? (optional) - Press Tab for suggestions
            </label>
            <textarea
              id="additionalDetails"
              value={state.input.additionalDetails}
              onChange={(e) => updateInput({ additionalDetails: e.target.value })}
              onKeyDown={handleDetailsKeyDown}
              placeholder={placeholderExamples[placeholderIndex]}
              className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 h-24 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="advanced-options">
          <AdvancedOptions
            input={state.input}
            onChange={updateInput}
            showAdvanced={showAdvanced}
            onToggleAdvanced={setShowAdvanced}
          />
        </div>
      </div>

      {hasAttemptedSubmit && validationError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <p className="text-red-700">{validationError}</p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            flex items-center justify-center gap-2
            w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-medium text-white rounded-full
            transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-secondary-300
            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent-400 hover:bg-secondary-600 shadow-lg hover:shadow-xl'}
          `}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Magic...
            </>
          ) : (
            <>
              <Shuffle className="w-6 h-6" />
              Generate Story
            </>
          )}
        </button>
      </div>
    </form>
  );
};

function getAgeFromStage(stage: string): number {
  switch (stage) {
    case 'toddler': return 3;
    case 'preschool': return 5;
    case 'early-elementary': return 7;
    case 'middle-elementary': return 9;
    case 'upper-elementary': return 11;
    default: return 5;
  }
}

export default InputForm;