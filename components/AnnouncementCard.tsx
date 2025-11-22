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
    <div className="card-industrial p-5 rounded-xl shadow-lg border border-[#3E2723] relative overflow-hidden">
      {/* Wood grain texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #3E2723 0px, #1a0f0a 2px, #3E2723 4px)' }}></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-black text-[#D97706] pr-8 uppercase tracking-tight">{announcement.title}</h3>
          {canDelete && (
            <Button onClick={handleDelete} variant="danger" className="p-2 text-xs">
              Delete
            </Button>
          )}
        </div>
        <p className="text-[#A8A29E] mb-4 leading-relaxed">{announcement.content}</p>
        <div className="text-xs text-[#78716C] font-bold uppercase tracking-wider border-t border-[#3E2723] pt-3">
          Posted by: <span className="text-[#D97706]">{author?.name || 'Unknown'}</span> on {format(announcement.timestamp, 'MMM dd, yyyy h:mm a')}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
