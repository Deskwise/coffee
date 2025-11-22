import React, { useState, useEffect, useCallback } from 'react';
import {
  User, UserRole, Timeslot, Location, Meeting, Announcement, MeetingStatus, Coordinates
} from './types';
import { apiService } from './services/apiService';
import { INITIAL_USERS } from './constants';
import Header from './components/Header';
import Navigation from './components/Navigation';
import RoleSelector from './components/RoleSelector';
import ProfileForm from './components/ProfileForm';
import Calendar from './components/Calendar';
import Leaderboard from './components/Leaderboard';
import AnnouncementCard from './components/AnnouncementCard';
import Input from './components/Input';
import Button from './components/Button';
import Modal from './components/Modal';
import LocationList from './components/LocationList';
import LocationMap from './components/LocationMap';
import Footer from './components/Footer';
import Notification from './components/Notification';
import { Auth } from './components/Auth';
import { supabase } from './src/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { addWeeks, addMinutes, format, isSameDay } from 'date-fns';

type AppView = 'Calendar' | 'Leaderboard' | 'Profile' | 'Admin';
type AdminSubView = 'Users' | 'Locations' | 'Announcements';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('Calendar');
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('Users');
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [newLocationLat, setNewLocationLat] = useState<number | ''>('');
  const [newLocationLon, setNewLocationLon] = useState<number | ''>('');
  const [addLocationModalOpen, setAddLocationModalOpen] = useState(false);

  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [addAnnouncementModalOpen, setAddAnnouncementModalOpen] = useState(false);

  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  // Notification State
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  // --- Auth Listener ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Initial Data Loading ---
  useEffect(() => {
    const loadData = async () => {
      if (!session) {
        setLoadingInitialData(false);
        return;
      }

      setLoadingInitialData(true);
      try {
        const [loadedUsers, loadedTimeslots, loadedMeetings, loadedLocations, loadedAnnouncements] = await Promise.all([
          apiService.getUsers(),
          apiService.getTimeslots(),
          apiService.getMeetings(),
          apiService.getLocations(),
          apiService.getAnnouncements(),
        ]);
        setUsers(loadedUsers);
        setTimeslots(loadedTimeslots);
        setMeetings(loadedMeetings);
        setLocations(loadedLocations);
        setAnnouncements(loadedAnnouncements);

        // Set current user based on session
        const myUser = loadedUsers.find(u => u.id === session.user.id);
        if (myUser) {
          setCurrentUser(myUser);
        } else {
          // If user exists in Auth but not in public.users (should be handled by trigger, but just in case)
          // We could try to create one or show error.
          // For now, let's assume the trigger worked or we'll fetch again.
          console.warn('User logged in but not found in public.users table');
          // Attempt to create if missing (fallback)
          try {
            const newUser = await apiService.createUser({
              email: session.user.email || '',
              name: session.user.user_metadata.name || 'New User',
              role: UserRole.MEMBER,
              profilePicture: session.user.user_metadata.avatar_url || '',
              // id is injected by apiService from auth session if we passed it, but here we are relying on trigger mostly
            } as any);
            setCurrentUser(newUser);
            setUsers([...loadedUsers, newUser]);
          } catch (e) {
            console.error("Error creating fallback user", e);
          }
        }

      } catch (error) {
        console.error('Failed to load initial data:', error);
        showToast('Failed to load data.', 'error');
      } finally {
        setLoadingInitialData(false);
      }
    };
    loadData();
  }, [session]);

  // Check for Gemini API key
  useEffect(() => {
    const checkApiKey = async () => {
      if (typeof window.aistudio !== 'undefined' && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
        if (!hasKey) {
          console.warn('Gemini API key not selected. Some features might be limited.');
        }
      } else {
        setApiKeySelected(!!process.env.API_KEY);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectUser = (user: User) => {
    // In Supabase version, we don't really "switch" users like in dev mode, 
    // but for Admin viewing profile, we might want to see it.
    // For now, we'll keep this but it might need adjustment.
    // Actually, let's disable switching current user identity in the UI for non-admins or just remove it.
    // But existing code uses it for "View as".
    setCurrentUser(user);
    showToast(`Viewing as ${user.name}`);
    if (user.role === UserRole.MEMBER && currentView === 'Admin') {
      setCurrentView('Calendar');
    }
  };

  const handleHardReset = () => {
    if (confirm('EXTREME DANGER: This will wipe all local data and reset the app to a fresh install state. This will fix map pins. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- User Actions ---
  const handleSaveUser = async (user: User) => {
    try {
      if (users.find(u => u.id === user.id)) {
        await apiService.updateUser(user);
        showToast('User updated successfully');
      } else {
        await apiService.createUser(user);
        showToast('User created successfully');
      }
      setUsers(await apiService.getUsers());
      if (currentUser && currentUser.id === user.id) {
        setCurrentUser(user);
      }
      setIsNewUserModalOpen(false);
      setEditUserModalOpen(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      showToast('Failed to save user.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await apiService.deleteUser(userId);
      setUsers(await apiService.getUsers());
      if (currentUser && currentUser.id === userId) {
        // If deleting self, sign out
        await supabase.auth.signOut();
        setCurrentUser(null);
      }
      showToast('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast('Failed to delete user.', 'error');
    }
  };

  // --- Timeslot Actions ---
  const handleCreateTimeslot = useCallback(async (newTimeslotData: Omit<Timeslot, 'id' | 'isBooked'>) => {
    if (!currentUser) return;
    try {
      const createdTimeslot = await apiService.createTimeslot(newTimeslotData, currentUser.id);
      setTimeslots(await apiService.getTimeslots());
      setUsers(await apiService.getUsers());

      if (createdTimeslot.repeatWeekly) {
        for (let i = 1; i <= 3; i++) {
          const recurringTimeslot: Omit<Timeslot, 'id' | 'isBooked'> = {
            ...newTimeslotData,
            startTime: addWeeks(newTimeslotData.startTime, i),
          };
          await apiService.createTimeslot(recurringTimeslot, currentUser.id);
        }
        setTimeslots(await apiService.getTimeslots());
        setUsers(await apiService.getUsers());
      }
      showToast('Availability posted successfully!');
    } catch (error) {
      console.error('Failed to create timeslot:', error);
      showToast('Failed to post availability.', 'error');
      throw error;
    }
  }, [currentUser, setTimeslots, setUsers]);

  const handleAcceptTimeslot = useCallback(async (timeslotId: string) => {
    if (!currentUser) return;
    try {
      const timeslotToBook = timeslots.find(t => t.id === timeslotId);
      if (!timeslotToBook) throw new Error('Timeslot not found.');

      if (timeslotToBook.hostUserId === currentUser.id) {
        showToast('You cannot book your own timeslot.', 'error');
        return;
      }

      const updatedTimeslot: Timeslot = {
        ...timeslotToBook,
        isBooked: true,
        bookedByUserId: currentUser.id,
      };
      await apiService.updateTimeslot(updatedTimeslot);

      const newMeeting: Omit<Meeting, 'id'> = {
        hostUserId: timeslotToBook.hostUserId,
        attendeeUserId: currentUser.id,
        timeslotId: timeslotToBook.id,
        locationId: timeslotToBook.locationId,
        startTime: timeslotToBook.startTime,
        durationMinutes: timeslotToBook.durationMinutes,
        status: MeetingStatus.CONFIRMED,
      };
      // Capture the created meeting from the service response which includes the new ID
      const createdMeeting = await apiService.createMeeting(newMeeting, timeslotToBook.hostUserId, currentUser.id);

      setTimeslots(await apiService.getTimeslots());
      setMeetings(await apiService.getMeetings());
      setUsers(await apiService.getUsers());

      const host = users.find(u => u.id === timeslotToBook.hostUserId);
      const attendee = users.find(u => u.id === currentUser.id);
      const location = locations.find(l => l.id === timeslotToBook.locationId);

      if (host && attendee && location) {
        const hostMessage = `SUCCESS! You have a coffee meeting with ${attendee.name} on ${format(timeslotToBook.startTime, 'MMM dd, yyyy h:mm a')} at ${location.name}. Check your in-app calendar for details and an .ics file!`;
        const attendeeMessage = `SUCCESS! You're meeting ${host.name} on ${format(timeslotToBook.startTime, 'MMM dd, yyyy h:mm a')} at ${location.name}. Check your in-app calendar for details and an .ics file!`;

        apiService.sendSMSNotification(`+1555${host.id.slice(-4)}`, hostMessage);
        apiService.sendSMSNotification(`+1555${attendee.id.slice(-4)}`, attendeeMessage);

        const icsContent = apiService.generateICSFile(createdMeeting, location, host, attendee);
        const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
        const icsUrl = URL.createObjectURL(icsBlob);
        console.log(`--- .ics Calendar File ---`);
        console.log(`Download: ${icsUrl}`);
      }
      showToast('Meeting Confirmed! Points Awarded!');

    } catch (error) {
      console.error('Failed to accept timeslot:', error);
      showToast('Failed to accept timeslot. Please try again.', 'error');
    }
  }, [currentUser, timeslots, users, locations, setTimeslots, setMeetings, setUsers]);

  const handleDeleteTimeslot = useCallback(async (timeslotId: string) => {
    if (!currentUser) return;
    try {
      const timeslot = timeslots.find(t => t.id === timeslotId);
      if (!timeslot) throw new Error('Timeslot not found.');

      if (timeslot.isBooked && currentUser.role !== UserRole.ADMINISTRATOR) {
        showToast('Cannot delete a booked timeslot. Cancel first.', 'error');
        return;
      }

      if (timeslot.isBooked && currentUser.role === UserRole.ADMINISTRATOR) {
        const meeting = meetings.find(m => m.timeslotId === timeslot.id && m.status === MeetingStatus.CONFIRMED);
        if (meeting) {
          await apiService.cancelMeeting(meeting.id, currentUser.id);
          const host = users.find(u => u.id === meeting.hostUserId);
          const attendee = users.find(u => u.id === meeting.attendeeUserId);
          const location = locations.find(l => l.id === meeting.locationId);
          if (host && attendee && location) {
            apiService.sendSMSNotification(`+1555${host.id.slice(-4)}`, `ALERT: Your meeting with ${attendee.name} on ${format(meeting.startTime, 'MMM dd, yyyy h:mm a')} at ${location.name} has been cancelled by an administrator.`);
            apiService.sendSMSNotification(`+1555${attendee.id.slice(-4)}`, `ALERT: Your meeting with ${host.name} on ${format(meeting.startTime, 'MMM dd, yyyy h:mm a')} at ${location.name} has been cancelled by an administrator.`);
          }
        }
      }

      await apiService.deleteTimeslot(timeslotId);
      setTimeslots(await apiService.getTimeslots());
      setMeetings(await apiService.getMeetings());
      showToast('Timeslot deleted.');
    } catch (error) {
      console.error('Failed to delete timeslot:', error);
      showToast('Failed to delete timeslot.', 'error');
    }
  }, [currentUser, timeslots, meetings, users, locations, setTimeslots, setMeetings]);

  const handleCancelMeeting = useCallback(async (meetingId: string, cancellingUserId: string) => {
    if (!currentUser) return;
    try {
      const cancelledMeeting = await apiService.cancelMeeting(meetingId, cancellingUserId);
      setMeetings(await apiService.getMeetings());
      setTimeslots(await apiService.getTimeslots());

      const host = users.find(u => u.id === cancelledMeeting.hostUserId);
      const attendee = users.find(u => u.id === cancelledMeeting.attendeeUserId);
      const location = locations.find(l => l.id === cancelledMeeting.locationId);

      if (host && attendee && location) {
        const otherParty = host.id === cancellingUserId ? attendee : host;
        const cancelMessage = `${currentUser.name} has cancelled your coffee meeting on ${format(cancelledMeeting.startTime, 'MMM dd, yyyy h:mm a')} at ${location.name}. Please check the app for updates.`;
        apiService.sendSMSNotification(`+1555${otherParty.id.slice(-4)}`, cancelMessage);
      }
      showToast('Meeting cancelled. Notification sent.');
    } catch (error) {
      console.error('Failed to cancel meeting:', error);
      showToast('Failed to cancel meeting.', 'error');
    }
  }, [currentUser, users, locations, setMeetings, setTimeslots]);

  // --- Location Actions ---
  const handleAddLocation = async () => {
    if (!currentUser) return;
    if (!newLocationName || !newLocationAddress || newLocationLat === '' || newLocationLon === '') {
      showToast('Please fill all fields.', 'error');
      return;
    }
    try {
      const newLocation: Omit<Location, 'id' | 'isApproved'> = {
        name: newLocationName,
        address: newLocationAddress,
        latitude: Number(newLocationLat),
        longitude: Number(newLocationLon),
      };
      await apiService.addLocation(newLocation, currentUser.id);
      setLocations(await apiService.getLocations());
      setUsers(await apiService.getUsers());
      setAddLocationModalOpen(false);
      setNewLocationName('');
      setNewLocationAddress('');
      setNewLocationLat('');
      setNewLocationLon('');
      showToast('Location submitted for approval!');
    } catch (error) {
      console.error('Failed to add location:', error);
      showToast('Failed to add location.', 'error');
    }
  };

  const handleApproveLocation = async (locationId: string) => {
    if (!currentUser) return;
    try {
      await apiService.approveLocation(locationId, currentUser.id);
      setLocations(await apiService.getLocations());
      setUsers(await apiService.getUsers());
      showToast('Location approved!');
    } catch (error) {
      console.error('Failed to approve location:', error);
      showToast('Failed to approve location.', 'error');
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location? All associated timeslots and meetings will also be deleted.')) return;
    try {
      await apiService.deleteLocation(locationId);
      setLocations(await apiService.getLocations());
      setTimeslots(await apiService.getTimeslots());
      setMeetings(await apiService.getMeetings());
      showToast('Location deleted.');
    } catch (error) {
      console.error('Failed to delete location:', error);
      showToast('Failed to delete location.', 'error');
    }
  };

  // --- Announcement Actions ---
  const handleAddAnnouncement = async () => {
    if (!currentUser) return;
    if (!newAnnouncementTitle || !newAnnouncementContent) {
      showToast('Please fill all fields.', 'error');
      return;
    }
    try {
      const newAnnouncement: Omit<Announcement, 'id'> = {
        title: newAnnouncementTitle,
        content: newAnnouncementContent,
        authorUserId: currentUser.id,
        timestamp: new Date(),
      };
      await apiService.createAnnouncement(newAnnouncement);
      setAnnouncements(await apiService.getAnnouncements());
      setAddAnnouncementModalOpen(false);
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
      showToast('Announcement posted.');
    } catch (error) {
      console.error('Failed to add announcement:', error);
      showToast('Failed to add announcement.', 'error');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await apiService.deleteAnnouncement(announcementId);
      setAnnouncements(await apiService.getAnnouncements());
      showToast('Announcement deleted.');
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      showToast('Failed to delete announcement.', 'error');
    }
  };


  if (!session) {
    return <Auth onAuthSuccess={() => { }} />;
  }

  if (loadingInitialData || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-light tracking-wide animate-pulse">Loading Timbercreek...</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard Content
  const renderAdminDashboard = () => {
    if (currentUser.role !== UserRole.ADMINISTRATOR) {
      return <p className="text-text-secondary text-center py-8">Access Denied: You must be an Administrator to view this page.</p>;
    }

    return (
      <div className="p-4 pt-16 pb-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-text mb-8 tracking-tight">Admin Dashboard</h2>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            onClick={() => setAdminSubView('Users')}
            variant={adminSubView === 'Users' ? 'primary' : 'secondary'}
            className="min-w-[120px]"
          >
            Users
          </Button>
          <Button
            onClick={() => setAdminSubView('Locations')}
            variant={adminSubView === 'Locations' ? 'primary' : 'secondary'}
            className="min-w-[120px]"
          >
            Locations
          </Button>
          <Button
            onClick={() => setAdminSubView('Announcements')}
            variant={adminSubView === 'Announcements' ? 'primary' : 'secondary'}
            className="min-w-[120px]"
          >
            Announcements
          </Button>
        </div>

        {adminSubView === 'Users' && (
          <div className="card-industrial p-6 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-text text-glow-amber">Manage Users</h3>
              <Button onClick={() => setIsNewUserModalOpen(true)}>Add User</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700/50">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Points</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-surfaceHighlight/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text flex items-center">
                        <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full mr-3 object-cover border border-slate-600" />
                        <span className="font-medium">{user.name}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">{user.role}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-primary font-bold">{user.points}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => { setSelectedUserForEdit(user); setEditUserModalOpen(true); }}
                            className="px-3 py-1 text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser.id}
                            className="px-3 py-1 text-xs"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubView === 'Locations' && (
          <div className="card-industrial p-6 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-text text-glow-amber">Manage Locations</h3>
              <Button onClick={() => setAddLocationModalOpen(true)}>Add Location</Button>
            </div>

            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Pending Approval</h4>
            <div className="space-y-3 mb-8">
              {locations.filter(loc => !loc.isApproved).length === 0 ? (
                <div className="p-4 bg-surfaceHighlight/30 rounded-lg text-text-secondary text-sm italic border border-dashed border-slate-600 text-center">No pending locations.</div>
              ) : (
                locations.filter(loc => !loc.isApproved).map(loc => (
                  <div key={loc.id} className="bg-surfaceHighlight/20 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between shadow-sm border border-slate-700">
                    <div className="mb-3 sm:mb-0">
                      <h5 className="font-semibold text-text">{loc.name}</h5>
                      <p className="text-sm text-text-secondary">{loc.address}</p>
                      <p className="text-xs text-slate-500 mt-1">Submitted by: {users.find(u => u.id === loc.submittedByUserId)?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleApproveLocation(loc.id)} variant="primary" className="text-xs">Approve</Button>
                      <Button onClick={() => handleDeleteLocation(loc.id)} variant="danger" className="text-xs">Deny</Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Approved Locations</h4>
            <div className="space-y-3">
              {locations.filter(loc => loc.isApproved).length === 0 ? (
                <div className="p-4 bg-surfaceHighlight/30 rounded-lg text-text-secondary text-sm italic border border-dashed border-slate-600 text-center">No approved locations.</div>
              ) : (
                locations.filter(loc => loc.isApproved).map(loc => (
                  <div key={loc.id} className="bg-surfaceHighlight/20 p-4 rounded-lg flex items-center justify-between shadow-sm border border-slate-700">
                    <div>
                      <h5 className="font-semibold text-text">{loc.name}</h5>
                      <p className="text-sm text-text-secondary">{loc.address}</p>
                    </div>
                    <Button onClick={() => handleDeleteLocation(loc.id)} variant="danger" className="text-xs px-3 py-1">Delete</Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {adminSubView === 'Announcements' && (
          <div className="card-industrial p-6 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-text text-glow-amber">Manage Announcements</h3>
              <Button onClick={() => setAddAnnouncementModalOpen(true)}>New Post</Button>
            </div>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-text-secondary italic">No announcements posted yet.</div>
              ) : (
                announcements.map(announcement => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    author={users.find(u => u.id === announcement.authorUserId)}
                    currentUserRole={currentUser.role}
                    onDelete={handleDeleteAnnouncement}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TROUBLESHOOTING / RESET SECTION */}
        <div className="mt-12 border-t border-slate-700 pt-8 text-center">
          <p className="text-text-secondary text-sm mb-4">Troubleshooting</p>
          <Button onClick={handleHardReset} variant="secondary" className="border-red-900 text-red-400 hover:bg-red-900/20">
            Hard Reset App Data (Fixes Maps)
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary selection:text-white overflow-x-hidden relative">
      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* MASCULINE COFFEE HOUSE BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep Espresso Base - Dark coffee shop vibe */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f0a] via-[#0a0806] to-black"></div>

        {/* Floating Coffee Steam Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`steam-${i}`}
            className="absolute w-3 h-3 bg-amber-100/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 20}%`,
              animation: `particle-float ${12 + Math.random() * 8}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              filter: 'blur(2px)',
            }}
          ></div>
        ))}

        {/* COFFEE GLOW ORBS - Warm, Industrial */}

        {/* Deep Espresso/Brown - Top Left (dark roast) */}
        <div
          className="absolute -top-10 -left-20 w-[750px] h-[750px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(92, 51, 23, 0.85) 0%, rgba(64, 35, 15, 0.6) 40%, rgba(42, 24, 10, 0.3) 70%, transparent 100%)',
            animation: 'float 22s ease-in-out infinite, glow-pulse 9s ease-in-out infinite',
          }}
        ></div>

        {/* Warm Amber/Caramel - Top Right (coffee with cream) */}
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.7) 0%, rgba(180, 83, 9, 0.5) 40%, rgba(120, 53, 15, 0.3) 70%, transparent 100%)',
            animation: 'float 26s ease-in-out infinite reverse, glow-pulse 11s ease-in-out infinite',
            animationDelay: '2s',
          }}
        ></div>

        {/* Burnt Orange - Bottom Left (whiskey, leather) */}
        <div
          className="absolute bottom-0 left-0 w-[700px] h-[700px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(234, 88, 12, 0.65) 0%, rgba(194, 65, 12, 0.45) 40%, rgba(154, 52, 18, 0.25) 70%, transparent 100%)',
            animation: 'float 28s ease-in-out infinite, glow-pulse 13s ease-in-out infinite',
            animationDelay: '4s',
          }}
        ></div>

        {/* Dark Forest Green/Charcoal - Bottom Right (natural, earthy) */}
        <div
          className="absolute bottom-0 right-0 w-[650px] h-[650px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(20, 83, 45, 0.55) 0%, rgba(15, 60, 35, 0.35) 40%, rgba(10, 40, 25, 0.2) 70%, transparent 100%)',
            animation: 'float 24s ease-in-out infinite reverse, glow-pulse 10s ease-in-out infinite',
            animationDelay: '3s',
          }}
        ></div>

        {/* Center Warm Copper Glow - Industrial coffee machine vibes */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(161, 98, 7, 0.4) 0%, rgba(120, 53, 15, 0.25) 50%, rgba(80, 35, 10, 0.15) 80%, transparent 100%)',
            animation: 'glow-pulse 16s ease-in-out infinite',
            animationDelay: '1s',
          }}
        ></div>

        {/* Wood Grain Texture Overlay - Subtle */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='wood'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0.3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23wood)' fill='%23654321'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        ></div>

        {/* Dark vignette for industrial edge darkening */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>

        {/* Subtle concrete/leather texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'concreteFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.8\' numOctaves=\'7\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23concreteFilter)\' fill=\'%234A4A4A\'/%3E%3C/svg%3E")',
            mixBlendMode: 'overlay',
          }}
        ></div>
      </div>

      <Header currentUser={currentUser} onLogoClick={() => setCurrentView('Calendar')} />

      <main className="pb-24 relative z-10">
        {/* Removed RoleSelector from global render */}

        {currentView === 'Calendar' && currentUser && (
          <Calendar
            currentUser={currentUser}
            timeslots={timeslots}
            locations={locations}
            users={users}
            meetings={meetings}
            onCreateTimeslot={handleCreateTimeslot}
            onAcceptTimeslot={handleAcceptTimeslot}
            onDeleteTimeslot={handleDeleteTimeslot}
            onCancelMeeting={handleCancelMeeting}
          />
        )}
        {currentView === 'Leaderboard' && currentUser && (
          <Leaderboard users={users} currentUser={currentUser} />
        )}
        {currentView === 'Profile' && currentUser && (
          <div className="container mx-auto p-4 pt-10 pb-20 max-w-2xl">
            <h2 className="text-3xl font-bold text-center text-text mb-8 tracking-tight">Your Profile</h2>
            {/* RoleSelector now correctly placed within the Profile view */}
            <RoleSelector users={users} onSelectUser={handleSelectUser} currentUser={currentUser} />
            <ProfileForm
              user={currentUser}
              onSave={handleSaveUser}
              onCancel={() => { }}
            />
          </div>
        )}
        {currentView === 'Admin' && renderAdminDashboard()}
      </main>

      <Navigation
        currentView={currentView}
        onSelectView={setCurrentView}
        userRole={currentUser.role}
      />

      {/* Modals for Admin User/Location/Announcement Management */}
      <Modal isOpen={isNewUserModalOpen} onClose={() => setIsNewUserModalOpen(false)} title="Add New User">
        <ProfileForm
          user={null}
          onSave={handleSaveUser}
          onCancel={() => setIsNewUserModalOpen(false)}
          isNewUser={true}
        />
      </Modal>

      <Modal isOpen={editUserModalOpen} onClose={() => setEditUserModalOpen(false)} title="Edit User">
        <ProfileForm
          user={selectedUserForEdit}
          onSave={handleSaveUser}
          onCancel={() => setEditUserModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={addLocationModalOpen} onClose={() => setAddLocationModalOpen(false)} title="Add New Location">
        <div className="space-y-4">
          <Input
            id="new-location-name"
            label="Location Name"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
          />
          <Input
            id="new-location-address"
            label="Address"
            value={newLocationAddress}
            onChange={(e) => setNewLocationAddress(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="new-location-lat"
              label="Latitude"
              type="number"
              step="any"
              value={newLocationLat}
              onChange={(e) => setNewLocationLat(Number(e.target.value))}
            />
            <Input
              id="new-location-lon"
              label="Longitude"
              type="number"
              step="any"
              value={newLocationLon}
              onChange={(e) => setNewLocationLon(Number(e.target.value))}
            />
          </div>
          <LocationMap
            locations={[{
              id: 'temp',
              name: newLocationName || 'New Location',
              address: newLocationAddress || 'Address',
              latitude: typeof newLocationLat === 'number' ? newLocationLat : 39.0069,
              longitude: typeof newLocationLon === 'number' ? newLocationLon : -104.8818,
              isApproved: false
            }]}
            selectedLocationId="temp"
          />
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="secondary" onClick={() => setAddLocationModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLocation}>Submit Location</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={addAnnouncementModalOpen} onClose={() => setAddAnnouncementModalOpen(false)} title="Create Announcement">
        <div className="space-y-4">
          <Input
            id="announcement-title"
            label="Title"
            value={newAnnouncementTitle}
            onChange={(e) => setNewAnnouncementTitle(e.target.value)}
          />
          <div>
            <label htmlFor="announcement-content" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              Content
            </label>
            <textarea
              id="announcement-content"
              className="w-full p-3 bg-surfaceHighlight/50 border border-slate-600 rounded-lg text-text placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 hover:border-slate-500 min-h-[150px]"
              value={newAnnouncementContent}
              onChange={(e) => setNewAnnouncementContent(e.target.value)}
              placeholder="Write your announcement content here..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="secondary" onClick={() => setAddAnnouncementModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAnnouncement}>Post Announcement</Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default App;
