import {
  User, UserRole, Timeslot, Meeting, Location, Announcement,
  TimeslotDuration, Coordinates, MeetingStatus
} from '../types';
import { POINT_VALUES, TIMBERCREEK_CHURCH_COORDS } from '../constants';
import { supabase } from '../src/lib/supabaseClient';
import { addMinutes, format } from 'date-fns';

// Helper to map DB User to App User
const mapUser = (dbUser: any): User => ({
  id: dbUser.id,
  email: dbUser.email,
  name: dbUser.name,
  role: dbUser.role as UserRole,
  points: dbUser.points,
  profilePicture: dbUser.profile_picture,
});

// Helper to map DB Location to App Location
const mapLocation = (dbLoc: any): Location => ({
  id: dbLoc.id,
  name: dbLoc.name,
  address: dbLoc.address,
  latitude: dbLoc.latitude,
  longitude: dbLoc.longitude,
  isApproved: dbLoc.is_approved,
  submittedByUserId: dbLoc.submitted_by_user_id,
});

// Helper to map DB Timeslot to App Timeslot
const mapTimeslot = (dbSlot: any): Timeslot => ({
  id: dbSlot.id,
  hostUserId: dbSlot.host_user_id,
  startTime: new Date(dbSlot.start_time),
  durationMinutes: dbSlot.duration_minutes,
  locationId: dbSlot.location_id,
  isBooked: dbSlot.is_booked,
  bookedByUserId: dbSlot.booked_by_user_id,
  repeatWeekly: false, // Not persisted in DB for now, simplified
});

// Helper to map DB Meeting to App Meeting
const mapMeeting = (dbMeeting: any): Meeting => ({
  id: dbMeeting.id,
  hostUserId: dbMeeting.host_user_id,
  attendeeUserId: dbMeeting.attendee_user_id,
  timeslotId: dbMeeting.timeslot_id,
  locationId: dbMeeting.location_id,
  startTime: new Date(dbMeeting.start_time),
  durationMinutes: dbMeeting.duration_minutes,
  status: dbMeeting.status as MeetingStatus,
});

// Helper to map DB Announcement to App Announcement
const mapAnnouncement = (dbAnn: any): Announcement => ({
  id: dbAnn.id,
  title: dbAnn.title,
  content: dbAnn.content,
  authorUserId: dbAnn.author_user_id,
  timestamp: new Date(dbAnn.timestamp),
});

