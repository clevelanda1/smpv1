import React, { useState, useEffect } from 'react';
import { LogOut, Menu, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Book, PencilSquare, List, Magic } from 'react-bootstrap-icons';
import { useSubscription } from '../../hooks/useSubscription';
import { supabase } from '../../lib/supabase';
import { useStory } from '../../context/StoryContext';

interface HeaderProps {
  showTemplates: boolean;
  onToggleTemplates: () => void;
  isStoryScreen?: boolean;
  onShowSavedStories?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  showTemplates, 
  onToggleTemplates, 
  isStoryScreen,
  onShowSavedStories
}) => {
  const { user, signOut } = useAuth();
  const { hasActiveSubscription } = useSubscription();
  const { resetStory } = useStory();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasTemplates, setHasTemplates] = useState(false);

  React.useEffect(() => {
    if (user) {
      checkForTemplates();
    }
  }, [user]);

  const checkForTemplates = async () => {
    try {
      const { count } = await supabase
        .from('story_templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      setHasTemplates(count ? count > 0 : false);
    } catch (error) {
      console.error('Error checking templates:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleCreateStory = () => {
    if (!hasActiveSubscription) {
      navigate('/pricing');
      return;
    }
    
    resetStory();
    navigate('/dashboard');
    setIsMenuOpen(false);
  };

  const handleTemplatesClick = () => {
    if (!hasActiveSubscription) {
      navigate('/pricing');
      return;
    }

    if (location.pathname === '/pricing') {
      navigate('/dashboard', { state: { showTemplates: true } });
    } else if (isStoryScreen) {
      navigate('/dashboard', { state: { showTemplates: true } });
    } else {
      onToggleTemplates();
    }
    setIsMenuOpen(false);
  };

  const handleStoriesClick = () => {
    if (!hasActiveSubscription) {
      navigate('/pricing');
      return;
    }

    if (location.pathname === '/pricing') {
      navigate('/dashboard', { state: { showStories: true } });
    } else if (isStoryScreen) {
      onShowSavedStories?.();
    } else {
      onShowSavedStories?.();
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setIsMenuOpen(false);
  };

  const renderNavItems = () => (
    <>
      {!user ? (
        <>
          <a 
            href="/" 
            className="w-auto px-4 py-3 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </a>
          <a 
            href="/pricing" 
            className="w-auto px-4 py-3 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </a>
          <button
            onClick={() => {
              navigate('/auth/sign-in');
              setIsMenuOpen(false);
            }}
            className="w-auto px-4 py-3 bg-accent-400 text-left text-white rounded-lg hover:bg-accent-500 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              navigate('/auth/sign-up');
              setIsMenuOpen(false);
            }}
            className="w-auto px-4 py-3 bg-primary-500 text-left text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Sign Up
          </button>
        </>
      ) : (
        <>
          {user.user_metadata?.full_name && (
            <div className="px-4 py-2 text-gray-600 border-b border-gray-100 mb-1">
              {user.user_metadata.full_name}
            </div>
          )}
          <button
            onClick={handleCreateStory}
            className="w-full px-4 py-3 text-left bg-accent-400 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Magic className="w-5 h-5" />
            <span>Create Story</span>
          </button>
          {hasTemplates && !isStoryScreen && location.pathname !== '/pricing' && (
            <button
              onClick={handleTemplatesClick}
              className={`
                w-full px-4 py-3 text-left rounded-lg transition-colors
                ${showTemplates 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }
              `}
            >
              Story Templates
            </button>
          )}
          <button
            onClick={handleStoriesClick}
            className="w-full px-4 py-3 text-left text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
          >
            Library
          </button>
          <div className="relative">
            <a 
              href="/pricing" 
              className="block px-4 py-3 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Subscriptions
            </a>
            {hasActiveSubscription && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="w-6 h-6 text-white fill-primary-700" />
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-primary-600 rounded-lg transition-all duration-200 hover:shadow-sm text-left"
          >
            <span className="font-small text-gray-600">
              Sign Out
            </span>
          </button>
        </>
      )}
    </>
  );

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm py-4 px-4 sm:px-6 relative z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-secondary-500 p-2 rounded-lg shadow-lg">
              <Book className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl bg-gradient-to-r from-primary-700 to-primary-500 text-transparent bg-clip-text">
                <span className="font-bold">StoryMagic</span><span className="font-light"> Plus</span>
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Personalized stories for little readers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-5 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-full"
                aria-label="Toggle menu"
              >
                <div className={`
                  overflow-hidden transition-all duration-300
                  ${isHovered ? 'w-[140px]' : 'w-0'}
                `}>
                  <span className="whitespace-nowrap">Table of Contents</span>
                </div>
                {!isHovered && (isMenuOpen ? (
                  <X className="h-6 w-6 flex-shrink-0" />
                ) : (
                  <Menu className="h-6 w-6 flex-shrink-0" />
                ))}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div
          className={`
            absolute right-4 sm:right-6 top-[calc(100%+0.5rem)] transition-all duration-300
            ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'}
            sm:w-64 w-[calc(100%-2rem)] bg-white rounded-xl shadow-lg border border-gray-100
          `}
        >
          <nav className="flex flex-col p-2 gap-1">
            {renderNavItems()}
          </nav>
        </div>

        {/* Backdrop */}
        <div
          className={`
            fixed inset-0 bg-white backdrop-blur-sm transition-opacity duration-300
            ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          style={{ top: '80px' }}
          onClick={() => setIsMenuOpen(false)}
        />
      </div>
    </header>
  );
};

export default Header;