import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-50 py-4 sm:py-6 px-4 sm:px-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">
              © 2025 StoryMagic. All stories are generated with care and creativity.
            </p>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <div className="flex items-center text-gray-600 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500 fill-red-500" />
              <span>for little readers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;