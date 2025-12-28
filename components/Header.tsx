import React, { useState } from "react";
import { User } from "../types";
import { useTheme } from "../src/context/ThemeContext";

interface HeaderProps {
  currentUser: User | null;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogoClick }) => {
  const [imgSrc, setImgSrc] = useState("/logo.png");
  const { theme, toggleTheme } = useTheme();

  const handleLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onLogoClick?.();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-surfaceHighlight border-b-4 border-espresso z-[100] shadow-2xl transition-colors duration-300">
      {/* Wood grain texture overlay (Only visible in Dark Mode via CSS opacity logic or keeping it for both if it fits) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--col-espresso) 0px, var(--bg-surface) 2px, var(--col-espresso) 4px)",
        }}
      ></div>

      {/* Top accent line - Copper/Amber */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-espresso-light via-caramel to-espresso-light"></div>

      <div className="container mx-auto px-4 h-full flex justify-between items-center relative z-10">
        {/* Logo Area */}
        <div className="flex items-center gap-4">
          <div
            className="cursor-pointer group"
            onClick={onLogoClick}
            onKeyDown={handleLogoKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Return to calendar"
          >
            <img
              src="/assets/images/timbercreek-logo.svg"
              alt="Timbercreek Men's Connect Logo"
              className="h-24 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
              style={{
                filter:
                  theme === "espresso"
                    ? "drop-shadow(0 0 8px rgba(217, 119, 6, 0.6)) drop-shadow(0 0 16px rgba(217, 119, 6, 0.3))"
                    : "drop-shadow(0 0 2px rgba(0,0,0,0.2))",
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-card bg-surface hover:bg-surfaceHighlight transition-all duration-300 text-caramel shadow-card"
            aria-label="Toggle Theme"
          >
            {theme === "espresso" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* User Profile Preview - Leather Patch Style */}
          {currentUser && (
            <div className="flex items-center bg-espresso border border-espresso-light px-1 py-1 rounded shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3 bg-surfaceHighlight px-3 py-1.5 rounded border border-espresso-light/50">
                <div className="hidden sm:flex flex-col text-right leading-none">
                  <span className="text-sm font-bold text-text uppercase tracking-wide">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] text-caramel font-bold tracking-widest uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <img
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded border border-espresso-light object-cover shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
