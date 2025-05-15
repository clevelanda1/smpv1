import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { supabase } from '../../lib/supabase';
import { useStory } from '../../context/StoryContext';
import { Menu, X, CheckCircle2 } from 'lucide-react';
import { Magic, ClipboardData, Book, List } from 'react-bootstrap-icons';

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
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm py-4 px-4 sm:px-6 z-50 border-b border-gray-100">
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

          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg bg-secondary-500 text-white hover:bg-secondary-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <List className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <div
          className={`
            fixed left-0 right-0 top-[80px] transition-all duration-300 px-4 sm:px-6
            ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
          `}
        >
          <div className="relative">
            <div className="absolute right-0 w-full sm:w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <nav className="flex flex-col p-2 gap-1">
                {renderNavItems()}
              </nav>
            </div>
          </div>
        </div>

        {/* Backdrop */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-white/50 backdrop-blur-sm transition-opacity duration-300"
            style={{ top: '73px' }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
};

export default Header;