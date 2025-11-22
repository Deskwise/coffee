import React from 'react';
import { User } from '../types';

interface LeaderboardProps {
  users: User[];
  currentUser: User;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser }) => {
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const currentUserRank = sortedUsers.findIndex(u => u.id === currentUser.id) + 1;

  return (
    <div className="container mx-auto p-4 pt-16 pb-20">
      <h2 className="text-2xl font-bold text-center text-text mb-6">Leaderboard</h2>

      <div className="bg-surface p-4 rounded-lg shadow-md mb-6 text-center">
        <p className="text-text-secondary text-lg">
          Your Rank: <span className="font-bold text-primary">{currentUserRank}</span>
        </p>
        <p className="text-text-secondary text-lg">
          Your Points: <span className="font-bold text-primary">{currentUser.points}</span>
        </p>
      </div>

      <div className="bg-surface rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-background border-b border-gray-600 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 font-semibold text-text-secondary">
          <div className="col-span-1">Rank</div>
          <div className="col-span-2 md:col-span-1 flex items-center">Name</div>
          <div className="hidden md:block col-span-1">Role</div>
          <div className="hidden lg:block col-span-1">Bio</div>
          <div className="col-span-1 text-right">Points</div>
        </div>
        <ul className="divide-y divide-gray-700">
          {sortedUsers.map((user, index) => (
            <li
              key={user.id}
              className={`p-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 items-center ${
                user.id === currentUser.id ? 'bg-primary/20' : ''
              }`}
            >
              <div className="col-span-1 text-text">{index + 1}</div>
              <div className="col-span-2 md:col-span-1 flex items-center space-x-3">
                <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-medium text-text">{user.name}</span>
              </div>
              <div className="hidden md:block col-span-1 text-text-secondary text-sm">{user.role}</div>
              <div className="hidden lg:block col-span-1 text-text-secondary text-sm truncate">{user.bio}</div>
              <div className="col-span-1 text-right font-bold text-primary">{user.points}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;
