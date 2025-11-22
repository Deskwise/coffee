
import React, { useState } from 'react';
import { Timeslot, User, Location, MeetingStatus, UserRole } from '../types';
import { format, isBefore } from 'date-fns';
import startOfHour from 'date-fns/startOfHour';
import Button from './Button';

interface TimeslotCardProps {
  timeslot: Timeslot;
  host: User | undefined;
  location: Location | undefined;
  currentUser: User;
  isCurrentUserHost: boolean;
  onAccept: (timeslotId: string) => Promise<void>;
  onDelete: (timeslotId: string) => Promise<void>;
  onCancelMeeting: (meetingId: string) => Promise<void>;
  meetingStatus?: MeetingStatus;
  meetingId?: string;
  attendee?: User;
  viewOnly?: boolean;
}

const TimeslotCard: React.FC<TimeslotCardProps> = ({
  timeslot,
  host,
  location,
  currentUser,
  isCurrentUserHost,
  onAccept,
  onDelete,
  onCancelMeeting,
  meetingStatus,
  meetingId,
  attendee,
  viewOnly = false,
}) => {
  const [confirmAction, setConfirmAction] = useState<'delete' | 'accept' | 'cancel' | null>(null);
  const isPast = isBefore(timeslot.startTime, startOfHour(new Date()));
  
  // Header Config
  const isBooked = timeslot.isBooked || meetingStatus === MeetingStatus.CONFIRMED;
  
  let borderColor = 'border-gray-800';
  let accentColor = 'bg-gray-700';
  let statusText = 'OPEN SLOT';
  let statusTextColor = 'text-gray-400';

  if (viewOnly && isBooked) {
    borderColor = 'border-gray-700';
    statusText = 'COMMUNITY EVENT';
    accentColor = 'bg-gray-600';
  } else if (isBooked) {
    borderColor = 'border-primary';
    accentColor = 'bg-primary';
    statusText = 'MISSION CONFIRMED';
    statusTextColor = 'text-primary';
  } else if (isCurrentUserHost) {
    borderColor = 'border-amber-600';
    accentColor = 'bg-amber-600';
    statusText = 'PENDING...';
    statusTextColor = 'text-amber-500';
  } else {
    // Open Opportunity
    borderColor = 'border-emerald-600';
    accentColor = 'bg-emerald-600';
    statusText = 'OPPORTUNITY TARGET';
    statusTextColor = 'text-emerald-500';
  }

  const showActions = !viewOnly && !isPast;

  return (
    <div className={`relative bg-surface border-l-4 ${borderColor} p-0 shadow-card mb-4 ${isPast ? 'opacity-50' : ''}`}>
      {/* Industrial Header Strip */}
      <div className="bg-surfaceHighlight p-2 flex justify-between items-center border-b border-gray-800">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${accentColor} animate-pulse`}></div>
            <span className={`font-black text-xs uppercase tracking-widest ${statusTextColor}`}>{statusText}</span>
         </div>
         {isPast && <span className="bg-gray-800 text-gray-500 text-[10px] font-bold px-2 py-0.5 uppercase">EXPIRED</span>}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-4xl font-black text-white tracking-tighter leading-none">
              {format(timeslot.startTime, 'HH:mm')}
            </h4>
            <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">
              {format(timeslot.startTime, 'EEEE, MMM do')}
            </p>
          </div>
          <div className="text-right border-r-2 border-gray-700 pr-3">
             <span className="block text-xl font-bold text-white">{timeslot.durationMinutes}</span>
             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">MIN</span>
          </div>
        </div>

        {/* --- NEW PROMINENT LOCATION BLOCK --- */}
        <div className="mb-6 relative">
          {/* Skewed Background Decoration */}
          <div className="absolute inset-0 bg-surfaceHighlight transform skew-x-[-5deg] border-l-4 border-primary opacity-50"></div>
          
          <div className="relative p-4 flex items-center gap-4 border border-gray-700/50">
              <div className="w-10 h-10 shrink-0 bg-black border border-gray-600 flex items-center justify-center text-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
              </div>
              <div className="overflow-hidden">
                 <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-0.5">MISSION LOCATION</div>
                 <div className="text-white font-black uppercase text-lg leading-tight truncate">{location?.name || 'Unknown Target'}</div>
                 <div className="text-gray-500 text-xs truncate mt-0.5">{location?.address}</div>
              </div>
          </div>
        </div>

        {/* Personnel Block */}
        <div className="flex flex-col gap-2 text-sm border-t border-gray-800 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-500 uppercase font-bold text-xs">Host Operator</span>
            <span className={`font-bold uppercase ${isCurrentUserHost ? 'text-primary' : 'text-white'}`}>
                {isCurrentUserHost ? 'YOU' : host?.name}
            </span>
          </div>
          {(isBooked) && attendee && (
            <div className="flex justify-between">
                <span className="text-gray-500 uppercase font-bold text-xs">Attendee</span>
                <span className="text-white font-bold uppercase">{attendee.name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-6 flex flex-col gap-3">
            
            {/* Accept Flow */}
            {!isBooked && !isCurrentUserHost && (
               confirmAction === 'accept' ? (
                 <div className="flex gap-2">
                    <Button onClick={() => setConfirmAction(null)} variant="secondary" className="flex-1">Abort</Button>
                    <Button onClick={() => onAccept(timeslot.id)} className="flex-1 bg-emerald-600 border-emerald-600">CONFIRM</Button>
                 </div>
               ) : (
                 <Button onClick={() => setConfirmAction('accept')} className="w-full bg-emerald-700 hover:bg-emerald-600 border-emerald-500">
                   ACCEPT MISSION
                 </Button>
               )
            )}

            {/* Delete Flow */}
            {!isBooked && isCurrentUserHost && (
              confirmAction === 'delete' ? (
                 <div className="flex gap-2">
                    <Button onClick={() => setConfirmAction(null)} variant="secondary" className="flex-1">Cancel</Button>
                    <Button onClick={() => onDelete(timeslot.id)} variant="danger" className="flex-1">SCRUB</Button>
                 </div>
              ) : (
                <Button onClick={() => setConfirmAction('delete')} variant="secondary" className="w-full border-red-900/50 text-red-500 hover:bg-red-900/20">
                  ABORT POST
                </Button>
              )
            )}

            {/* Cancel Flow */}
            {isBooked && meetingStatus === MeetingStatus.CONFIRMED && (
               confirmAction === 'cancel' ? (
                 <div className="flex gap-2">
                    <Button onClick={() => setConfirmAction(null)} variant="secondary" className="flex-1">Return</Button>
                    <Button onClick={() => meetingId && onCancelMeeting(meetingId)} variant="danger" className="flex-1">Confirm Cancel</Button>
                 </div>
               ) : (
                 <Button onClick={() => setConfirmAction('cancel')} variant="danger" className="w-full">
                   CANCEL MISSION
                 </Button>
               )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeslotCard;