export const apiService = {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data.map(mapUser);
  },

  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return undefined;
    return mapUser(data);
  },

  async createUser(user: Omit<User, 'id' | 'points'>): Promise<User> {
    // Note: ID is usually handled by Auth, but for this app structure we might pass it or let DB generate
    // If we are creating a profile for an existing Auth user, we should pass the ID.
    // For now, assuming the app passes the ID (from Auth) or we generate one if missing (which shouldn't happen in real auth flow)

    const { data, error } = await supabase.from('users').insert({
      id: (user as any).id, // Expecting ID to be passed if it's from Auth
      email: user.email,
      name: user.name,
      role: user.role,
      points: 0,
      profile_picture: user.profilePicture
    }).select().single();

    if (error) throw error;
    return mapUser(data);
  },

  async updateUser(user: User): Promise<User> {
    const { data, error } = await supabase.from('users').update({
      name: user.name,
      role: user.role,
      points: user.points,
      profile_picture: user.profilePicture
    }).eq('id', user.id).select().single();

    if (error) throw error;
    return mapUser(data);
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  async updatePoints(userId: string, points: number): Promise<User | undefined> {
    // First get current points
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const newPoints = user.points + points;
    const { data, error } = await supabase.from('users').update({ points: newPoints }).eq('id', userId).select().single();

    if (error) throw error;
    return mapUser(data);
  },

  async getTimeslots(): Promise<Timeslot[]> {
    const { data, error } = await supabase.from('timeslots').select('*');
    if (error) throw error;
    return data.map(mapTimeslot);
  },

  async createTimeslot(timeslot: Omit<Timeslot, 'id' | 'isBooked'>, userId: string): Promise<Timeslot> {
    const { data, error } = await supabase.from('timeslots').insert({
      host_user_id: userId,
      start_time: timeslot.startTime.toISOString(),
      duration_minutes: timeslot.durationMinutes,
      location_id: timeslot.locationId,
      is_booked: false
    }).select().single();

    if (error) throw error;
    await apiService.updatePoints(userId, POINT_VALUES.POST_TIMESLOT);
    return mapTimeslot(data);
  },

  async updateTimeslot(timeslot: Timeslot): Promise<Timeslot> {
    const { data, error } = await supabase.from('timeslots').update({
      is_booked: timeslot.isBooked,
      booked_by_user_id: timeslot.bookedByUserId
    }).eq('id', timeslot.id).select().single();

    if (error) throw error;
    return mapTimeslot(data);
  },

  async deleteTimeslot(id: string): Promise<void> {
    const { error } = await supabase.from('timeslots').delete().eq('id', id);
    if (error) throw error;
  },

  async getMeetings(): Promise<Meeting[]> {
    const { data, error } = await supabase.from('meetings').select('*');
    if (error) throw error;
    return data.map(mapMeeting);
  },

  async createMeeting(meeting: Omit<Meeting, 'id'>, hostId: string, attendeeId: string): Promise<Meeting> {
    const { data, error } = await supabase.from('meetings').insert({
      host_user_id: hostId,
      attendee_user_id: attendeeId,
      timeslot_id: meeting.timeslotId,
      location_id: meeting.locationId,
      start_time: meeting.startTime.toISOString(),
      duration_minutes: meeting.durationMinutes,
      status: meeting.status
    }).select().single();

    if (error) throw error;

    await apiService.updatePoints(hostId, POINT_VALUES.ACCEPT_MEETING);
    await apiService.updatePoints(attendeeId, POINT_VALUES.ACCEPT_MEETING);

    return mapMeeting(data);
  },

  async updateMeeting(meeting: Meeting): Promise<Meeting> {
    const { data, error } = await supabase.from('meetings').update({
      status: meeting.status
    }).eq('id', meeting.id).select().single();

    if (error) throw error;
    return mapMeeting(data);
  },

  async cancelMeeting(meetingId: string, cancellingUserId: string): Promise<Meeting> {
    const { data, error } = await supabase.from('meetings').update({
      status: MeetingStatus.CANCELLED
    }).eq('id', meetingId).select().single();

    if (error) throw error;
    const meeting = mapMeeting(data);

    // Free up the timeslot
    await supabase.from('timeslots').update({
      is_booked: false,
      booked_by_user_id: null
    }).eq('id', meeting.timeslotId);

    return meeting;
  },

  async completeMeeting(meetingId: string): Promise<Meeting> {
    const { data, error } = await supabase.from('meetings').update({
      status: MeetingStatus.COMPLETED
    }).eq('id', meetingId).select().single();

    if (error) throw error;
    const meeting = mapMeeting(data);

    await apiService.updatePoints(meeting.hostUserId, POINT_VALUES.COMPLETE_MEETING);
    await apiService.updatePoints(meeting.attendeeUserId, POINT_VALUES.COMPLETE_MEETING);

    return meeting;
  },

  async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase.from('locations').select('*').order('name');
    if (error) throw error;
    return data.map(mapLocation);
  },

  async addLocation(location: Omit<Location, 'id' | 'isApproved'>, submittedByUserId?: string): Promise<Location> {
    const { data, error } = await supabase.from('locations').insert({
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      is_approved: false,
      submitted_by_user_id: submittedByUserId
    }).select().single();

    if (error) throw error;
    if (submittedByUserId) await apiService.updatePoints(submittedByUserId, POINT_VALUES.SUBMIT_LOCATION);
    return mapLocation(data);
  },

  async approveLocation(locationId: string, adminUserId: string): Promise<Location> {
    const { data, error } = await supabase.from('locations').update({
      is_approved: true
    }).eq('id', locationId).select().single();

    if (error) throw error;
    const location = mapLocation(data);

    if (location.submittedByUserId) {
      await apiService.updatePoints(location.submittedByUserId, POINT_VALUES.APPROVE_LOCATION);
    }
    return location;
  },

  async deleteLocation(id: string): Promise<void> {
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return data.map(mapAnnouncement);
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
    const { data, error } = await supabase.from('announcements').insert({
      title: announcement.title,
      content: announcement.content,
      author_user_id: announcement.authorUserId,
      timestamp: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    return mapAnnouncement(data);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  },

  generateICSFile(meeting: Meeting, location: Location, host: User, attendee: User): string {
    const start = format(meeting.startTime, 'yyyyMMdd\'T\'HHmmss');
    const end = format(addMinutes(meeting.startTime, meeting.durationMinutes), 'yyyyMMdd\'T\'HHmmss');
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Timbercreek Men's Connect//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${meeting.id}
DTSTAMP:${format(new Date(), 'yyyyMMdd\'T\'HHmmss\'Z\'')}
DTSTART:${start}
DTEND:${end}
SUMMARY:Coffee Connect with ${attendee.name}
DESCRIPTION:Location: ${location.name}, ${location.address}\\nView on Google Maps: ${googleMapsLink}
LOCATION:${location.name}, ${location.address}
END:VEVENT
END:VCALENDAR`;
  },

  async sendSMSNotification(toPhoneNumber: string, message: string): Promise<boolean> {
    // In a real app, this would call a Supabase Edge Function which calls Twilio
    console.log(`--- SIMULATED SMS SENT TO ${toPhoneNumber}: ${message} ---`);
    return true;
  },

  async getCurrentLocation(): Promise<Coordinates> {
    return { latitude: TIMBERCREEK_CHURCH_COORDS.latitude, longitude: TIMBERCREEK_CHURCH_COORDS.longitude };
  }
};
