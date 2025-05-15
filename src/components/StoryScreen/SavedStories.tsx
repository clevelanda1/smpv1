import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface SavedStoriesProps {
  onLoadStory: (content: string, input: any) => void;
}

const SavedStories: React.FC<SavedStoriesProps> = ({ onLoadStory }) => {
  const { user } = useAuth();
  const [stories, setStories] = React.useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      fetchSavedStories();
    }
  }, [user]);

  const fetchSavedStories = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_stories')
        .select('*')
        .eq('user_id', user?.id)
        .eq('rating', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStories(data || []);
      if (data && data.length > 0) {
        onLoadStory(data[0].story_content, data[0].story_input);
      }
    } catch (error) {
      console.error('Error fetching saved stories:', error);
      toast.error('Failed to load saved stories');
    } finally {
      setLoading(false);
    }
  };

  const navigateStories = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % stories.length
      : (currentIndex - 1 + stories.length) % stories.length;
    
    setCurrentIndex(newIndex);
    onLoadStory(stories[newIndex].story_content, stories[newIndex].story_input);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <span className="animate-spin">⌛</span>
        Loading saved stories...
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => navigateStories('prev')}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Previous story"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm text-gray-600">
        Story {currentIndex + 1} of {stories.length}
      </span>

      <button
        onClick={() => navigateStories('next')}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Next story"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SavedStories;