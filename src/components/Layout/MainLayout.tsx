import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  showTemplates?: boolean;
  onToggleTemplates?: () => void;
  isStoryScreen?: boolean;
  onShowSavedStories?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showTemplates = false,
  onToggleTemplates = () => {},
  isStoryScreen = false,
  onShowSavedStories = () => {}
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-grid bg-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-secondary-50/30 to-accent-50/50" />
      <Header 
        showTemplates={showTemplates} 
        onToggleTemplates={onToggleTemplates}
        isStoryScreen={isStoryScreen}
        onShowSavedStories={onShowSavedStories}
      />
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 sm:py-12 relative mt-[73px] px-2 sm:px-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;