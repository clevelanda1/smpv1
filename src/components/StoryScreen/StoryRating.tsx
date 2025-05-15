import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Save, XLg } from 'react-bootstrap-icons';

interface StoryRatingProps {
  storyContent: string;
  storyInput: any;
  onSave: () => void;
  isSaved?: boolean;
  storyId?: string;
}

const StoryRating: React.FC<StoryRatingProps> = ({ 
  storyContent, 
  storyInput, 
  onSave,
  isSaved,
  storyId
}) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save stories');
      return;
    }

    setIsSaving(true);
    try {
      // Check current usage
      const { data: usageData } = await supabase
        .from('user_story_usage')
        .select('*')
        .single();

      if (usageData?.monthly_limit && usageData.stories_remaining <= 0) {
        toast.error('You have reached your monthly story limit. Please upgrade your plan for unlimited stories.');
        return;
      }

      const { error } = await supabase
        .from('saved_stories')
        .insert({
          user_id: user.id,
          story_content: storyContent,
          story_input: storyInput,
          rating: true
        });

      if (error) throw error;

      toast.success('Story saved to your library!');
      onSave();
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Failed to save your story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!user || !storyId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('saved_stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      toast.success('Story removed from your library');
      onSave();
    } catch (error) {
      console.error('Error removing story:', error);
      toast.error('Failed to remove story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;
  if (isSaved && !storyId) return null;

  return (
    <button
      onClick={isSaved ? handleRemove : handleSave}
      disabled={isSaving}
      className={`
        w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors
        ${isSaved 
          ? 'bg-secondary-500 text-white hover:bg-red-600 hover:text-white' 
          : 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white'
        }
      `}
      title={isSaved ? 'Remove story' : 'Save story'}
    >
      {isSaved ? (
        <>
          <XLg className="w-5 h-5" />
          <span className="font-medium">Remove from Library</span>
        </>
      ) : (
        <>
          <Save className="w-5 h-5" />
          <span className="font-medium">Add to Library</span>
        </>
      )}
    </button>
  );
};

export default StoryRating;