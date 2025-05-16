import React, { useState, useEffect } from 'react';
import { Switch } from '../ui/Switch';
import { StoryInput } from '../../types';
import { ChevronDown, ChevronUp, Plus, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const developmentalNeeds = [
  { value: 'vocabulary', label: 'Emotional awareness & regulation' },
  { value: 'emotional', label: 'Social skills & friendship development' },
  { value: 'problem-solving', label: 'Language & vocabulary building' },
  { value: 'social', label: 'Problem-solving & critical thinking' },
  { value: 'transitions', label: 'Self-confidence & identity formation' },
  { value: 'transitions', label: 'Focus & attention skills' }
];

const readingGuidance = [
  { value: 'minimal', label: 'Minimal', description: 'For experienced readers' },
  { value: 'moderate', label: 'Moderate', description: 'Includes reading prompts and discussion questions' },
  { value: 'extensive', label: 'Extensive', description: 'Detailed guidance for newer parents' },
];

const sleepConcerns = [
  { value: 'dark', label: 'Bedtime resistance or anxiety' },
  { value: 'settling', label: 'Fear of the dark' },
  { value: 'separation', label: 'Separation anxiety at night' },
  { value: 'nightmares', label: 'Disturbing dreams/nightmares' },
  { value: 'nightmares', label: 'Difficulty staying asleep' },
];

const storyThemes = [
  { value: 'adventure', label: 'Adventure & discovery', description: 'Exploring new worlds' },
  { value: 'friendship', label: 'Friendships & belonging', description: 'Building and maintaining relationships' },
  { value: 'overcoming-challanges', label: 'Overcoming challenges', description: 'Developing resilience' },
  { value: 'magical-discovery', label: 'Magical discovery', description: 'Exploring magical worlds and powers' },
  { value: 'nature-animals', label: 'Connecting with nature & animals', description: 'Connection to the living world' },
  { value: 'cultural-exploration', label: 'Cultural exploration', description: 'Appreciating diversity)' },
];

interface AdvancedOptionsProps {
  input: StoryInput;
  onChange: (changes: Partial<StoryInput>) => void;
  showAdvanced: boolean;
  onToggleAdvanced: (show: boolean) => void;
}

interface CustomOption {
  id: string;
  value: string;
  option_type: string;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  input,
  onChange,
  showAdvanced,
  onToggleAdvanced,
}) => {
  const { user } = useAuth();
  const [newDevelopmentalNeed, setNewDevelopmentalNeed] = useState('');
  const [newSleepConcern, setNewSleepConcern] = useState('');
  const [newStoryTheme, setNewStoryTheme] = useState('');
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  const [templateName, setTemplateName] = useState(input.templateName || '');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCustomOptions();
    }
  }, [user]);

  const fetchCustomOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_custom_options')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setCustomOptions(data || []);
    } catch (error) {
      console.error('Error fetching custom options:', error);
      toast.error('Failed to load custom options');
    }
  };

  const addCustomOption = async (type: string, value: string) => {
    if (!user || !value.trim()) return;

    try {
      const { data, error } = await supabase
        .from('user_custom_options')
        .insert({
          user_id: user.id,
          option_type: type,
          value: value.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setCustomOptions([...customOptions, data]);
      toast.success('Custom option added');

      const currentValues = input[type as keyof StoryInput] as string[] || [];
      onChange({ [type]: [...currentValues, value.trim()] });

    } catch (error) {
      console.error('Error adding custom option:', error);
      toast.error('Failed to add custom option');
    }
  };

  const removeCustomOption = async (option: CustomOption) => {
    try {
      const { error } = await supabase
        .from('user_custom_options')
        .delete()
        .eq('id', option.id);

      if (error) throw error;

      setCustomOptions(customOptions.filter(o => o.id !== option.id));
      
      const currentValues = input[option.option_type as keyof StoryInput] as string[] || [];
      onChange({
        [option.option_type]: currentValues.filter(v => v !== option.value)
      });

      toast.success('Custom option removed');
    } catch (error) {
      console.error('Error removing custom option:', error);
      toast.error('Failed to remove custom option');
    }
  };

  const handleToggleAdvanced = (e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleAdvanced(!showAdvanced);
  };

  const handleSaveTemplateName = () => {
    if (templateName.trim()) {
      onChange({ 
        saveAsTemplate: true,
        templateName: templateName.trim() 
      });
      setIsEditingName(false);
    }
  };

  const getCustomOptionsForType = (type: string) => {
    return customOptions.filter(option => option.option_type === type);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3" onClick={handleToggleAdvanced}>
          <Switch
            checked={showAdvanced}
            onCheckedChange={(checked) => {
              onToggleAdvanced(checked);
            }}
            className="data-[state=checked]:bg-primary-500"
          />
          <label className="text-base sm:text-lg font-medium text-gray-700">
            Advanced Options
          </label>
        </div>
        <button
          type="button"
          onClick={handleToggleAdvanced}
          className="text-primary-600 hover:text-primary-700"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 pt-4 sm:pt-6 border-t border-gray-200">
          {/* Developmental Needs Section */}
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-base sm:text-lg font-medium text-gray-700">
              Developmental Focus Areas
            </label>
            <div className="grid gap-2 sm:gap-3">
              {[...developmentalNeeds, ...getCustomOptionsForType('developmental_needs').map(option => ({
                value: option.value,
                label: option.value,
                isCustom: true,
                id: option.id
              }))].map(need => (
                <label
                  key={need.value}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={need.value}
                    checked={(input.developmentalNeeds || []).includes(need.value)}
                    onChange={(e) => {
                      const needs = input.developmentalNeeds || [];
                      onChange({
                        developmentalNeeds: e.target.checked
                          ? [...needs, need.value]
                          : needs.filter(n => n !== need.value)
                      });
                    }}
                    className="text-primary-500 focus:ring-primary-500 rounded"
                  />
                  <span className="flex-1 text-xs sm:text-sm">{need.label}</span>
                  {'isCustom' in need && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removeCustomOption({ id: need.id, value: need.value, option_type: 'developmental_needs' });
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </label>
              ))}
            </div>
            <div className="flex gap-1 sm:gap-2">
              <input
                type="text"
                value={newDevelopmentalNeed}
                onChange={e => setNewDevelopmentalNeed(e.target.value)}
                placeholder="Add custom focus area..."
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newDevelopmentalNeed.trim()) {
                    addCustomOption('developmental_needs', newDevelopmentalNeed);
                    setNewDevelopmentalNeed('');
                  }
                }}
                disabled={!newDevelopmentalNeed.trim()}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Reading Guidance Section */}
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-base sm:text-lg font-medium text-gray-700">
              Reading Guidance Level
            </label>
            <div className="grid gap-2 sm:gap-3">
              {readingGuidance.map(level => (
                <label
                  key={level.value}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="readingGuidance"
                    value={level.value}
                    checked={input.readingGuidance === level.value}
                    onChange={(e) => {
                      onChange({ readingGuidance: e.target.value as 'minimal' | 'moderate' | 'extensive' });
                    }}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-xs sm:text-sm">{level.label}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 ml-1 sm:ml-2">
                      ({level.description})
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Sleep Concerns Section */}
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-base sm:text-lg font-medium text-gray-700">
              Sleep-Related Concerns
            </label>
            <div className="grid gap-2 sm:gap-3">
              {[...sleepConcerns, ...getCustomOptionsForType('sleep_concerns').map(option => ({
                value: option.value,
                label: option.value,
                isCustom: true,
                id: option.id
              }))].map(concern => (
                <label
                  key={concern.value}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={concern.value}
                    checked={(input.sleepConcerns || []).includes(concern.value)}
                    onChange={(e) => {
                      const concerns = input.sleepConcerns || [];
                      onChange({
                        sleepConcerns: e.target.checked
                          ? [...concerns, concern.value]
                          : concerns.filter(c => c !== concern.value)
                      });
                    }}
                    className="text-primary-500 focus:ring-primary-500 rounded"
                  />
                  <span className="flex-1 text-xs sm:text-sm">{concern.label}</span>
                  {'isCustom' in concern && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removeCustomOption({ id: concern.id, value: concern.value, option_type: 'sleep_concerns' });
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </label>
              ))}
            </div>
            <div className="flex gap-1 sm:gap-2">
              <input
                type="text"
                value={newSleepConcern}
                onChange={e => setNewSleepConcern(e.target.value)}
                placeholder="Add custom sleep concern..."
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newSleepConcern.trim()) {
                    addCustomOption('sleep_concerns', newSleepConcern);
                    setNewSleepConcern('');
                  }
                }}
                disabled={!newSleepConcern.trim()}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Story Theme Section */}
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-base sm:text-lg font-medium text-gray-700">
              Story Theme
            </label>
            <div className="grid gap-2 sm:gap-3">
              {[...storyThemes, ...getCustomOptionsForType('story_themes').map(option => ({
                value: option.value,
                label: option.value,
                description: 'Custom theme',
                isCustom: true,
                id: option.id
              }))].map(theme => (
                <label
                  key={theme.value}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="storyTheme"
                    value={theme.value}
                    checked={input.storyTheme === theme.value}
                    onChange={(e) => {
                      onChange({ storyTheme: e.target.value });
                    }}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-xs sm:text-sm">{theme.label}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 ml-1 sm:ml-2">
                      ({theme.description})
                    </span>
                  </div>
                  {'isCustom' in theme && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removeCustomOption({ id: theme.id, value: theme.value, option_type: 'story_themes' });
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </label>
              ))}
            </div>
            <div className="flex gap-1 sm:gap-2">
              <input
                type="text"
                value={newStoryTheme}
                onChange={e => setNewStoryTheme(e.target.value)}
                placeholder="Add custom story theme..."
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newStoryTheme.trim()) {
                    addCustomOption('story_themes', newStoryTheme);
                    setNewStoryTheme('');
                  }
                }}
                disabled={!newStoryTheme.trim()}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Save as Template Section */}
          <div className="pt-4 sm:pt-6 border-t border-gray-200">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Switch
                    checked={input.saveAsTemplate || false}
                    onCheckedChange={(checked) => {
                      onChange({ saveAsTemplate: checked });
                      if (checked && !input.templateName) {
                        setIsEditingName(true);
                      }
                    }}
                    className="data-[state=checked]:bg-primary-500"
                  />
                  <span className="text-base sm:text-lg font-medium text-gray-700">
                    Save as Template
                  </span>
                </div>
                {input.saveAsTemplate && input.templateName && !isEditingName && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-primary-600 hover:text-primary-700 p-1 rounded-full hover:bg-primary-50"
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>

              {input.saveAsTemplate && (isEditingName || !input.templateName) && (
                <div className="flex gap-1 sm:gap-2">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTemplateName}
                    disabled={!templateName.trim()}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}

              {input.saveAsTemplate && input.templateName && !isEditingName && (
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 text-primary-700 rounded-lg text-xs sm:text-sm">
                  Template name: {input.templateName}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions;