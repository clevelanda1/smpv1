import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { StoryState, StoryInput } from '../types';
import { generateStory } from '../api/storyApi';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { debugSupabaseOperation, validateUUID, formatUUID } from '../utils/supabaseDebug';
import { useAuth } from './AuthContext';

const initialState: StoryState = {
  input: {
    childName: '',
    childAge: 5,
    childMoods: [],
    storyLength: '5',
    characters: [],
    additionalDetails: '',
    language: 'English',
    developmentalStage: 'toddler',
    developmentalNeeds: [],
    readingGuidance: 'moderate',
    sleepConcerns: [],
    storyTheme: undefined,
    saveAsTemplate: false,
    templateName: '',
    characterCustomizations: []
  },
  story: '',
  isGenerating: false,
  error: null,
};

type Action =
  | { type: 'UPDATE_INPUT'; payload: Partial<StoryInput> }
  | { type: 'GENERATE_STORY_START' }
  | { type: 'GENERATE_STORY_SUCCESS'; payload: string }
  | { type: 'GENERATE_STORY_FAILURE'; payload: string }
  | { type: 'RESET' };

const storyReducer = (state: StoryState, action: Action): StoryState => {
  switch (action.type) {
    case 'UPDATE_INPUT':
      return {
        ...state,
        input: { ...state.input, ...action.payload },
      };
    case 'GENERATE_STORY_START':
      return {
        ...state,
        isGenerating: true,
        error: null,
      };
    case 'GENERATE_STORY_SUCCESS':
      return {
        ...state,
        story: action.payload,
        isGenerating: false,
      };
    case 'GENERATE_STORY_FAILURE':
      return {
        ...state,
        error: action.payload,
        isGenerating: false,
      };
    case 'RESET':
      return {
        ...initialState,
        input: {
          ...initialState.input,
          childMoods: [],
          characters: [],
          characterCustomizations: []
        }
      };
    default:
      return state;
  }
};

type StoryContextType = {
  state: StoryState;
  updateInput: (input: Partial<StoryInput>) => void;
  generateStoryFromInput: () => Promise<void>;
  resetStory: () => void;
  saveTemplate: (name: string) => Promise<void>;
};

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storyReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET' });
    }
  }, [user]);

  const updateInput = (input: Partial<StoryInput>) => {
    dispatch({ type: 'UPDATE_INPUT', payload: input });
  };

  const saveLastStory = async (story: string, storyInput: StoryInput) => {
    try {
      const { error } = await supabase
        .from('saved_stories')
        .insert({
          user_id: user?.id,
          story_content: story,
          story_input: storyInput,
          rating: false
        });

      if (error) {
        console.error('Error saving last story:', error);
      }
    } catch (error) {
      console.error('Error in saveLastStory:', error);
    }
  };

  const generateStoryFromInput = async () => {
    try {
      dispatch({ type: 'GENERATE_STORY_START' });
      const story = await generateStory(state.input);
      dispatch({ type: 'GENERATE_STORY_SUCCESS', payload: story });
      
      // Save the generated story
      if (user) {
        await saveLastStory(story, state.input);
      }
    } catch (error) {
      dispatch({
        type: 'GENERATE_STORY_FAILURE',
        payload: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const saveTemplate = async (name: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Authentication error: Unable to get session');
      }

      if (!session?.user) {
        toast.error('You must be logged in to save templates');
        return;
      }

      const templateData = {
        name,
        user_id: session.user.id,
        child_name: state.input.childName,
        developmental_stage: state.input.developmentalStage,
        language: state.input.language,
        developmental_needs: state.input.developmentalNeeds || [],
        reading_guidance: state.input.readingGuidance,
        sleep_concerns: state.input.sleepConcerns || [],
        story_theme: state.input.storyTheme,
      };

      await debugSupabaseOperation('saveTemplate', templateData);

      if (!(await validateUUID(session.user.id))) {
        templateData.user_id = formatUUID(session.user.id);
      }

      const { error: insertError } = await supabase
        .from('story_templates')
        .insert(templateData)
        .select('id')
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('A template with this name already exists');
        } else if (insertError.code === '42501') {
          toast.error('You do not have permission to save templates');
        } else if (insertError.code === '23503') {
          toast.error('Invalid user reference. Please try logging out and back in.');
        } else {
          console.error('Error saving template:', insertError);
          toast.error(`Failed to save template: ${insertError.message}`);
        }
        return;
      }

      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template. Please try again later.');
    }
  };

  const resetStory = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <StoryContext.Provider
      value={{
        state,
        updateInput,
        generateStoryFromInput,
        resetStory,
        saveTemplate,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};