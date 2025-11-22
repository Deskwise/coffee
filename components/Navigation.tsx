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
      name: 'Calendar', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ), allowedRoles: [UserRole.MEMBER, UserRole.LEADER, UserRole.ADMINISTRATOR]
    },
    {
      name: 'Leaderboard', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ), allowedRoles: [UserRole.MEMBER, UserRole.LEADER, UserRole.ADMINISTRATOR]
    },
    {
      name: 'Profile', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ), allowedRoles: [UserRole.MEMBER, UserRole.LEADER, UserRole.ADMINISTRATOR]
    },
    {
      name: 'Admin', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), allowedRoles: [UserRole.ADMINISTRATOR]
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

      <div className="relative mx-auto w-full max-w-md pb-4 px-2">
        {/* Navigation Bar - Industrial Rail Look */}
        <div className="bg-[#1a0f0a] border-t-4 border-[#3E2723] shadow-[0_-5px_20px_rgba(0,0,0,0.8)] flex justify-around items-center h-20 rounded-t-xl overflow-hidden relative">

          {/* Wood texture overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #3E2723 0px, #5D4037 2px, #3E2723 4px)' }}></div>

          {navItems.map((item) => {
            const isAllowed = userRole && item.allowedRoles.includes(userRole);
            if (!isAllowed) return null;

            const isActive = currentView === item.name;

            return (
              <button
                key={item.name}
                onClick={() => onSelectView(item.name as AppView)}
                className={`relative group flex flex-col items-center justify-center w-1/4 h-full focus:outline-none transition-all duration-300`}
              >
                {/* Active Background Flash */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#D97706]/20 to-transparent" />
                )}

                {/* Top Active Indicator - Copper/Amber */}
                {isActive && (
                  <div className="absolute top-0 w-1/2 h-1 bg-[#D97706] shadow-[0_0_10px_#D97706] rounded-b-full" />
                )}

                <div className={`transition-all duration-200 transform ${isActive ? 'text-[#D97706] scale-110 drop-shadow-[0_0_5px_rgba(217,119,6,0.5)]' : 'text-[#78716C] group-hover:text-[#A8A29E]'}`}>
                  {item.icon}
                </div>

                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isActive ? 'text-[#FEF3C7]' : 'text-[#57534E]'}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;