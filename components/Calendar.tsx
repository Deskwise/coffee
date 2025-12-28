import React, { useState, useMemo, useEffect, useRef } from "react";
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
  addMinutes,
} from "date-fns";

import Button from "./Button";
import {
  Timeslot,
  User,
  Location,
  TimeslotDuration,
  Meeting,
  MeetingStatus,
} from "../types";
import Modal from "./Modal";
import TimeslotCard from "./TimeslotCard";
import LocationSelectionModal from "./LocationSelectionModal";
import { TIMESLOT_DURATIONS, TIMBERCREEK_CHURCH_COORDS } from "../constants";

interface CalendarProps {
  currentUser: User;
  timeslots: Timeslot[];
  locations: Location[];
  users: User[];
  meetings: Meeting[];
  onCreateTimeslot: (
    timeslot: Omit<Timeslot, "id" | "isBooked">,
  ) => Promise<void>;
  onAcceptTimeslot: (
    timeslotId: string,
    attendeeUserId: string,
  ) => Promise<void>;
  onDeleteTimeslot: (timeslotId: string) => Promise<void>;
  onCancelMeeting: (
    meetingId: string,
    cancellingUserId: string,
  ) => Promise<void>;
}

type ViewMode = "community" | "personal";

interface DisplayEvent {
  id: string;
  type: "opportunity" | "my-slot" | "meeting" | "community-meeting";
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
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [viewMode, setViewMode] = useState<ViewMode>("community");
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null,
  );

  // Drag Scroll Ref
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeftStart = useRef(0);
  const scrollTopStart = useRef(0);

  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Selection States
  const [selectedEvent, setSelectedEvent] = useState<DisplayEvent | null>(null);
  const [newSlotDate, setNewSlotDate] = useState<Date | null>(null);
  const [newSlotDuration, setNewSlotDuration] = useState<TimeslotDuration>(
    TimeslotDuration.SIXTY_MINUTES,
  );
  const [newSlotLocationId, setNewSlotLocationId] = useState<string>("");
  const [repeatWeekly, setRepeatWeekly] = useState<boolean>(false);

  // Constants
  const START_HOUR = 5;
  const END_HOUR = 22; // Extended to 10 PM to create scrollable content
  const HOURS_COUNT = END_HOUR - START_HOUR;
  const PIXELS_PER_HOUR = 64;
  const GRID_COLS_CLASS = "grid-cols-[64px_repeat(7,minmax(120px,1fr))]";

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: addDays(currentWeekStart, 6),
    });
  }, [currentWeekStart]);

  // Reset slide direction after animation completes
  useEffect(() => {
    if (slideDirection !== null) {
      const timer = setTimeout(() => setSlideDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // Sync scroll
  const isSyncing = useRef(false);

  const handleBodyScroll = () => {
    if (!bodyRef.current || !headerRef.current) return;
    if (isSyncing.current) return;
    isSyncing.current = true;
    headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
    setTimeout(() => {
      isSyncing.current = false;
    }, 50);
  };

  const handleHeaderScroll = () => {
    if (!bodyRef.current || !headerRef.current) return;
    if (isSyncing.current) return;
    isSyncing.current = true;
    bodyRef.current.scrollLeft = headerRef.current.scrollLeft;
    setTimeout(() => {
      isSyncing.current = false;
    }, 50);
  };

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!bodyRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - bodyRef.current.offsetLeft;
    startY.current = e.pageY - bodyRef.current.offsetTop;
    scrollLeftStart.current = bodyRef.current.scrollLeft;
    scrollTopStart.current = bodyRef.current.scrollTop;
    bodyRef.current.style.cursor = "grabbing";
    bodyRef.current.style.userSelect = "none";
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (bodyRef.current) {
      bodyRef.current.style.cursor = "grab";
      bodyRef.current.style.removeProperty("user-select");
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (bodyRef.current) {
      bodyRef.current.style.cursor = "grab";
      bodyRef.current.style.removeProperty("user-select");
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !bodyRef.current) return;
    e.preventDefault();
    const x = e.pageX - bodyRef.current.offsetLeft;
    const y = e.pageY - bodyRef.current.offsetTop;
    const walkX = (x - startX.current) * 1.5; // Scroll speed multiplier
    const walkY = (y - startY.current) * 1.5;
    bodyRef.current.scrollLeft = scrollLeftStart.current - walkX;
    bodyRef.current.scrollTop = scrollTopStart.current - walkY;
  };

  // --- Event Logic ---
  const eventsToDisplay = useMemo(() => {
    const now = new Date();
    if (viewMode === "community") {
      const opportunities = timeslots
        .filter(
          (t) =>
            !t.isBooked &&
            isBefore(now, addMinutes(t.startTime, t.durationMinutes)),
        )
        .map((t) => ({
          id: t.id,
          type: "opportunity" as const,
          data: t,
          startTime: t.startTime,
          duration: t.durationMinutes,
        }));

      const communityMeetings = meetings
        .filter(
          (m) =>
            m.status === MeetingStatus.CONFIRMED &&
            m.hostUserId !== currentUser.id &&
            m.attendeeUserId !== currentUser.id &&
            isBefore(now, addMinutes(m.startTime, m.durationMinutes)),
        )
        .map((m) => ({
          id: m.id,
          type: "community-meeting" as const,
          data: m,
          startTime: m.startTime,
          duration: m.durationMinutes,
        }));

      return [...opportunities, ...communityMeetings];
    } else {
      const mySlots = timeslots
        .filter(
          (t) =>
            t.hostUserId === currentUser.id &&
            isBefore(now, addMinutes(t.startTime, t.durationMinutes)),
        )
        .map((t) => ({
          id: t.id,
          type: "my-slot" as const,
          data: t,
          startTime: t.startTime,
          duration: t.durationMinutes,
        }));

      const myMeetings = meetings
        .filter(
          (m) =>
            (m.attendeeUserId === currentUser.id ||
              m.hostUserId === currentUser.id) &&
            m.status === MeetingStatus.CONFIRMED &&
            isBefore(now, addMinutes(m.startTime, m.durationMinutes)),
        )
        .map((m) => ({
          id: m.id,
          type: "meeting" as const,
          data: m,
          startTime: m.startTime,
          duration: m.durationMinutes,
        }));

      const meetingTimeslotIds = new Set(
        myMeetings.map((m) => (m.data as Meeting).timeslotId),
      );
      const filteredSlots = mySlots.filter(
        (s) => !meetingTimeslotIds.has((s.data as Timeslot).id),
      );

      return [...filteredSlots, ...myMeetings];
    }
  }, [viewMode, timeslots, meetings, currentUser.id]);

  const calculateEventLayout = (dayEvents: DisplayEvent[]) => {
    if (dayEvents.length === 0) return [];
    const sorted = [...dayEvents].sort((a, b) => {
      if (a.startTime.getTime() !== b.startTime.getTime()) {
        return a.startTime.getTime() - b.startTime.getTime();
      }
      return b.duration - a.duration;
    });
    const columns: DisplayEvent[][] = [];
    for (const event of sorted) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const lastEventInCol = col.at(-1);
        if (!lastEventInCol) continue;
        const lastEventEnd = addMinutes(
          lastEventInCol.startTime,
          lastEventInCol.duration,
        );
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
    for (const e of sorted) {
      e.totalCols = totalCols;
    }
    return sorted;
  };

  const handlePrevWeek = () => {
    setSlideDirection("right");
    setTimeout(() => setCurrentWeekStart(subWeeks(currentWeekStart, 1)), 50);
  };
  const handleNextWeek = () => {
    setSlideDirection("left");
    setTimeout(() => setCurrentWeekStart(addWeeks(currentWeekStart, 1)), 50);
  };
  const handleToday = () => {
    const today = startOfWeek(new Date(), { weekStartsOn: 1 });
    if (isBefore(today, currentWeekStart)) {
      setSlideDirection("right");
    } else {
      setSlideDirection("left");
    }
    setTimeout(() => setCurrentWeekStart(today), 50);
  };

  const onGridClick = (day: Date, hour: number) => {
    if (isDragging.current) return; // Prevent click when dragging
    const clickedDate = set(day, {
      hours: hour,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    if (isBefore(clickedDate, new Date())) {
      return;
    }
    setNewSlotDate(clickedDate);
    if (locations.length > 0 && !newSlotLocationId)
      setNewSlotLocationId(locations[0].id);
    setRepeatWeekly(false);
    setIsPostModalOpen(true);
  };

  const onEventClick = (event: DisplayEvent) => {
    if (isDragging.current) return; // Prevent click when dragging
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handlePostSubmit = async () => {
    if (!newSlotDate || !newSlotLocationId) return;
    try {
      await onCreateTimeslot({
        hostUserId: currentUser.id,
        startTime: newSlotDate,
        durationMinutes: newSlotDuration,
        locationId: newSlotLocationId,
        repeatWeekly,
      });
      setIsPostModalOpen(false);
    } catch (e) {
      console.error(e);
    }
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
    return {
      top: `${topPixels}px`,
      height: `${heightPixels}px`,
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const getMeetingStatus = (event: DisplayEvent) => {
    if (event.type === "opportunity") return undefined;
    if (event.type === "my-slot")
      return (event.data as Timeslot).isBooked
        ? MeetingStatus.CONFIRMED
        : undefined;
    return MeetingStatus.CONFIRMED;
  };

  return (
    <div className="fixed top-20 left-0 right-0 bottom-20 flex flex-col bg-background text-text font-sans relative overflow-hidden z-40">
      {/* TOP CONTROLS */}
      <div className="relative shrink-0 px-4 py-4 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 bg-surface border-b border-espresso z-[100] min-h-[80px]">
        {/* Empty Left Column for Centering */}
        <div className="hidden sm:block"></div>

        {/* Sliding Segmented Control - Centered */}
        <div className="relative flex bg-background border border-espresso rounded-full p-1 w-full max-w-xs shadow-inner mx-auto z-50">
          {/* Sliding Pill */}
          <div
            className={`absolute top-1 bottom-1 rounded-full shadow-md transition-all duration-300 ease-out z-0 ${viewMode === "community" ? "left-1 w-[calc(50%-4px)] bg-forest" : "left-[calc(50%+4px)] w-[calc(50%-8px)] bg-copper"}`}
          ></div>

          <button
            onClick={() => setViewMode("community")}
            className={`flex-1 relative z-10 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${viewMode === "community" ? "text-white" : "text-text-secondary hover:text-white"}`}
          >
            Community
          </button>
          <button
            onClick={() => setViewMode("personal")}
            className={`flex-1 relative z-10 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${viewMode === "personal" ? "text-white" : "text-text-secondary hover:text-white"}`}
          >
            My Schedule
          </button>
        </div>

        {/* Consolidated Date & Nav - Right Aligned */}
        <div className="flex items-center justify-center sm:justify-end gap-4 bg-background/50 p-1.5 rounded-lg border border-espresso/50 sm:justify-self-end w-fit mx-auto sm:mx-0">
          <Button
            variant="secondary"
            onClick={handlePrevWeek}
            className="w-8 h-8 p-0 rounded-md border-espresso text-caramel hover:bg-espresso hover:text-white transition-colors"
          >
            ‹
          </Button>

          <div className="text-center min-w-[120px]">
            <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-none">
              Current View
            </div>
            <div className="text-lg font-black uppercase text-caramel tracking-tight text-glow-amber leading-none">
              {format(currentWeekStart, "MMM yyyy")}
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={handleNextWeek}
            className="w-8 h-8 p-0 rounded-md border-espresso text-caramel hover:bg-espresso hover:text-white transition-colors"
          >
            ›
          </Button>

          <div className="w-px h-6 bg-espresso mx-1"></div>

          <Button
            variant="secondary"
            onClick={handleToday}
            className="h-8 px-3 text-[10px] rounded-md border-espresso text-caramel hover:bg-espresso hover:text-white transition-colors"
          >
            TODAY
          </Button>
        </div>
      </div>

      {/* --- SPLIT VIEW: HEADER & BODY --- */}

      {/* 1. HEADER ROW (Separate Scroller, Synced via Ref) */}
      <div
        ref={headerRef}
        className="flex-none overflow-x-auto overflow-y-hidden border-b border-caramel/30 bg-surface z-[60]"
        onScroll={handleHeaderScroll}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
      >
        <div className={`grid ${GRID_COLS_CLASS} min-w-[840px]`}>
          {/* Top Left Corner */}
          <div className="bg-surface border-r border-espresso/30 h-14 flex items-center justify-center">
            <span className="text-[10px] text-espresso-light font-bold">
              TIME
            </span>
          </div>
          {/* Day Headers */}
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toString()}
                className={`h-14 flex flex-col items-center justify-center border-l border-espresso/10 ${isToday ? "bg-espresso" : ""}`}
              >
                <span
                  className={`text-sm font-black uppercase tracking-widest mb-0.5 ${isToday ? "text-caramel" : "text-text-secondary"}`}
                >
                  {format(day, "EEE")}
                </span>
                <div
                  className={`h-8 w-8 flex items-center justify-center text-xl font-bold rounded-full ${isToday ? "text-white bg-caramel/20" : "text-espresso-light"}`}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SCROLLABLE BODY (Drag to Scroll) */}
      <div
        ref={bodyRef}
        className="flex-1 overflow-auto custom-scrollbar bg-background cursor-grab active:cursor-grabbing z-10"
        onScroll={handleBodyScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          willChange: "scroll-position",
        }}
      >
        {" "}
        <div
          className={`grid ${GRID_COLS_CLASS} min-w-[840px] relative`}
          style={{ height: `${HOURS_COUNT * PIXELS_PER_HOUR}px` }}
        >
          {/* LEFT COLUMN: Time Labels */}
          <div className="bg-surface border-r border-espresso/30 relative">
            {Array.from({ length: HOURS_COUNT }).map((_, i) => (
              <div
                key={`marker-${START_HOUR + i}`}
                className="absolute right-2 text-sm text-text-secondary font-bold transform -translate-y-1/2"
                style={{ top: `${i * PIXELS_PER_HOUR}px` }}
              >
                {format(
                  set(new Date(), { hours: START_HOUR + i, minutes: 0 }),
                  "h a",
                )}
              </div>
            ))}
          </div>

          {/* DAY COLUMNS */}
          {weekDays.map((day, i) => {
            const rawDayEvents = eventsToDisplay.filter((e) =>
              isSameDay(e.startTime, day),
            );
            const dayEvents = calculateEventLayout(rawDayEvents);

            return (
              <div
                key={day.toString()}
                className="relative border-l border-espresso/20"
              >
                {/* Interactive Slots Layer */}
                {Array.from({ length: HOURS_COUNT }).map((_, hourIndex) => {
                  const slotDate = set(day, {
                    hours: START_HOUR + hourIndex,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0,
                  });
                  const isPast = isBefore(slotDate, new Date());

                  if (isPast) {
                    return (
                      <div
                        key={`disabled-${START_HOUR + hourIndex}`}
                        className="absolute w-full z-0 bg-black/80 border-b border-espresso/10 flex items-center justify-center"
                        style={{
                          top: `${hourIndex * PIXELS_PER_HOUR}px`,
                          height: `${PIXELS_PER_HOUR}px`,
                        }}
                      />
                    );
                  }

                  return (
                    <button
                      type="button"
                      key={`slot-${START_HOUR + hourIndex}`}
                      className="absolute w-full glow-available-slot cursor-pointer z-0 group/slot flex items-center justify-center outline-none p-0 bg-transparent border-t border-espresso/10"
                      style={{
                        top: `${hourIndex * PIXELS_PER_HOUR}px`,
                        height: `${PIXELS_PER_HOUR}px`,
                      }}
                      onClick={() => onGridClick(day, START_HOUR + hourIndex)}
                    >
                      <div className="hidden group-hover/slot:flex items-center justify-center w-8 h-8 rounded-full bg-caramel text-white transition-opacity duration-200 border-2 border-white z-10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </button>
                  );
                })}
                {/* Events Layer */}
                {dayEvents.map((event) => {
                  const style = getEventStyle(event);
                  let colors = "";
                  let label = "";

                  if (event.type === "opportunity") {
                    const isMySlot = event.data.hostUserId === currentUser.id;
                    if (isMySlot) {
                      colors =
                        "bg-[#92400E]/90 border-[#F59E0B] text-[#FEF3C7] shadow-md";
                      label = "MY POST";
                    } else {
                      colors =
                        "bg-[#14532D]/90 border-[#34D399] text-[#D1FAE5] shadow-md";
                      label = "OPEN";
                    }
                  } else if (event.type === "my-slot") {
                    colors =
                      "bg-[#7C2D12]/90 border-[#FB923C] text-[#FFEDD5] shadow-md";
                    label = "PENDING";
                  } else if (event.type === "community-meeting") {
                    colors =
                      "bg-[#3E2723]/90 border-[#5D4037] text-[#D7CCC8] opacity-80";
                    label = "LOCKED";
                  } else {
                    colors =
                      "bg-[#B91C1C] border-[#FCA5A5] text-white shadow-[0_0_15px_rgba(185,28,28,0.5)]";
                    label = "MISSION";
                  }

                  return (
                    <button
                      type="button"
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`absolute border-l-4 p-1.5 cursor-pointer hover:brightness-110 hover:scale-[1.02] transition-all flex flex-col justify-center rounded-r-md ${colors} z-20 outline-none focus:ring-2 focus:ring-white text-left`}
                      style={{ ...style }}
                    >
                      <div className="font-black text-[10px] uppercase tracking-wider leading-none mb-0.5 opacity-90">
                        {label}
                      </div>
                      <div className="text-xs font-bold truncate drop-shadow-md">
                        {format(event.startTime, "HH:mm")}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALS (Simplified for theme) */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="INITIATE POST"
      >
        <div className="space-y-4">
          <div className="bg-surface p-4 border-l-4 border-caramel rounded-r-lg shadow-inner">
            <div className="text-xs text-text-secondary uppercase tracking-widest font-bold">
              TARGET DATE
            </div>
            <div className="text-2xl font-black text-text italic text-glow-amber">
              {newSlotDate ? format(newSlotDate, "MMM dd @ HH:mm") : ""}
            </div>
          </div>

          <div>
            <div className="text-xs text-text-secondary font-bold uppercase tracking-widest">
              DURATION
            </div>
            <div className="flex gap-2 mt-1">
              {TIMESLOT_DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setNewSlotDuration(d.value)}
                  className={`flex-1 py-3 font-bold uppercase border rounded-md transition-all shadow-sm ${newSlotDuration === d.value ? "border-caramel bg-caramel/20 text-text" : "border-espresso text-text-secondary hover:border-caramel hover:text-text"}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* --- NEW PROMINENT LOCATION SELECTOR --- */}
          <div>
            <div className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-2 block">
              TARGET LOCATION
            </div>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="relative w-full text-left group cursor-pointer overflow-hidden border border-espresso rounded-lg hover:border-caramel transition-all duration-200 bg-background shadow-md outline-none focus:ring-2 focus:ring-caramel"
            >
              {/* Wood Grain Pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #3E2723 0px, #5D4037 2px, #3E2723 4px)",
                }}
              ></div>

              <div className="relative p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Icon Box */}
                  <div className="w-10 h-10 shrink-0 bg-surface flex items-center justify-center border border-espresso rounded group-hover:border-caramel group-hover:text-caramel transition-colors shadow-inner">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-caramel font-bold uppercase tracking-widest leading-none mb-1">
                      LOCATION LOCKED
                    </span>
                    <span className="text-lg md:text-xl font-black text-text uppercase truncate leading-none group-hover:text-caramel transition-colors text-shadow-sm">
                      {locations.find((l) => l.id === newSlotLocationId)
                        ?.name || "SELECT DROPOINT"}
                    </span>
                  </div>
                </div>

                {/* Change Button Visual */}
                <div className="shrink-0 bg-surface px-3 py-1.5 border border-espresso rounded text-xs font-bold text-text uppercase group-hover:bg-caramel group-hover:border-caramel transition-colors shadow-sm">
                  CHANGE
                </div>
              </div>
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="secondary"
              onClick={() => setIsPostModalOpen(false)}
            >
              ABORT
            </Button>
            <Button onClick={handlePostSubmit}>CONFIRM POST</Button>
          </div>
        </div>
      </Modal>

      {/* Other modals reuse generic components */}
      {selectedEvent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="MISSION DETAILS"
        >
          <TimeslotCard
            timeslot={
              selectedEvent.data.hasOwnProperty("timeslotId")
                ? timeslots.find(
                    (t) => t.id === (selectedEvent.data as Meeting).timeslotId,
                  ) || (selectedEvent.data as any)
                : (selectedEvent.data as Timeslot)
            }
            host={users.find((u) => u.id === selectedEvent.data.hostUserId)}
            location={locations.find(
              (l) => l.id === selectedEvent.data.locationId,
            )}
            currentUser={currentUser}
            isCurrentUserHost={selectedEvent.data.hostUserId === currentUser.id}
            onAccept={async (id) => {
              await onAcceptTimeslot(id, currentUser.id);
              setIsDetailModalOpen(false);
            }}
            onDelete={async (id) => {
              await onDeleteTimeslot(id);
              setIsDetailModalOpen(false);
            }}
            onCancelMeeting={async (id) => {
              await onCancelMeeting(id, currentUser.id);
              setIsDetailModalOpen(false);
            }}
            meetingStatus={getMeetingStatus(selectedEvent)}
            meetingId={
              selectedEvent.type === "meeting" ||
              selectedEvent.type === "community-meeting"
                ? (selectedEvent.data as Meeting).id
                : undefined
            }
            attendee={users.find((u) => {
              const d = selectedEvent.data;
              if ("attendeeUserId" in d) {
                return u.id === (d as any).attendeeUserId;
              }
              if ("bookedByUserId" in d) {
                return u.id === (d as any).bookedByUserId;
              }
              return false;
            })}
            viewOnly={selectedEvent.type === "community-meeting"}
          />
        </Modal>
      )}
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          setNewSlotDate(new Date());
          if (locations.length > 0 && !newSlotLocationId)
            setNewSlotLocationId(locations[0].id);
          setIsPostModalOpen(true);
        }}
        className="absolute bottom-8 right-8 w-16 h-16 bg-caramel rounded-full shadow-[0_4px_20px_rgba(217,119,6,0.5)] flex items-center justify-center text-white z-50 hover:scale-110 hover:shadow-[0_8px_30px_rgba(217,119,6,0.7)] transition-all duration-300 group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <LocationSelectionModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        locations={locations.filter((l) => l.isApproved)}
        currentUserLocation={TIMBERCREEK_CHURCH_COORDS}
        onSelectLocation={(id) => {
          setNewSlotLocationId(id);
          setIsLocationModalOpen(false);
        }}
      />
    </div>
  );
};

export default Calendar;
