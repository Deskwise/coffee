import React, { useState } from "react";
import { User } from "../types";

interface HeaderProps {
  currentUser: User | null;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogoClick }) => {
  const [imgSrc, setImgSrc] = useState("/logo.png");

  const handleLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onLogoClick?.();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#1a0f0a] border-b-4 border-[#3E2723] z-[100] shadow-2xl">
      {/* Wood grain texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #3E2723 0px, #1a0f0a 2px, #3E2723 4px)",
        }}
      ></div>

      {/* Top accent line - Copper/Amber */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7C2D12] via-[#D97706] to-[#7C2D12]"></div>

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
                  "drop-shadow(0 0 8px rgba(217, 119, 6, 0.6)) drop-shadow(0 0 16px rgba(217, 119, 6, 0.3))",
              }}
            />
          </div>
        </div>

        {/* User Profile Preview - Leather Patch Style */}
        {currentUser && (
          <div className="flex items-center bg-[#3E2723] border border-[#5D4037] px-1 py-1 rounded shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 bg-[#281912] px-3 py-1.5 rounded border border-[#5D4037]/50">
              <div className="hidden sm:flex flex-col text-right leading-none">
                <span className="text-sm font-bold text-[#E7E5E4] uppercase tracking-wide">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-[#D97706] font-bold tracking-widest uppercase">
                  {currentUser.role}
                </span>
              </div>
              <img
                src={currentUser.profilePicture}
                alt={currentUser.name}
                className="w-9 h-9 rounded border border-[#7C2D12] object-cover shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
