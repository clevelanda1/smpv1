import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStory } from '../context/StoryContext';
import { supabase } from '../lib/supabase';
import { Send, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Magic } from 'react-bootstrap-icons';

interface Story {
  id: string;
  story_content: string;
  story_input: {
    childName: string;
  };
  created_at: string;
  rating: boolean;
}

const FeedbackForm: React.FC = () => {
  const { user } = useAuth();
  const { state } = useStory();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState('');
  const [childComment, setChildComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lastStory, setLastStory] = useState<Story | null>(null);

  useEffect(() => {
    if (user) {
      fetchStories();
      fetchLastStory();
    }
  }, [user]);

  const fetchLastStory = async () => {
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
    } catch (error) {
      console.error('Error fetching last story:', error);
    }
  };

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_stories')
        .select('*')
        .eq('user_id', user?.id)
        .eq('rating', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to load stories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory || !childComment.trim()) return;

    setIsSubmitting(true);
    try {
      let storyContent, storyId;
      
      if (selectedStory === 'last') {
        storyContent = lastStory?.story_content || state.story;
        storyId = lastStory?.id;
      } else {
        const selectedSavedStory = stories.find(s => s.id === selectedStory);
        storyContent = selectedSavedStory?.story_content;
        storyId = selectedSavedStory?.id;
      }

      const storyTitle = storyContent?.substring(0, 50) + '...';

      const { error } = await supabase
        .from('story_feedback')
        .insert({
          user_id: user?.id,
          story_id: storyId,
          story_title: storyTitle,
          child_comment: childComment.trim()
        });

      if (error) throw error;

      toast.success('Thank you for sharing your feedback!');
      setChildComment('');
      setSelectedStory('');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (!lastStory && !state.story && stories.length === 0)) return null;

  const extractStoryName = (content: string) => {
    if (!content) return '';
    const chapterIndex = content.indexOf('Chapter 1');
    if (chapterIndex === -1) {
      return content.substring(0, 50);
    }
    return content.substring(0, chapterIndex).trim();
  };

  const getSelectedStoryDisplay = () => {
    if (selectedStory === 'last') {
      const storyContent = lastStory?.story_content || state.story;
      return `Last Story: ${extractStoryName(storyContent)}`;
    }
    if (selectedStory) {
      const selectedSavedStory = stories.find(s => s.id === selectedStory);
      return `From Library: ${extractStoryName(selectedSavedStory?.story_content || '')}`;
    }
    return 'Choose a story to share feedback';
  };

  return (
    <div className="grid gap-6">
      <div 
        className={`
          group bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl p-8 text-white
          transition-all duration-300 overflow-hidden
          ${isDropdownOpen ? 'shadow-xl ring-2 ring-accent-300' : ''}
        `}
      >
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">
            Share Your Story Experience
          </h3>
          <div className="space-y-2">
            <label className="block text-sm text-accent-50">
              Which story would you like to tell us about?
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-between"
            >
              <span className="text-white/90 font-medium">
                {getSelectedStoryDisplay()}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div 
              className={`
                mt-2 space-y-1 transition-all duration-300 origin-top
                ${isDropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 h-0'}
              `}
            >
              {(lastStory || state.story) && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-white/70 mb-2">Last Story Created</div>
                  <button
                    onClick={() => {
                      setSelectedStory('last');
                      setIsDropdownOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 rounded-xl text-left transition-colors
                      ${selectedStory === 'last' ? 'bg-white/20' : 'hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">
                        {extractStoryName(lastStory?.story_content || state.story || '')}
                      </span>
                      <span className="text-sm text-white/70">
                        For {(lastStory?.story_input || state.input)?.childName || 'your child'}
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {stories.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-white/70 mb-2">From Library</div>
                  <div className="space-y-1">
                    {stories.map((story) => (
                      <button
                        key={story.id}
                        onClick={() => {
                          setSelectedStory(story.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`
                          w-full px-4 py-3 rounded-xl text-left transition-colors
                          ${selectedStory === story.id ? 'bg-white/20' : 'hover:bg-white/10'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">
                            {extractStoryName(story.story_content)}
                          </span>
                          <span className="text-sm text-white/70">
                            For {story.story_input.childName}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedStory && (
        <div className="group bg-gradient-to-r from-secondary-500 to-secondary-400 rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">
              Tell Us More
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm text-secondary-50">
                  What did your child say about the story?
                </label>
                <textarea
                  value={childComment}
                  onChange={(e) => setChildComment(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none"
                  placeholder="Share your child's reactions and thoughts..."
                  required
                />
                <div className="flex justify-between text-xs text-secondary-50">
                  <span>{childComment.length}/200 characters</span>
                </div>
              </div>

              {childComment.trim() && (
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      flex items-center justify-center gap-2
                      w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-medium text-white rounded-full
                      transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-secondary-300
                      ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary-300 hover:bg-secondary-700 shadow-lg hover:shadow-xl'}
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">⌛</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Magic className="w-5 h-5" />
                        Share The Magic!
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackForm;