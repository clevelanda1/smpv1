import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Trash2 } from 'lucide-react';
import { 
  Award, 
  Joystick, 
  Flower2, 
  Headset, 
  GpuCard, 
  Lightbulb,
  BalloonHeart,
  LifePreserver,
  BrightnessHigh,
  Bug,
  Palette,
  Brush,
  Puzzle,
  Controller,
  Shield,
  Dribbble,
  TencentQq,
  Wechat
} from 'react-bootstrap-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import toast from 'react-hot-toast';

interface CustomCharacterModalProps {
  onClose: () => void;
  onSave: (character: {
    id: string;
    name: string;
    description: string;
    icon: string;
    traits: string[];
  }) => void;
}

const defaultTraits = [
  { value: 'brave', label: 'Brave', description: 'Shows courage in difficult situations' },
  { value: 'kind', label: 'Kind', description: 'Always helps others in need' },
  { value: 'clever', label: 'Clever', description: 'Good at solving problems' },
  { value: 'creative', label: 'Creative', description: 'Full of imagination and new ideas' },
  { value: 'funny', label: 'Funny', description: 'Makes others laugh and smile' },
  { value: 'loyal', label: 'Loyal', description: 'Always there for friends' },
  { value: 'curious', label: 'Curious', description: 'Loves to learn new things' },
  { value: 'adventurous', label: 'Adventurous', description: 'Ready for new experiences' },
  { value: 'wise', label: 'Wise', description: 'Makes good decisions' },
  { value: 'caring', label: 'Caring', description: 'Shows compassion for others' }
];

const characterSuggestions = [
  {
    name: "Luna the Star Seeker",
    description: "A magical cat who collects stardust to help children's dreams come true",
    icon: "award"
  },
  {
    name: "Rocky the Brave Pup",
    description: "A courageous puppy who helps other animals overcome their fears",
    icon: "shield"
  },
  {
    name: "Whisper the Story Keeper",
    description: "A wise owl who knows all the ancient tales of the enchanted forest",
    icon: "book"
  }
];

const availableIcons = [
  { icon: 'award', component: Award, label: 'Award', color: 'primary' },
  { icon: 'joystick', component: Joystick, label: 'Joystick', color: 'secondary' },
  { icon: 'flower', component: Flower2, label: 'Flower', color: 'accent' },
  { icon: 'headset', component: Headset, label: 'Headset', color: 'primary' },
  { icon: 'gpucard', component: GpuCard, label: 'GPU Card', color: 'secondary' },
  { icon: 'lightbulb', component: Lightbulb, label: 'Lightbulb', color: 'accent' },
  { icon: 'heart', component: BalloonHeart, label: 'Heart', color: 'primary' },
  { icon: 'lifepreserver', component: LifePreserver, label: 'Life Preserver', color: 'secondary' },
  { icon: 'brightness', component: BrightnessHigh, label: 'Brightness', color: 'accent' },
  { icon: 'bug', component: Bug, label: 'Bug', color: 'primary' },
  { icon: 'palette', component: Palette, label: 'Palette', color: 'secondary' },
  { icon: 'brush', component: Brush, label: 'Brush', color: 'accent' },
  { icon: 'puzzle', component: Puzzle, label: 'Puzzle', color: 'primary' },
  { icon: 'controller', component: Controller, label: 'Controller', color: 'secondary' },
  { icon: 'shield', component: Shield, label: 'Shield', color: 'accent' },
  { icon: 'dribble', component: Dribbble, label: 'Dribbble', color: 'primary' },
  { icon: 'tencent', component: TencentQq, label: 'Tencent QQ', color: 'secondary' },
  { icon: 'chat', component: Wechat, label: 'WeChat', color: 'accent' }
];

const getColorClasses = (color: string) => {
  const colorMap = {
    primary: {
      bg: 'bg-primary-100/50',
      text: 'text-primary-600',
      hover: 'hover:bg-primary-50/50',
      selected: 'ring-primary-500 bg-primary-50'
    },
    secondary: {
      bg: 'bg-secondary-100/50',
      text: 'text-secondary-600',
      hover: 'hover:bg-secondary-50/50',
      selected: 'ring-secondary-500 bg-secondary-50'
    },
    accent: {
      bg: 'bg-accent-100/50',
      text: 'text-accent-600',
      hover: 'hover:bg-accent-50/50',
      selected: 'ring-accent-500 bg-accent-50'
    }
  };
  return colorMap[color as keyof typeof colorMap];
};

