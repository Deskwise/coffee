
import React, { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isSameDay,
  set,
  isBefore,
  startOfHour,
  eachDayOfInterval,
  addMinutes
} from 'date-fns';

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
  const END_HOUR = 22; // Extended to 10 PM to create scrollable content
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
      if (a.startTime.getTime() !== b.startTime.getTime()) { return a.startTime.getTime() - b.startTime.getTime(); }
      return b.duration - a.duration;
    });
    const columns: DisplayEvent[][] = [];
    for (const event of sorted) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const lastEventInCol = col.at(-1);
        if (!lastEventInCol) continue;
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
    }
    const totalCols = columns.length;
    for (const e of sorted) { e.totalCols = totalCols; }
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

  const getMeetingStatus = (event: DisplayEvent) => {
    if (event.type === 'opportunity') return undefined;
    if (event.type === 'my-slot') return (event.data as Timeslot).isBooked ? MeetingStatus.CONFIRMED : undefined;
    return MeetingStatus.CONFIRMED;
  };

  return (
    <div className="sticky top-20 left-0 right-0 h-[calc(100vh-10rem)] flex flex-col bg-black text-white font-sans relative overflow-hidden">

      {/* Ambient Top Lighting - Pendant Light Effect */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D97706]/20 via-[#D97706]/5 to-transparent"></div>
        {/* Light pools - like hanging Edison bulbs */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-[#D97706] rounded-full blur-3xl opacity-10"></div>
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#B45309] rounded-full blur-3xl opacity-10"></div>
      </div>

      {/* TOP CONTROLS - Industrial Coffee Bar - Sticky within Calendar */}
      <div className="sticky top-0 shrink-0 px-4 py-4 flex flex-col gap-4 bg-[#1a0f0a] border-b border-[#3E2723] z-40 shadow-xl backdrop-blur-md texture-wood-grain">
        {/* Toggle */}
        <div className="flex bg-[#0a0806] border border-[#3E2723] rounded-lg self-center w-full max-w-md overflow-hidden shadow-inner">
          <button
            onClick={() => setViewMode('community')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'community' ? 'bg-[#14532D] text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]' : 'text-[#9CA3AF] hover:text-[#D97706] hover:bg-[#1a0f0a]'}`}
          >
            Community
          </button>
          <div className="w-px bg-[#3E2723]"></div>
          <button
            onClick={() => setViewMode('personal')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'personal' ? 'bg-[#B45309] text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]' : 'text-[#9CA3AF] hover:text-[#D97706] hover:bg-[#1a0f0a]'}`}
          >
            My Schedule
          </button>
        </div>

        {/* Date Nav */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase text-[#D97706] tracking-tight text-glow-amber flex items-center gap-2">
            <span className="text-3xl">☕</span> {format(currentWeekStart, 'MMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <Button variant="secondary" onClick={handlePrevWeek} className="p-0 w-10 h-10 border-[#3E2723] text-[#D97706]">‹</Button>
            <Button variant="secondary" onClick={handleToday} className="px-4 h-10 text-xs border-[#3E2723] text-[#D97706]">TODAY</Button>
            <Button variant="secondary" onClick={handleNextWeek} className="p-0 w-10 h-10 border-[#3E2723] text-[#D97706]">›</Button>
          </div>
        </div>
      </div>

      {/* GRID SCROLL CONTAINER */}
      <div className="flex-1 overflow-auto relative custom-scrollbar bg-[#0a0806]/80 backdrop-blur-sm texture-noise">
        <div className="grid grid-cols-[auto_repeat(7,minmax(120px,1fr))] grid-rows-[auto_32px_1fr] min-w-[840px]">

          {/* ROW 1: HEADERS */}
          <div className="sticky top-0 left-0 z-50 bg-[#1a0f0a] border-b border-r border-[#3E2723] w-12 h-10 shadow-md" style={{ gridArea: '1 / 1' }}></div>

          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toString()}
                className={`sticky top-0 z-40 border-b border-r border-[#3E2723] h-10 flex flex-col items-center justify-center shadow-md ${isToday ? 'bg-[#3E2723] border-b-[#D97706]' : 'bg-[#1a0f0a]'}`}
                style={{ gridArea: `1 / ${i + 2}` }}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-[#D97706]' : 'text-[#9CA3AF]'}`}>
                  {format(day, 'EEE')}
                </span>
                <div className={`h-5 w-5 flex items-center justify-center text-xs font-bold ${isToday ? 'text-white' : 'text-[#5D4037]'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}

          {/* ROW 2: BUFFER */}
          <div className="sticky left-0 z-30 bg-[#0a0806] border-r border-[#3E2723]" style={{ gridArea: '2 / 1' }}></div>
          {weekDays.map((day, i) => (
            <div key={`buffer-${day}`} className="bg-[#0a0806]/50 border-r border-[#3E2723] relative" style={{ gridArea: `2 / ${i + 2}` }}>
              {/* Wood grain pattern overlay */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #3E2723 0px, #5D4037 2px, #3E2723 4px)' }}></div>
            </div>
          ))}

          {/* ROW 3: CONTENT */}
          <div className="sticky left-0 z-30 bg-[#1a0f0a] border-r border-[#3E2723] relative shadow-lg" style={{ gridArea: '3 / 1', height: `${HOURS_COUNT * PIXELS_PER_HOUR}px` }}>
            {Array.from({ length: HOURS_COUNT }).map((_, i) => (
              <div key={`marker-${START_HOUR + i}`} className="absolute right-2 text-[10px] text-[#9CA3AF] font-bold transform -translate-y-1/2" style={{ top: `${i * PIXELS_PER_HOUR}px` }}>
                {format(set(new Date(), { hours: START_HOUR + i, minutes: 0 }), 'HH:mm')}
              </div>
            ))}
          </div>

          {weekDays.map((day, i) => {
            const rawDayEvents = eventsToDisplay.filter(e => isSameDay(e.startTime, day));
            const dayEvents = calculateEventLayout(rawDayEvents);

            return (
              <div key={day.toString()} className="relative border-r border-[#3E2723]/50" style={{ gridArea: `3 / ${i + 2}`, height: `${HOURS_COUNT * PIXELS_PER_HOUR}px` }}>
                {Array.from({ length: HOURS_COUNT }).map((_, h) => (
                  <div key={`line-${START_HOUR + h}`} className="absolute w-full border-t border-[#3E2723]/30 pointer-events-none" style={{ top: `${h * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }} />
                ))}

                {/* Interactive Slots Layer */}
                {Array.from({ length: HOURS_COUNT }).map((_, hourIndex) => {
                  const slotDate = set(day, { hours: START_HOUR + hourIndex, minutes: 0, seconds: 0, milliseconds: 0 });
                  const isPast = isBefore(slotDate, new Date());

                  if (isPast) {
                    // Disabled Past Slot - Very Dark with Diagonal Stripes
                    return (
                      <div
                        key={`disabled-${START_HOUR + hourIndex}`}
                        className="absolute w-full z-0 bg-[#000000]/70 texture-diagonal-stripes border-b border-[#3E2723]/30 flex items-center justify-center"
                        style={{ top: `${hourIndex * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px`, cursor: 'not-allowed' }}
                      >
                        <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-widest opacity-40">Past</span>
                      </div>
                    );
                  }

                  // Interactive Future Slot - Clean with Amber Glow
                  return (
                    <button
                      type="button"
                      key={`slot-${START_HOUR + hourIndex}`}
                      className="absolute w-full glow-available-slot cursor-pointer z-0 group/slot flex items-center justify-center outline-none p-0 border-0 bg-transparent"
                      style={{ top: `${hourIndex * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }}
                      onClick={() => onGridClick(day, START_HOUR + hourIndex)}
                    >
                      {/* Prominent Add Button on Hover */}
                      <div className="hidden group-hover/slot:flex items-center justify-center w-10 h-10 rounded-full bg-[#D97706] text-white shadow-[0_0_20px_rgba(217,119,6,0.6)] transform scale-0 group-hover/slot:scale-110 transition-all duration-200 border-2 border-white z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </button>
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
                      // My Post - Caramel/Amber
                      colors = 'bg-[#92400E]/90 border-[#F59E0B] text-[#FEF3C7] shadow-md';
                      label = 'MY POST';
                    } else {
                      // Open Opportunity - Forest Green
                      colors = 'bg-[#14532D]/90 border-[#34D399] text-[#D1FAE5] shadow-md';
                      label = 'OPEN';
                    }
                  } else if (event.type === 'my-slot') {
                    // Pending - Burnt Orange
                    colors = 'bg-[#7C2D12]/90 border-[#FB923C] text-[#FFEDD5] shadow-md';
                    label = 'PENDING';
                  } else if (event.type === 'community-meeting') {
                    // Locked - Dark Espresso
                    colors = 'bg-[#3E2723]/90 border-[#5D4037] text-[#D7CCC8] opacity-80';
                    label = 'LOCKED';
                  } else {
                    // Confirmed Meeting - Primary Red (Action)
                    colors = 'bg-[#B91C1C] border-[#FCA5A5] text-white shadow-[0_0_15px_rgba(185,28,28,0.5)]';
                    label = 'MISSION';
                  }

                  return (
                    <button
                      type="button"
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`absolute border-l-4 p-1.5 cursor-pointer hover:brightness-110 hover:scale-[1.02] transition-all flex flex-col justify-center rounded-r-md ${colors} z-20 outline-none focus:ring-2 focus:ring-white text-left`}
                      style={{ ...style }}
                    >
                      <div className="font-black text-[9px] uppercase tracking-wider leading-none mb-0.5 opacity-90">{label}</div>
                      <div className="text-[11px] font-bold truncate drop-shadow-md">{format(event.startTime, 'HH:mm')}</div>
                    </button>
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
          <div className="bg-[#1a0f0a] p-4 border-l-4 border-[#D97706] rounded-r-lg shadow-inner">
            <div className="text-xs text-[#9CA3AF] uppercase tracking-widest font-bold">TARGET DATE</div>
            <div className="text-2xl font-black text-white italic text-glow-amber">{newSlotDate ? format(newSlotDate, 'MMM dd @ HH:mm') : ''}</div>
          </div>

          <div>
            <div className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest">DURATION</div>
            <div className="flex gap-2 mt-1">
              {TIMESLOT_DURATIONS.map(d => (
                <button key={d.value} onClick={() => setNewSlotDuration(d.value)} className={`flex-1 py-3 font-bold uppercase border rounded-md transition-all shadow-sm ${newSlotDuration === d.value ? 'border-[#D97706] bg-[#D97706]/20 text-white' : 'border-[#3E2723] text-[#9CA3AF] hover:border-[#D97706] hover:text-white'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* --- NEW PROMINENT LOCATION SELECTOR --- */}
          <div>
            <div className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mb-2 block">TARGET LOCATION</div>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="relative w-full text-left group cursor-pointer overflow-hidden border border-[#3E2723] rounded-lg hover:border-[#D97706] transition-all duration-200 bg-[#0a0806] shadow-md outline-none focus:ring-2 focus:ring-[#D97706]"
            >
              {/* Wood Grain Pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #3E2723 0px, #5D4037 2px, #3E2723 4px)' }}></div>

              <div className="relative p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Icon Box */}
                  <div className="w-10 h-10 shrink-0 bg-[#1a0f0a] flex items-center justify-center border border-[#3E2723] rounded group-hover:border-[#D97706] group-hover:text-[#D97706] transition-colors shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-[#D97706] font-bold uppercase tracking-widest leading-none mb-1">LOCATION LOCKED</span>
                    <span className="text-lg md:text-xl font-black text-white uppercase truncate leading-none group-hover:text-[#D97706] transition-colors text-shadow-sm">
                      {locations.find(l => l.id === newSlotLocationId)?.name || 'SELECT DROPOINT'}
                    </span>
                  </div>
                </div>

                {/* Change Button Visual */}
                <div className="shrink-0 bg-[#1a0f0a] px-3 py-1.5 border border-[#3E2723] rounded text-xs font-bold text-white uppercase group-hover:bg-[#D97706] group-hover:border-[#D97706] transition-colors shadow-sm">
                  CHANGE
                </div>
              </div>
            </button>
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
            meetingStatus={getMeetingStatus(selectedEvent)}
            meetingId={selectedEvent.type === 'meeting' || selectedEvent.type === 'community-meeting' ? (selectedEvent.data as Meeting).id : undefined}
            attendee={users.find(u => {
              const d = selectedEvent.data;
              if ('attendeeUserId' in d) { return u.id === (d as any).attendeeUserId; }
              if ('bookedByUserId' in d) { return u.id === (d as any).bookedByUserId; }
              return false;
            })}
            viewOnly={selectedEvent.type === 'community-meeting'}
          />
        </Modal>
      )}
      <LocationSelectionModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} locations={locations.filter(l => l.isApproved)} currentUserLocation={TIMBERCREEK_CHURCH_COORDS} onSelectLocation={(id) => { setNewSlotLocationId(id); setIsLocationModalOpen(false); }} />
    </div>
  );
};

export default Calendar;
