
import React, { useState, useMemo } from 'react';
import {
  format,
  addWeeks,
  addDays,
  isSameDay,
  eachDayOfInterval,
  addMinutes,
  isBefore,
} from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';
import subWeeks from 'date-fns/subWeeks';
import setHours from 'date-fns/setHours';
import set from 'date-fns/set';

import Button from './Button';
import { Timeslot, User, Location, TimeslotDuration, Meeting, MeetingStatus } from '../types';
import Modal from './Modal';
import TimeslotCard from './TimeslotCard';
import LocationSelectionModal from './LocationSelectionModal';
import { TIMESLOT_DURATIONS, TIMBERCREEK_CHURCH_COORDS } from '../constants';

interface CalendarProps {
  currentUser: User;
  timeslots: Timeslot[];
  locations: Location[];
  users: User[];
  meetings: Meeting[];
  onCreateTimeslot: (timeslot: Omit<Timeslot, 'id' | 'isBooked'>) => Promise<void>;
  onAcceptTimeslot: (timeslotId: string, attendeeUserId: string) => Promise<void>;
  onDeleteTimeslot: (timeslotId: string) => Promise<void>;
  onCancelMeeting: (meetingId: string, cancellingUserId: string) => Promise<void>;
}

type ViewMode = 'community' | 'personal';

interface DisplayEvent {
  id: string;
  type: 'opportunity' | 'my-slot' | 'meeting' | 'community-meeting';
  data: Timeslot | Meeting;
  startTime: Date;
  duration: number;
  colIndex?: number;
  totalCols?: number;
}

