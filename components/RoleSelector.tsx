import React from 'react';
import { User, UserRole } from '../types';
import Button from './Button';
import Input from './Input';

interface RoleSelectorProps {
  users: User[];
  onSelectUser: (user: User) => void;
  currentUser: User | null;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ users, onSelectUser, currentUser }) => {
  const [selectedUserId, setSelectedUserId] = React.useState<string>(currentUser?.id || '');

  React.useEffect(() => {
    if (currentUser && currentUser.id !== selectedUserId) {
      setSelectedUserId(currentUser.id);
    } else if (!currentUser && users.length > 0) {
      // Automatically select the first user if none is selected
      setSelectedUserId(users[0].id);
    }
  }, [currentUser, users, selectedUserId]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId);
    if (user) {
      onSelectUser(user);
    }
  };

  const currentRole = users.find(u => u.id === selectedUserId)?.role || 'N/A';

  return (
    <div className="bg-surface p-4 rounded-lg shadow-md mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex-1 w-full sm:w-auto">
        <label htmlFor="user-select" className="block text-sm font-medium text-text-secondary mb-1">
          Select User / Role:
        </label>
        <select
          id="user-select"
          value={selectedUserId}
          onChange={handleSelect}
          className="w-full p-2 bg-background border border-gray-600 rounded-md text-text"
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </div>
      <div className="text-text-secondary text-sm">
        Current Role: <span className="font-semibold text-text">{currentRole}</span>
      </div>
    </div>
  );
};

export default RoleSelector;
