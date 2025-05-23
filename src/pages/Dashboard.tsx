import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStory } from '../context/StoryContext';
import InputForm from '../components/InputScreen/InputForm';
import StoryDisplay from '../components/StoryScreen/StoryDisplay';
import MainLayout from '../components/Layout/MainLayout';
import TemplateList from '../components/InputScreen/TemplateList';
import FeedbackForm from '../components/FeedbackForm';
import StoryUsageStatus from '../components/StoryUsageStatus';
import { Library } from 'lucide-react';
import { ClipboardData } from 'react-bootstrap-icons';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const { state, updateInput, resetStory } = useStory();
  const [showStory, setShowStory] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(
    location.state?.showTemplates || false
  );

  React.useEffect(() => {
    resetStory();
  }, []);

  React.useEffect(() => {
    if (state.story && !state.isGenerating) {
      setShowStory(true);
    }
    if (location.state?.showStories) {
      setShowStory(true);
    }
  }, [state.story, state.isGenerating, location.state]);

  const handleClearTemplate = () => {
    setActiveTemplateId(null);
    resetStory();
  };

  const handleShowSavedStories = () => {
    setShowStory(true);
  };

  const content = showStory ? (
    <StoryDisplay onBack={() => {
      setShowStory(false);
      resetStory();
    }} />
  ) : (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Library className="hidden sm:block h-8 w-8 md:h-10 md:w-10 text-secondary-500" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-600">
            Magic Bookshelf!
          </h1>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Turn bedtime into the most exciting part of the night with stories & adventures that are relatable for your little ones!
        </p>
      </div>
      
      {showTemplates && (
        <TemplateList 
          onSelectTemplate={(template) => {
            updateInput(template);
            setActiveTemplateId(template.id || null);
          }}
          activeTemplateId={activeTemplateId}
          onClearTemplate={handleClearTemplate}
        />
      )}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-8 md:p-10">
        <InputForm />
      </div>
      <div className="mt-8 sm:mt-10 md:mt-12 space-y-4 sm:space-y-6">
        <FeedbackForm />
        <StoryUsageStatus />
      </div>
    </div>
  );

  return (
    <MainLayout 
      showTemplates={showTemplates}
      onToggleTemplates={() => setShowTemplates(!showTemplates)}
      isStoryScreen={showStory}
      onShowSavedStories={handleShowSavedStories}
    >
      {content}
    </MainLayout>
  );
}

export default Dashboard;