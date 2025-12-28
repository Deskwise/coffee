import React from "react";
import { User } from "../types";

interface LeaderboardProps {
  users: User[];
  currentUser: User;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser }) => {
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const currentUserRank =
    sortedUsers.findIndex((u) => u.id === currentUser.id) + 1;

  return (
    <div className="container mx-auto p-4 pt-16 pb-20">
      <h2 className="text-3xl font-black text-caramel text-center mb-8 uppercase tracking-tight text-glow-amber">
        ☕ Leaderboard
      </h2>

      {/* Current User Stats - Leather Patch */}
      <div className="card-industrial p-6 rounded-xl mb-6 text-center border-4 border-espresso relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #3E2723 0px, #1a0f0a 2px, #3E2723 4px)",
          }}
        ></div>
        <div className="relative z-10">
          <p className="text-text-secondary text-sm uppercase tracking-widest font-bold mb-2">
            Your Standing
          </p>
          <div className="flex justify-center gap-8">
            <div>
              <span className="text-4xl font-black text-caramel">
                {currentUserRank}
              </span>
              <p className="text-xs text-text-secondary uppercase tracking-wider mt-1">
                Rank
              </p>
            </div>
            <div className="w-px bg-espresso"></div>
            <div>
              <span className="text-4xl font-black text-caramel">
                {currentUser.points}
              </span>
              <p className="text-xs text-text-secondary uppercase tracking-wider mt-1">
                Points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table - Industrial */}
      <div className="card-industrial rounded-xl shadow-2xl overflow-hidden border border-espresso">
        {/* Header */}
        <div className="p-4 bg-espresso border-b-2 border-espresso-light grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 font-bold text-text-secondary uppercase tracking-widest text-xs">
          <div className="col-span-1">Rank</div>
          <div className="col-span-2 md:col-span-1 flex items-center">Name</div>
          <div className="hidden md:block col-span-1">Role</div>
          <div className="hidden lg:block col-span-1">Bio</div>
          <div className="col-span-1 text-right">Points</div>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-espresso/30">
          {sortedUsers.map((user, index) => (
            <li
              key={user.id}
              className={`p-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 items-center transition-colors ${
                user.id === currentUser.id
                  ? "bg-caramel/20 border-l-4 border-caramel"
                  : "hover:bg-surfaceHighlight/50"
              }`}
            >
              <div className="col-span-1 text-text font-bold text-lg">
                {index === 0 && "🥇"}
                {index === 1 && "🥈"}
                {index === 2 && "🥉"}
                {index > 2 && index + 1}
              </div>
              <div className="col-span-2 md:col-span-1 flex items-center space-x-3">
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-10 h-10 rounded border-2 border-copper-dark object-cover shadow-sm"
                />
                <span className="font-bold text-text">{user.name}</span>
              </div>
              <div className="hidden md:block col-span-1 text-text-secondary text-xs uppercase tracking-wider">
                {user.role}
              </div>
              <div className="hidden lg:block col-span-1 text-text-secondary text-sm truncate">
                {user.bio}
              </div>
              <div className="col-span-1 text-right font-black text-caramel text-xl">
                {user.points}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;