const CustomCharacterModal: React.FC<CustomCharacterModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const { subscriptionDetails } = useSubscription();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('award');
  const [traits, setTraits] = useState<string[]>([]);
  const [customTraits, setCustomTraits] = useState<string[]>([]);
  const [newTrait, setNewTrait] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCustomTraits();
      fetchCharacterCount();
    }
  }, [user]);

  const fetchCharacterCount = async () => {
    try {
      const { count } = await supabase
        .from('custom_characters')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      setCharacterCount(count || 0);
    } catch (error) {
      console.error('Error fetching character count:', error);
    }
  };

  const fetchCustomTraits = async () => {
    try {
      const { data, error } = await supabase
        .from('user_custom_options')
        .select('value')
        .eq('option_type', 'character_traits')
        .eq('user_id', user?.id);

      if (error) throw error;
      setCustomTraits(data?.map(item => item.value) || []);
    } catch (error) {
      console.error('Error fetching custom traits:', error);
      toast.error('Failed to load custom traits');
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Check character limit for Storybook Starter plan
      if (subscriptionDetails?.price_id === 'price_1RMjaQPLXvC55IxstFbeHc3I' && characterCount >= 2) {
        toast.error('Storybook Starter plan is limited to 2 custom characters. Please upgrade to Family Magic plan for unlimited characters.');
        return;
      }

      const { data, error } = await supabase
        .from('custom_characters')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim(),
          icon: selectedIcon,
          traits
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('character limit')) {
          toast.error('Character limit reached. Please upgrade your plan for unlimited characters.');
        } else {
          throw error;
        }
        return;
      }

      onSave(data);
      toast.success('Custom character created!');
      onClose();
    } catch (error) {
      console.error('Error saving custom character:', error);
      toast.error('Failed to save custom character');
    } finally {
      setSaving(false);
    }
  };

  const addCustomTrait = async () => {
    if (!newTrait.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('user_custom_options')
        .insert({
          user_id: user.id,
          option_type: 'character_traits',
          value: newTrait.trim()
        });

      if (error) throw error;

      setCustomTraits([...customTraits, newTrait.trim()]);
      if (traits.length < 3) {
        setTraits([...traits, newTrait.trim()]);
      }
      setNewTrait('');
      toast.success('Custom trait added');
    } catch (error) {
      console.error('Error adding custom trait:', error);
      toast.error('Failed to add custom trait');
    }
  };

  const removeCustomTrait = async (trait: string) => {
    try {
      const { error } = await supabase
        .from('user_custom_options')
        .delete()
        .eq('option_type', 'character_traits')
        .eq('value', trait);

      if (error) throw error;

      setCustomTraits(customTraits.filter(t => t !== trait));
      setTraits(traits.filter(t => t !== trait));
      toast.success('Custom trait removed');
    } catch (error) {
      console.error('Error removing custom trait:', error);
      toast.error('Failed to remove custom trait');
    }
  };

  const useSuggestion = (suggestion: typeof characterSuggestions[0]) => {
    setName(suggestion.name);
    setDescription(suggestion.description);
    setSelectedIcon(suggestion.icon);
    setShowSuggestions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-accent-500 to-accent-400 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Create Custom Character</h2>
          <p className="text-accent-50">Design your own unique character</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-96px)]">
          <div className="space-y-6">
            {/* Character Suggestions */}
            <div className="relative">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full px-4 py-2 text-left text-sm text-accent-600 hover:text-accent-700 bg-accent-50 hover:bg-accent-100 rounded-xl transition-colors"
              >
                Need inspiration? Click for character suggestions
              </button>
              
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                  <div className="p-4 space-y-4">
                    {characterSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => useSuggestion(suggestion)}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Character Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="e.g., Luna the Star Seeker"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  rows={3}
                  placeholder="e.g., A magical cat who collects stardust to help children's dreams come true"
                  required
                />
              </div>
            </div>

            {/* Icon Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Choose Character Icon
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {availableIcons.map(({ icon, component: Icon, label, color }) => {
                  const colorClasses = getColorClasses(color);
                  return (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`
                        p-3 rounded-xl border transition-all flex flex-col items-center gap-2
                        ${selectedIcon === icon
                          ? `${colorClasses.selected} ring-2 shadow-sm`
                          : `${colorClasses.bg} border-transparent ${colorClasses.hover}`
                        }
                      `}
                    >
                      <Icon className={`w-8 h-8 ${colorClasses.text}`} />
                      <span className="text-[8px] text-gray-600 leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Traits Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Character Traits
                </label>
                <span className="text-sm text-gray-500">
                  {traits.length}/3 selected
                </span>
              </div>

              {/* Default Traits */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {defaultTraits.map(trait => (
                  <button
                    key={trait.value}
                    onClick={() => {
                      if (traits.includes(trait.value)) {
                        setTraits(traits.filter(t => t !== trait.value));
                      } else if (traits.length < 3) {
                        setTraits([...traits, trait.value]);
                      }
                    }}
                    disabled={traits.length >= 3 && !traits.includes(trait.value)}
                    className={`
                      p-3 rounded-xl text-sm text-left transition-colors
                      ${traits.includes(trait.value)
                        ? 'bg-accent-500 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }
                      ${traits.length >= 3 && !traits.includes(trait.value)
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      }
                    `}
                  >
                    <div className="font-medium">{trait.label}</div>
                    <div className="text-xs opacity-80">{trait.description}</div>
                  </button>
                ))}
              </div>

              {/* Custom Traits */}
              {customTraits.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Your Custom Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {customTraits.map(trait => (
                      <div
                        key={trait}
                        className={`
                          group flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                          ${traits.includes(trait)
                            ? 'bg-accent-500 text-white'
                            : 'bg-gray-50 text-gray-700'
                          }
                        `}
                      >
                        <button
                          onClick={() => {
                            if (traits.includes(trait)) {
                              setTraits(traits.filter(t => t !== trait));
                            } else if (traits.length < 3) {
                              setTraits([...traits, trait]);
                            }
                          }}
                          disabled={traits.length >= 3 && !traits.includes(trait)}
                          className="flex-1"
                        >
                          {trait}
                        </button>
                        <button
                          onClick={() => removeCustomTrait(trait)}
                          className={`
                            p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                            ${traits.includes(trait)
                              ? 'hover:bg-white/20 text-white'
                              : 'hover:bg-gray-200 text-gray-500'
                            }
                          `}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Trait */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTrait}
                  onChange={(e) => setNewTrait(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="Add custom trait"
                />
                <button
                  onClick={addCustomTrait}
                  disabled={!newTrait.trim()}
                  className="px-4 py-3 bg-accent-500 text-white rounded-xl hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || !description.trim() || saving}
                className="px-6 py-3 bg-accent-500 text-white rounded-xl hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCharacterModal;