import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputForm from '../components/InputScreen/InputForm';
import MainLayout from '../components/Layout/MainLayout';
import FeatureCarousel from '../components/FeatureCarousel';
import LanguageTicker from '../components/LanguageTicker';
import { Library } from 'lucide-react';
import { useStory } from '../context/StoryContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resetStory } = useStory();
  
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    // Reset form when component mounts
    resetStory();
  }, [user, navigate, resetStory]);
  
  const handleFormInteraction = (e: React.MouseEvent<HTMLElement>) => {
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
  };
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-0">
          <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Library className="hidden sm:block h-8 w-8 md:h-10 md:w-10 text-secondary-500 animate-float" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 text-transparent bg-clip-text">
              Little Words, Big Stories!
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto">
            Bedtime stories that last forever. We'll create the narrative, so that you can add the magic. Because the most precious moments are the ones you'll have together.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-8 md:p-10 hover:shadow-2xl transition-shadow duration-300 mt-6">
          <div onClick={handleFormInteraction}>
            <InputForm />
          </div>
        </div>
        
        <div className="mt-12 sm:mt-16 md:mt-24">
          <FeatureCarousel />
        </div>
        
        {/* Language ticker placed just above the footer text */}
        <div className="mt-10 sm:mt-12">
          <LanguageTicker />
        </div>
        
        <div className="mt-6 sm:mt-8 text-center text-gray-500 text-xs sm:text-sm">
          <p>All stories are unique and generated just for you. Share the joy of reading with your child!</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;