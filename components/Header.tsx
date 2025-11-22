import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogoClick }) => {
  const [imgSrc, setImgSrc] = useState('/logo.png');

  const handleError = () => {
    if (imgSrc === '/logo.png') setImgSrc('/Logo.png');
    else if (imgSrc === '/Logo.png') setImgSrc('logo.png');
  };

  const handleLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onLogoClick?.();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-black/95 border-b-2 border-surfaceHighlight z-40 backdrop-blur-sm shadow-2xl">
      {/* Top red accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-dark via-primary to-primary-dark"></div>

      <div className="container mx-auto px-4 h-full flex justify-between items-center">

        {/* Logo Area */}
        <div className="flex items-center gap-4">
          <div
            className="flex flex-col justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onLogoClick}
            onKeyDown={handleLogoKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Return to calendar"
          >
            {/* Fallback Text Logo if Image fails or for style match */}
            <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wide leading-none">
              TIMBERCREEK
            </h1>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] leading-none mt-1">
              Men's Connect
            </span>
          </div>
        </div>

        {/* User Profile Preview - Industrial Tag Style */}
        {currentUser && (
          <div className="flex items-center bg-surfaceHighlight border-l-4 border-primary px-4 py-2 skew-x-[-10deg]">
            <div className="skew-x-[10deg] flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right leading-none">
                <span className="text-sm font-bold text-white uppercase">{currentUser.name}</span>
                <span className="text-[10px] text-primary font-bold tracking-wider">{currentUser.role}</span>
              </div>
              <img
                src={currentUser.profilePicture}
                alt={currentUser.name}
                className="w-10 h-10 border-2 border-white/20 object-cover"
                style={{ borderRadius: '0' }} // Square profile pics
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;