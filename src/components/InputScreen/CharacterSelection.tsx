import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import CustomCharacterModal from './CustomCharacterModal';
import toast from 'react-hot-toast';
import { 
  XLg, 
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

const characters = [
  {
    id: 'trophy',
    name: 'Victor the Victory Bear',
    description: 'Celebrates others achievements with joy.',
    icon: 'award',
    color: 'primary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'game_fairy',
    name: 'Zappy the Game Fairy',
    description: 'Turns playtime into magical times.',
    icon: 'joystick',
    color: 'secondary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'butterfly',
    name: 'Daisy the Flower Girl',
    description: 'The best friend anyone could ask for.',
    icon: 'flower',
    color: 'accent',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'dj',
    name: 'DJ Max',
    description: 'Brings friends together through music.',
    icon: 'headset',
    color: 'primary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'robot_dog',
    name: 'Chip the Robot Dog',
    description: 'Solves problems at lightning speed.',
    icon: 'gpucard',
    color: 'secondary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'wizard_owl',
    name: 'Sam the Bright Owl',
    description: 'Turns ideas into glowing discoveries.',
    icon: 'lightbulb',
    color: 'accent',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'lamb',
    name: 'Lovey the Lamb',
    description: 'Makes everyone feel special.',
    icon: 'heart',
    color: 'primary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'captain',
    name: 'Captain Sally',
    description: 'Helps friends in trouble.',
    icon: 'lifepreserver',
    color: 'secondary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'magic_lion',
    name: 'Sunny the Magic Lion',
    description: 'Can summon sunshine on rainy days.',
    icon: 'brightness',
    color: 'accent',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'butterfly_detective',
    name: 'Betty the Bug',
    description: 'Notices what others miss.',
    icon: 'bug',
    color: 'primary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'magic_penguin',
    name: 'Alice the Penguin',
    description: 'Paints dreams into reality.',
    icon: 'palette',
    color: 'secondary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'artist',
    name: 'Doodle the Dreamer',
    description: 'Turns the ordinary into something magical.',
    icon: 'brush',
    color: 'accent',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'detective',
    name: 'Detective Duck',
    description: 'Connects clues to solve riddles.',
    icon: 'puzzle',
    color: 'primary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'gamer',
    name: 'Gary the Gamer',
    description: 'Includes everyone in the fun.',
    icon: 'controller',
    color: 'secondary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'shield_koala',
    name: 'Koala the Guardian',
    description: 'Creates protective shields with her thoughts.',
    icon: 'shield',
    color: 'accent',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'bunny',
    name: 'Hopper the Bouncing Bunny',
    description: 'Never runs out of positive energy.',
    icon: 'dribble',
    color: 'primary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'message_penguin',
    name: 'Echo the Silly Penguin',
    description: 'Perhaps the one character with the biggest personality.',
    icon: 'tencent',
    color: 'secondary',
    minAge: 1,
    maxAge: 10
  },
  {
    id: 'chat_twins',
    name: 'Chit & Chat Twins',
    description: 'speak different languages to everyone.',
    icon: 'chat',
    color: 'accent',
    minAge: 1,
    maxAge: 10
  }
];

const CHARACTERS_PER_PAGE = {
  default: 6,
  sm: 4,
  xs: 2
};

const MAX_CHARACTERS = 2;

type CharacterSelectionProps = {
  selectedCharacters: string[];
  onChange: (characters: string[]) => void;
  childAge: number;
};

const getColorClasses = (color: string) => {
  const colorMap = {
    primary: {
      bg: 'bg-primary-100/50',
      text: 'text-primary-600',
      hover: 'hover:bg-primary-50',
      selected: 'ring-primary-500 bg-primary-50'
    },
    secondary: {
      bg: 'bg-secondary-100/50',
      text: 'text-secondary-600',
      hover: 'hover:bg-secondary-50',
      selected: 'ring-secondary-500 bg-secondary-50'
    },
    accent: {
      bg: 'bg-accent-100/50',
      text: 'text-accent-600',
      hover: 'hover:bg-accent-50',
      selected: 'ring-accent-500 bg-accent-50'
    }
  };
  return colorMap[color as keyof typeof colorMap];
};

const renderIcon = (icon: string) => {
  const iconProps = { className: "w-12 h-12" };
  switch (icon) {
    case 'award': return <Award {...iconProps} />;
    case 'joystick': return <Joystick {...iconProps} />;
    case 'flower': return <Flower2 {...iconProps} />;
    case 'headset': return <Headset {...iconProps} />;
    case 'gpucard': return <GpuCard {...iconProps} />;
    case 'lightbulb': return <Lightbulb {...iconProps} />;
    case 'heart': return <BalloonHeart {...iconProps} />;
    case 'lifepreserver': return <LifePreserver {...iconProps} />;
    case 'brightness': return <BrightnessHigh {...iconProps} />;
    case 'bug': return <Bug {...iconProps} />;
    case 'palette': return <Palette {...iconProps} />;
    case 'brush': return <Brush {...iconProps} />;
    case 'puzzle': return <Puzzle {...iconProps} />;
    case 'controller': return <Controller {...iconProps} />;
    case 'shield': return <Shield {...iconProps} />;
    case 'dribble': return <Dribbble {...iconProps} />;
    case 'tencent': return <TencentQq {...iconProps} />;
    case 'chat': return <Wechat {...iconProps} />;
    default: return null;
  }
};

const shuffleArray = <T extends unknown>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  selectedCharacters,
  onChange,
  childAge,
}) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [sessionCharacters, setSessionCharacters] = useState<any[]>([]);
  const [customizations, setCustomizations] = useState<Record<string, {
    name: string;
    description: string;
    traits: string[];
    icon: string;
  }>>({});
  const [shuffledCharacters, setShuffledCharacters] = useState<typeof characters>([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCustomCharacters();
    }
  }, [user]);

  useEffect(() => {
    setShuffledCharacters(shuffleArray(characters));
  }, []);

  const fetchCustomCharacters = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_characters')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setSessionCharacters(shuffleArray(data || []));
    } catch (error) {
      console.error('Error fetching custom characters:', error);
      toast.error('Failed to load custom characters');
    }
  };

  const getCharactersPerPage = () => {
    if (windowWidth < 475) return CHARACTERS_PER_PAGE.xs;
    if (windowWidth < 640) return CHARACTERS_PER_PAGE.sm;
    return CHARACTERS_PER_PAGE.default;
  };

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      const { error } = await supabase
        .from('custom_characters')
        .delete()
        .eq('id', characterId);

      if (error) throw error;

      if (selectedCharacters.includes(characterId)) {
        onChange(selectedCharacters.filter(id => id !== characterId));
      }

      setSessionCharacters(prev => prev.filter(char => char.id !== characterId));
      toast.success('Character removed');
    } catch (error) {
      console.error('Error removing character:', error);
      toast.error('Failed to remove character');
    }
  };

  const allCharacters = [
    ...sessionCharacters.map(char => ({
      id: char.id,
      name: char.name,
      description: char.description,
      icon: char.icon,
      color: 'accent',
      minAge: 1,
      maxAge: 10,
      isCustom: true
    })),
    ...shuffledCharacters
  ];
  
  const filteredCharacters = allCharacters.filter(
    char => childAge >= (char.minAge || 0) && childAge <= (char.maxAge || 10)
  );
  
  const charactersPerPage = getCharactersPerPage();
  const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
  
  const currentCharacters = filteredCharacters.slice(
    currentPage * charactersPerPage,
    (currentPage + 1) * charactersPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const toggleCharacter = (characterId: string) => {
    if (selectedCharacters.includes(characterId)) {
      onChange(selectedCharacters.filter(id => id !== characterId));
      const newCustomizations = { ...customizations };
      delete newCustomizations[characterId];
      setCustomizations(newCustomizations);
    } else if (selectedCharacters.length < MAX_CHARACTERS) {
      onChange([...selectedCharacters, characterId]);
    }
  };

  const handleSaveCustomCharacter = async (character: any) => {
    try {
      const { data, error } = await supabase
        .from('custom_characters')
        .insert({
          user_id: user?.id,
          name: character.name,
          description: character.description,
          icon: character.icon,
          traits: character.traits
        })
        .select()
        .single();

      if (error) throw error;

      setSessionCharacters(prev => [data, ...prev]);
      onChange([...selectedCharacters, data.id]);
      setShowCustomizeModal(false);
      toast.success('Custom character created!');
    } catch (error) {
      console.error('Error saving custom character:', error);
      toast.error('Failed to save custom character');
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Choose Characters</h3>
          <span className="text-sm text-gray-500">
            ({selectedCharacters.length}/{MAX_CHARACTERS})
          </span>
        </div>
        
        <button
          type="button"
          onClick={() => setShowCustomizeModal(true)}
          disabled={selectedCharacters.length >= MAX_CHARACTERS}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm
            transition-all duration-200
            ${
              selectedCharacters.length >= MAX_CHARACTERS
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-accent-50 text-accent-500 hover:bg-accent-100'
            }
          `}
        >
          <Plus className="w-4 h-4" />
          <span>Create Character</span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={prevPage}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Previous characters"
          disabled={currentPage === 0}
        >
          <ChevronLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${currentPage === 0 ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          {currentCharacters.map((character) => {
            const colorClasses = getColorClasses(character.color);
            const isSelected = selectedCharacters.includes(character.id);
            const isDisabled = !isSelected && selectedCharacters.length >= MAX_CHARACTERS;
            const customization = customizations[character.id];

            return (
              <div
                key={character.id}
                className={`
                  relative group cursor-pointer transition-all duration-300
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <button
                  type="button"
                  className={`
                    w-full p-4 sm:p-6 rounded-xl transition-all transform
                    ${
                      isSelected
                        ? 'ring-2 ring-accent-500 shadow-lg bg-white scale-[1.02]'
                        : 'bg-white shadow hover:shadow-lg hover:scale-[1.02]'
                    }
                  `}
                  onClick={() => !isDisabled && toggleCharacter(character.id)}
                  disabled={isDisabled}
                >
                  {character.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCharacter(character.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-20"
                      title="Remove custom character"
                    >
                      <XLg className="w-3 h-3" />
                    </button>
                  )}

                  <div
                    className={`
                      p-3 sm:p-4 rounded-full transition-transform mb-3
                      ${colorClasses.bg} ${colorClasses.text}
                      ${isSelected ? 'scale-110' : ''}
                    `}
                  >
                    {renderIcon(customization?.icon || character.icon)}
                  </div>
                  
                  <div className="w-full">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {customization?.name || character.name}
                    </h3>
                  </div>

                  {isSelected && (
                    <span className="absolute -top-2 -right-2 bg-secondary-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm">
                      {selectedCharacters.indexOf(character.id) + 1}
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/75 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
                    <div className="text-white text-sm">
                      <p className="font-bold mb-2">{customization?.name || character.name}</p>
                      <p className="text-white/90">{customization?.description || character.description}</p>
                      {customization?.traits?.length > 0 && (
                        <div className="mt-2 flex flex-wrap justify-center gap-1">
                          {customization.traits.map(trait => (
                            <span
                              key={trait}
                              className="text-xs px-2 py-0.5 bg-white/20 rounded-full"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        
        <button
          type="button"
          onClick={nextPage}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Next characters"
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
          Select up to {MAX_CHARACTERS} characters
        </div>
      </div>

      {showCustomizeModal && (
        <CustomCharacterModal
          onClose={() => setShowCustomizeModal(false)}
          onSave={handleSaveCustomCharacter}
        />
      )}
    </div>
  );
};

export default CharacterSelection;