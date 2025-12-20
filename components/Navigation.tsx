import React from 'react';
import { UserRole, AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  userRole: UserRole | null;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onSelectView, userRole }) => {
  const navItems = [
    {
      name: 'Calendar',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      allowedRoles: [UserRole.MEMBER, UserRole.LEADER, UserRole.ADMINISTRATOR]
    },
    {
      name: 'Leaderboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      allowedRoles: [UserRole.MEMBER, UserRole.LEADER, UserRole.ADMINISTRATOR]
    },
    {
      name: 'Profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      allowedRoles: [UserRole.MEMBER, UserRole.LEADER, UserRole.ADMINISTRATOR]
    },
    {
      name: 'Admin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      allowedRoles: [UserRole.ADMINISTRATOR]
    },
  ];

  return (
    <nav className="fixed bottom-2 left-0 right-0 z-50 flex justify-center items-end pointer-events-none">
      {/* Gradient fade at bottom - reduced height */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent -z-10"></div>

      {/* Floating Pill Container */}
      <div className="pointer-events-auto relative mx-4 mb-2">

        {/* Gradient Border Wrapper */}
        <div className="p-[1px] rounded-full bg-gradient-to-r from-[#7C2D12]/40 via-[#D97706]/60 to-[#7C2D12]/40 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">

          {/* Glassmorphic Inner Content */}
          <div className="bg-[#1a0f0a]/80 backdrop-blur-xl rounded-full px-6 py-3 flex items-center gap-2 sm:gap-6 relative min-w-[320px] justify-around">

            {/* Ambient Glow behind active items (optional subtle global glow) */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-full"></div>

            {navItems.map((item) => {
              // Temporary: Force render all items for visual testing
              // const isAllowed = userRole && item.allowedRoles.includes(userRole);
              // if (!isAllowed) return null;

              const isActive = currentView === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => onSelectView(item.name as AppView)}
                  className={`
                    group relative flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-300 focus:outline-none
                    ${isActive ? 'scale-105' : 'hover:scale-110'}
                  `}
                  aria-label={item.name}
                >
                  {/* Backlight Effect for Active State */}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#D97706]/10 blur-md rounded-full scale-150 animate-pulse"></div>
                  )}

                  {/* Icon */}
                  <div
                    className={`
                      relative z-10 transition-all duration-300
                      ${isActive
                        ? 'text-[#FEF3C7] drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]'
                        : 'text-[#78716C] group-hover:text-[#A8A29E]'
                      }
                    `}
                  >
                    {item.icon}
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      relative z-10 text-[10px] font-bold uppercase tracking-widest mt-1 transition-all duration-300
                      ${isActive
                        ? 'text-[#D97706] drop-shadow-[0_0_5px_rgba(217,119,6,0.5)]'
                        : 'text-[#57534E] group-hover:text-[#78716C]'
                      }
                    `}
                  >
                    {item.name}
                  </span>

                  {/* Subtle reflection/shine on active */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-white/40 blur-[1px]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;