export interface StoryInput {
  childName: string;
  developmentalStage: 'toddler' | 'preschool' | 'early-elementary' | 'middle-elementary' | 'upper-elementary';
  childMoods: string[];
  storyLength: '5' | '10' | '15';
  characters: string[];
  additionalDetails: string;
  language: 'English' | 'Spanish' | 'Chinese' | 'Tagalog' | 'Vietnamese';
  // Advanced options
  developmentalNeeds?: string[];
  readingGuidance?: 'minimal' | 'moderate' | 'extensive';
  sleepConcerns?: string[];
  storyTheme?: string;
  saveAsTemplate?: boolean;
  templateName?: string;
  characterCustomizations?: {
    id: string;
    name: string;
    description: string;
    traits: string[];
    icon: string;
  }[];
}

export interface StoryState {
  input: StoryInput;
  story: string;
  isGenerating: boolean;
  error: string | null;
}

export interface ScrollControlState {
  isScrolling: boolean;
  scrollSpeed: number;
  textSize: number;
}