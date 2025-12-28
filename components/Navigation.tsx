import React from "react";
import { UserRole, AppView } from "../types";

interface NavigationProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  userRole: UserRole | null;
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  userRole,
}) => {
  const navItems = [
    {
      name: "Calendar",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      allowedRoles: [UserRole.MEMBER, UserRole.LEADER, UserRole.ADMINISTRATOR],
    },
    {
      name: "Leaderboard",
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      allowedRoles: [UserRole.MEMBER, UserRole.LEADER, UserRole.ADMINISTRATOR],
    },
    {
      name: "Profile",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      allowedRoles: [UserRole.MEMBER, UserRole.LEADER, UserRole.ADMINISTRATOR],
    },
    {
      name: "Admin",
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      allowedRoles: [UserRole.ADMINISTRATOR],
    },
  ];

  return (
    <nav
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto bg-surface border border-espresso rounded-full shadow-lg px-4 py-2 flex items-center gap-4">
        {navItems.map((item) => {
          const isActive = currentView === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onSelectView(item.name as AppView)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-full transition-colors duration-200
                ${isActive ? "text-caramel" : "text-text-secondary hover:text-text"}
              `}
              aria-label={item.name}
            >
              <div className="w-5 h-5">{item.icon}</div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
