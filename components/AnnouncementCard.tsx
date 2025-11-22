import React from 'react';
import { Announcement, User, UserRole } from '../types';
import { format } from 'date-fns';
import Button from './Button';

interface AnnouncementCardProps {
  announcement: Announcement;
  author: User | undefined;
  currentUserRole: UserRole;
  onDelete?: (announcementId: string) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  author,
  currentUserRole,
  onDelete,
}) => {
  const canDelete = onDelete && (currentUserRole === UserRole.ADMINISTRATOR || currentUserRole === UserRole.LEADER);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      onDelete?.(announcement.id);
    }
  };

  return (
    <div className="bg-surface p-4 rounded-lg shadow-md border border-gray-600">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-primary pr-8">{announcement.title}</h3>
        {canDelete && (
          <Button onClick={handleDelete} variant="danger" className="p-2 text-xs">
            Delete
          </Button>
        )}
      </div>
      <p className="text-text-secondary mb-3">{announcement.content}</p>
      <div className="text-sm text-gray-400">
        Posted by: {author?.name || 'Unknown'} on {format(announcement.timestamp, 'MMM dd, yyyy h:mm a')}
      </div>
    </div>
  );
};

export default AnnouncementCard;
