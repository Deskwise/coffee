
import { User, UserRole, Location, TimeslotDuration } from './types';

export const TIMBERCREEK_CHURCH_COORDS = {
  latitude: 39.065838, 
  longitude: -104.834076, 
  address: '20505 Circle Gate Dr, Monument, CO 80132'
};

// UPDATED LOCATION LIST - Northgate/Interquest Area
export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc-loyal-ng',
    name: "Loyal Coffee - Northgate",
    address: "11550 Ridgeline Dr #102, Colorado Springs, CO 80921",
    // Verified Rooftop
    latitude: 39.012600, 
    longitude: -104.796500,
    approxDriveMinutes: 8,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-red-leaf',
    name: "Red Leaf Organic Coffee - Interquest",
    address: "1254 Interquest Pkwy, Colorado Springs, CO 80921",
    // Verified Rooftop
    latitude: 39.002100, 
    longitude: -104.794800,
    approxDriveMinutes: 8,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-coffee-tea-zone',
    name: "Coffee & Tea Zone - Northgate Voyager",
    address: "12225 Voyager Pkwy #3, Colorado Springs, CO 80921",
    // Verified Rooftop
    latitude: 39.017300, 
    longitude: -104.798500,
    approxDriveMinutes: 8,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-tropical-latin',
    name: "Tropical Latin Coffee",
    address: "1710 Briargate Blvd Ste 455, Colorado Springs, CO 80920",
    // Verified Rooftop (Chapel Hills Mall area)
    latitude: 38.938000, 
    longitude: -104.795300,
    approxDriveMinutes: 12,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-tempo',
    name: "Tempo Espresso & Coffee",
    address: "7601 N Union Blvd, Colorado Springs, CO 80920",
    // Verified Rooftop
    latitude: 38.943700, 
    longitude: -104.778300,
    approxDriveMinutes: 14,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-bad-ass',
    name: "Bad Ass Coffee of Hawaii",
    address: "13491 Bass Pro Dr, Colorado Springs, CO 80921",
    // Verified User Provided
    latitude: 39.027134, 
    longitude: -104.824254,
    approxDriveMinutes: 7,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-ziggis',
    name: "Ziggi’s Coffee",
    address: "460 Chapel Hills Dr Suite 100, Colorado Springs, CO 80920",
    // Verified Rooftop
    latitude: 38.948300, 
    longitude: -104.798200,
    approxDriveMinutes: 12,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-mission',
    name: "Mission Coffee Roasters",
    address: "11641 Ridgeline Dr Ste 170, Colorado Springs, CO 80921",
    // Verified Rooftop
    latitude: 39.014200, 
    longitude: -104.796600,
    approxDriveMinutes: 9,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-crowfoot',
    name: "Crowfoot Valley Coffee",
    address: "8836 N Union Blvd, Colorado Springs, CO 80920",
    // Verified Rooftop
    latitude: 38.961200, 
    longitude: -104.778400,
    approxDriveMinutes: 12,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-its-a-grind',
    name: "It’s A Grind Coffee House",
    address: "9475 Briar Village Pt, Colorado Springs, CO 80920",
    // Verified Rooftop
    latitude: 38.968800, 
    longitude: -104.789800,
    approxDriveMinutes: 10,
    isApproved: true,
    isStatic: true
  },
  { 
    id: 'loc-scheels', 
    name: 'SCHEELS Café', 
    address: '1226 Interquest Pkwy, Colorado Springs, CO 80921', 
    // Exact ROOFTOP coordinates verified
    latitude: 38.994181, 
    longitude: -104.806517, 
    approxDriveMinutes: 7,
    isApproved: true,
    isStatic: true
  }, 
  {
    id: 'loc-black-rock',
    name: "Black Rock Coffee Bar",
    address: "13590 Roller Coaster Rd Ste 170, Colorado Springs, CO 80921",
    // Verified Roller Coaster Rd location
    latitude: 39.028931, 
    longitude: -104.782496,
    approxDriveMinutes: 8,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-new-day',
    name: "New Day Cafe - Northgate Plaza",
    address: "13375 Voyager Pkwy #110, Colorado Springs, CO 80921",
    // Verified Rooftop
    latitude: 39.027300, 
    longitude: -104.798800,
    approxDriveMinutes: 6,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-kneaders',
    name: "Kneaders Bakery & Cafe",
    address: "13482 Bass Pro Dr, Colorado Springs, CO 80921",
    // Verified Rooftop (Next to Bad Ass Coffee)
    latitude: 39.026300, 
    longitude: -104.823800,
    approxDriveMinutes: 7,
    isApproved: true,
    isStatic: true
  },
  { 
    id: 'loc-bellas', 
    name: 'Bella\'s Bagels', 
    address: '3582 Blue Horizon View Ste 148, Colorado Springs, CO 80924', 
    // Updated to user specific coordinates
    latitude: 38.98422447493753, 
    longitude: -104.75980975110684, 
    approxDriveMinutes: 16,
    isApproved: true,
    isStatic: true
  },
  {
    id: 'loc-serranos',
    name: 'Serranos Coffee Company',
    address: '625 CO-105, Monument, CO 80132',
    // Verified Monument Location
    latitude: 39.092506,
    longitude: -104.868505,
    approxDriveMinutes: 10,
    isApproved: true,
    isStatic: true
  }
].filter(l => l.isApproved); 

export const INITIAL_USERS: User[] = [
  { id: 'user-1', name: 'John Doe', profilePicture: 'https://picsum.photos/100/100?random=1', bio: 'Passionate about community building and good coffee.', role: UserRole.ADMINISTRATOR, points: 150 },
  { id: 'user-2', name: 'Jane Smith', profilePicture: 'https://picsum.photos/100/100?random=2', bio: 'Enjoys hiking and connecting with new people.', role: UserRole.LEADER, points: 120 },
  { id: 'user-3', name: 'Bob Johnson', profilePicture: 'https://picsum.photos/100/100?random=3', bio: 'New to the area, looking to make friends.', role: UserRole.MEMBER, points: 90 },
  { id: 'user-4', name: 'Alice Williams', profilePicture: 'https://picsum.photos/100/100?random=4', bio: 'Loves board games and deep conversations.', role: UserRole.MEMBER, points: 110 },
  { id: 'user-5', name: 'Charlie Brown', profilePicture: 'https://picsum.photos/100/100?random=5', bio: 'A true extrovert, always up for a chat.', role: UserRole.MEMBER, points: 130 },
  { id: 'user-6', name: 'Diana Prince', profilePicture: 'https://picsum.photos/100/100?random=6', bio: 'Avid reader and keen listener.', role: UserRole.MEMBER, points: 80 },
];

export const DEFAULT_PROFILE_PICTURE = 'https://picsum.photos/100/100?grayscale';

export const TIMESLOT_DURATIONS = [
  { value: TimeslotDuration.THIRTY_MINUTES, label: '30 Minutes' },
  { value: TimeslotDuration.SIXTY_MINUTES, label: '60 Minutes' },
];

export const POINT_VALUES = {
  POST_TIMESLOT: 10,
  ACCEPT_MEETING: 15,
  COMPLETE_MEETING: 25,
  APPROVE_LOCATION: 20,
  SUBMIT_LOCATION: 5,
};