const Calendar: React.FC<CalendarProps> = ({
  currentUser,
  timeslots,
  locations,
  users,
  meetings,
  onCreateTimeslot,
  onAcceptTimeslot,
  onDeleteTimeslot,
  onCancelMeeting,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [viewMode, setViewMode] = useState<ViewMode>('community');
  
  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  // Selection States
  const [selectedEvent, setSelectedEvent] = useState<DisplayEvent | null>(null);
  const [newSlotDate, setNewSlotDate] = useState<Date | null>(null);
  const [newSlotDuration, setNewSlotDuration] = useState<TimeslotDuration>(TimeslotDuration.SIXTY_MINUTES);
  const [newSlotLocationId, setNewSlotLocationId] = useState<string>('');
  const [repeatWeekly, setRepeatWeekly] = useState<boolean>(false);

  // Constants
  const START_HOUR = 5; 
  const END_HOUR = 22; 
  const HOURS_COUNT = END_HOUR - START_HOUR; 
  const PIXELS_PER_HOUR = 64; 

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: addDays(currentWeekStart, 6),
    });
  }, [currentWeekStart]);

  // --- Event Logic ---
  const eventsToDisplay = useMemo(() => {
    const now = new Date();
    if (viewMode === 'community') {
      const opportunities = timeslots
        .filter(t => !t.isBooked && isBefore(now, addMinutes(t.startTime, t.durationMinutes)))
        .map(t => ({ id: t.id, type: 'opportunity' as const, data: t, startTime: t.startTime, duration: t.durationMinutes }));

      const communityMeetings = meetings
        .filter(m => m.status === MeetingStatus.CONFIRMED && m.hostUserId !== currentUser.id && m.attendeeUserId !== currentUser.id && isBefore(now, addMinutes(m.startTime, m.durationMinutes)))
        .map(m => ({ id: m.id, type: 'community-meeting' as const, data: m, startTime: m.startTime, duration: m.durationMinutes }));

      return [...opportunities, ...communityMeetings];
    } else {
      const mySlots = timeslots
        .filter(t => t.hostUserId === currentUser.id && isBefore(now, addMinutes(t.startTime, t.durationMinutes)))
        .map(t => ({ id: t.id, type: 'my-slot' as const, data: t, startTime: t.startTime, duration: t.durationMinutes }));
      
      const myMeetings = meetings
        .filter(m => (m.attendeeUserId === currentUser.id || m.hostUserId === currentUser.id) && m.status === MeetingStatus.CONFIRMED && isBefore(now, addMinutes(m.startTime, m.durationMinutes)))
        .map(m => ({ id: m.id, type: 'meeting' as const, data: m, startTime: m.startTime, duration: m.durationMinutes }));

      const meetingTimeslotIds = new Set(myMeetings.map(m => (m.data as Meeting).timeslotId));
      const filteredSlots = mySlots.filter(s => !meetingTimeslotIds.has((s.data as Timeslot).id));

      return [...filteredSlots, ...myMeetings];
    }
  }, [viewMode, timeslots, meetings, currentUser.id]);

  const calculateEventLayout = (dayEvents: DisplayEvent[]) => {
    if (dayEvents.length === 0) return [];
    const sorted = [...dayEvents].sort((a, b) => {
      if (a.startTime.getTime() !== b.startTime.getTime()) return a.startTime.getTime() - b.startTime.getTime();
      return b.duration - a.duration;
    });
    const columns: DisplayEvent[][] = [];
    sorted.forEach(event => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const lastEventInCol = col[col.length - 1];
        const lastEventEnd = addMinutes(lastEventInCol.startTime, lastEventInCol.duration);
        if (event.startTime >= lastEventEnd) {
          col.push(event);
          event.colIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
        event.colIndex = columns.length - 1;
      }
    });
    const totalCols = columns.length;
    sorted.forEach(e => { e.totalCols = totalCols; });
    return sorted;
  };

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const handleToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const onGridClick = (day: Date, hour: number) => {
    const clickedDate = set(day, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });
    if (isBefore(clickedDate, new Date())) { return; }
    setNewSlotDate(clickedDate);
    if (locations.length > 0 && !newSlotLocationId) setNewSlotLocationId(locations[0].id);
    setRepeatWeekly(false);
    setIsPostModalOpen(true);
  };

  const onEventClick = (event: DisplayEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handlePostSubmit = async () => {
    if (!newSlotDate || !newSlotLocationId) return;
    try {
      await onCreateTimeslot({ hostUserId: currentUser.id, startTime: newSlotDate, durationMinutes: newSlotDuration, locationId: newSlotLocationId, repeatWeekly });
      setIsPostModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const getEventStyle = (event: DisplayEvent) => {
    const startHour = event.startTime.getHours();
    const startMin = event.startTime.getMinutes();
    const minutesFromCalendarStart = (startHour - START_HOUR) * 60 + startMin;
    const topPixels = (minutesFromCalendarStart / 60) * PIXELS_PER_HOUR;
    const heightPixels = (event.duration / 60) * PIXELS_PER_HOUR;
    const colIndex = event.colIndex || 0;
    const totalCols = event.totalCols || 1;
    const widthPercent = 100 / totalCols;
    const leftPercent = colIndex * widthPercent;
    return { top: `${topPixels}px`, height: `${heightPixels}px`, left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <div className="fixed top-20 left-0 right-0 bottom-20 flex flex-col bg-black text-white font-sans">
      
      {/* TOP CONTROLS (Static) - Industrial Look */}
      <div className="shrink-0 px-4 py-4 flex flex-col gap-4 bg-surface border-b-2 border-surfaceHighlight z-30 shadow-xl">
        {/* Toggle */}
        <div className="flex bg-black border border-gray-800 self-center w-full max-w-md transform skew-x-[-10deg]">
          <button 
            onClick={() => setViewMode('community')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-200 skew-x-[10deg] ${viewMode === 'community' ? 'bg-emerald-800 text-white' : 'text-gray-500 hover:text-white'}`}
          >
            OPPORTUNITIES
          </button>
          <button 
            onClick={() => setViewMode('personal')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-200 skew-x-[10deg] ${viewMode === 'personal' ? 'bg-primary text-white' : 'text-gray-500 hover:text-white'}`}
          >
            MY SCHEDULE
          </button>
        </div>

        {/* Date Nav */}
        <div className="flex justify-between items-center">
           <h2 className="text-2xl font-black uppercase text-white italic tracking-tight">
             {format(currentWeekStart, 'MMM yyyy')}
           </h2>
           <div className="flex gap-1">
             <Button variant="secondary" onClick={handlePrevWeek} className="p-0 w-10 h-10">‹</Button>
             <Button variant="secondary" onClick={handleToday} className="px-4 h-10 text-xs">TODAY</Button>
             <Button variant="secondary" onClick={handleNextWeek} className="p-0 w-10 h-10">›</Button>
           </div>
        </div>
      </div>

      {/* GRID SCROLL CONTAINER */}
      <div className="flex-1 overflow-auto relative custom-scrollbar bg-black" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #050505 0, #050505 2px, #000 2px, #000 4px)' }}>
        <div className="grid grid-cols-[auto_repeat(7,minmax(120px,1fr))] grid-rows-[auto_32px_1fr] min-w-[840px]">
          
          {/* ROW 1: HEADERS */}
          <div className="sticky top-0 left-0 z-50 bg-surface border-b border-r border-gray-800 w-12 h-10" style={{ gridArea: '1 / 1' }}></div>

          {weekDays.map((day, i) => {
             const isToday = isSameDay(day, new Date());
             return (
               <div 
                 key={day.toString()} 
                 className={`sticky top-0 z-40 border-b border-r border-gray-800 h-10 flex flex-col items-center justify-center ${isToday ? 'bg-primary/10 border-b-primary' : 'bg-surface'}`}
                 style={{ gridArea: `1 / ${i + 2}` }}
               >
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-gray-500'}`}>
                   {format(day, 'EEE')}
                 </span>
                 <div className={`h-5 w-5 flex items-center justify-center text-xs font-bold ${isToday ? 'text-white' : 'text-gray-400'}`}>
                   {format(day, 'd')}
                 </div>
               </div>
             );
          })}

          {/* ROW 2: BUFFER */}
          <div className="sticky left-0 z-30 bg-black border-r border-gray-800" style={{ gridArea: '2 / 1' }}></div>
          {weekDays.map((day, i) => (
             <div key={`buffer-${day}`} className="bg-black border-r border-gray-800 relative" style={{ gridArea: `2 / ${i + 2}` }}>
               {/* Tech pattern */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)', backgroundSize: '10px 10px' }}></div>
             </div>
          ))}

          {/* ROW 3: CONTENT */}
          <div className="sticky left-0 z-30 bg-surface border-r border-gray-800 relative" style={{ gridArea: '3 / 1', height: `${HOURS_COUNT * PIXELS_PER_HOUR}px` }}>
              {Array.from({ length: HOURS_COUNT }).map((_, i) => (
                <div key={i} className="absolute right-2 text-[10px] text-gray-500 font-bold transform -translate-y-1/2" style={{ top: `${i * PIXELS_PER_HOUR}px` }}>
                   {format(setHours(new Date(), START_HOUR + i), 'HH:mm')}
                </div>
              ))}
          </div>

          {weekDays.map((day, i) => {
             const rawDayEvents = eventsToDisplay.filter(e => isSameDay(e.startTime, day));
             const dayEvents = calculateEventLayout(rawDayEvents);
             
             return (
              <div key={day.toString()} className="relative border-r border-gray-700" style={{ gridArea: `3 / ${i + 2}`, height: `${HOURS_COUNT * PIXELS_PER_HOUR}px` }}>
                {Array.from({ length: HOURS_COUNT }).map((_, h) => (
                  <div key={h} className="absolute w-full border-t border-gray-800/20 pointer-events-none" style={{ top: `${h * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }} />
                ))}
                
                {/* Interactive Slots Layer */}
                {Array.from({ length: HOURS_COUNT }).map((_, hourIndex) => {
                    const slotDate = set(day, { hours: START_HOUR + hourIndex, minutes: 0, seconds: 0, milliseconds: 0 });
                    const isPast = isBefore(slotDate, new Date());

                    if (isPast) {
                      // Disabled Past Slot
                      return (
                        <div 
                          key={hourIndex} 
                          className="absolute w-full z-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.3)_0,rgba(0,0,0,0.3)_4px,transparent_4px,transparent_8px)] opacity-60 border-b border-gray-800"
                          style={{ top: `${hourIndex * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px`, cursor: 'not-allowed' }}
                        />
                      );
                    }
                    
                    // Interactive Future Slot
                    return (
                      <div 
                        key={hourIndex} 
                        className="absolute w-full bg-[#121212] border-b border-gray-800 hover:bg-primary/10 transition-colors cursor-pointer z-0 group/slot flex items-center justify-center" 
                        style={{ top: `${hourIndex * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }} 
                        onClick={() => onGridClick(day, START_HOUR + hourIndex)}
                      >
                         {/* Prominent Add Button on Hover */}
                         <div className="hidden group-hover/slot:flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white shadow-[0_0_15px_rgba(214,24,31,0.8)] transform scale-0 group-hover/slot:scale-100 transition-all duration-200 border-2 border-white z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                         </div>
                      </div>
                    );
                })}

                {/* Events Layer */}
                {dayEvents.map((event) => {
                    const style = getEventStyle(event);
                    let colors = '';
                    let label = '';

                    if (event.type === 'opportunity') {
                      const isMySlot = event.data.hostUserId === currentUser.id;
                      if (isMySlot) {
                          colors = 'bg-amber-900/80 border-amber-500 text-amber-100';
                          label = 'MY POST';
                      } else {
                          colors = 'bg-emerald-900/90 border-emerald-500 text-emerald-100';
                          label = 'OPEN';
                      }
                    } else if (event.type === 'my-slot') {
                      colors = 'bg-amber-900/80 border-amber-500 text-amber-100';
                      label = 'PENDING';
                    } else if (event.type === 'community-meeting') {
                      colors = 'bg-gray-800 border-gray-600 text-gray-400';
                      label = 'LOCKED';
                    } else {
                      colors = 'bg-primary border-red-400 text-white shadow-[0_0_10px_rgba(214,24,31,0.4)]';
                      label = 'MISSION';
                    }

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className={`absolute border-l-2 p-1 cursor-pointer hover:brightness-125 hover:scale-[1.02] transition-all flex flex-col justify-center shadow-sm ${colors} z-20`}
                        style={{ ...style, borderRadius: 0 }}
                      >
                        <div className="font-black text-[9px] uppercase tracking-wider leading-none mb-0.5">{label}</div>
                        <div className="text-[10px] font-bold truncate">{format(event.startTime, 'HH:mm')}</div>
                      </div>
                    );
                })}
              </div>
             );
          })}
        </div>
      </div>

      {/* MODALS (Simplified for theme) */}
      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} title="INITIATE POST">
        <div className="space-y-4">
           <div className="bg-surfaceHighlight p-4 border-l-4 border-primary">
             <div className="text-xs text-gray-400 uppercase tracking-widest">TARGET DATE</div>
             <div className="text-2xl font-black text-white italic">{newSlotDate ? format(newSlotDate, 'MMM dd @ HH:mm') : ''}</div>
           </div>
           
           <div>
             <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">DURATION</label>
             <div className="flex gap-2 mt-1">
               {TIMESLOT_DURATIONS.map(d => (
                 <button key={d.value} onClick={() => setNewSlotDuration(d.value)} className={`flex-1 py-3 font-bold uppercase border-2 skew-x-[-10deg] ${newSlotDuration === d.value ? 'border-primary bg-primary/20 text-white' : 'border-gray-700 text-gray-500'}`}>
                    <span className="skew-x-[10deg] block">{d.label}</span>
                 </button>
               ))}
             </div>
           </div>

           {/* --- NEW PROMINENT LOCATION SELECTOR --- */}
           <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">TARGET LOCATION</label>
              <div 
                onClick={() => setIsLocationModalOpen(true)} 
                className="relative group cursor-pointer overflow-hidden border-2 border-gray-700 hover:border-primary transition-all duration-200 bg-black"
              >
                {/* Industrial Striped Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #333 0, #333 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
                
                <div className="relative p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Icon Box */}
                    <div className="w-10 h-10 shrink-0 bg-gray-800 flex items-center justify-center border border-gray-600 group-hover:border-primary group-hover:text-primary transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                       <span className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mb-1">COORDINATES LOCKED</span>
                       <span className="text-lg md:text-xl font-black text-white uppercase truncate leading-none group-hover:text-primary transition-colors">
                         {locations.find(l => l.id === newSlotLocationId)?.name || 'SELECT DROPOINT'}
                       </span>
                    </div>
                  </div>

                  {/* Change Button Visual */}
                  <div className="shrink-0 bg-gray-800 px-3 py-1.5 border border-gray-600 text-xs font-bold text-white uppercase group-hover:bg-primary group-hover:border-primary transition-colors skew-x-[-10deg]">
                    <span className="skew-x-[10deg] block">CHANGE</span>
                  </div>
                </div>
              </div>
            </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsPostModalOpen(false)}>ABORT</Button>
            <Button onClick={handlePostSubmit}>CONFIRM POST</Button>
          </div>
        </div>
      </Modal>
      {/* Other modals reuse generic components */}
      {selectedEvent && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="MISSION DETAILS">
           <TimeslotCard
             timeslot={selectedEvent.data.hasOwnProperty('timeslotId') ? timeslots.find(t => t.id === (selectedEvent.data as Meeting).timeslotId) || selectedEvent.data as any : selectedEvent.data as Timeslot}
             host={users.find(u => u.id === selectedEvent.data.hostUserId)}
             location={locations.find(l => l.id === selectedEvent.data.locationId)}
             currentUser={currentUser}
             isCurrentUserHost={selectedEvent.data.hostUserId === currentUser.id}
             onAccept={async (id) => { await onAcceptTimeslot(id, currentUser.id); setIsDetailModalOpen(false); }}
             onDelete={async (id) => { await onDeleteTimeslot(id); setIsDetailModalOpen(false); }}
             onCancelMeeting={async (id) => { await onCancelMeeting(id, currentUser.id); setIsDetailModalOpen(false); }}
             meetingStatus={selectedEvent.type === 'opportunity' ? undefined : selectedEvent.type === 'my-slot' ? (selectedEvent.data as Timeslot).isBooked ? MeetingStatus.CONFIRMED : undefined : MeetingStatus.CONFIRMED}
             meetingId={selectedEvent.type === 'meeting' || selectedEvent.type === 'community-meeting' ? (selectedEvent.data as Meeting).id : undefined}
             attendee={users.find(u => { const d = selectedEvent.data; if ('attendeeUserId' in d) return u.id === d.attendeeUserId; if ('bookedByUserId' in d) return u.id === d.bookedByUserId; return false; })}
             viewOnly={selectedEvent.type === 'community-meeting'}
           />
        </Modal>
      )}
      <LocationSelectionModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} locations={locations.filter(l => l.isApproved)} currentUserLocation={TIMBERCREEK_CHURCH_COORDS} onSelectLocation={(id) => { setNewSlotLocationId(id); setIsLocationModalOpen(false); }} />
    </div>
  );
};

export default Calendar;
