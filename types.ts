import { FunctionDeclaration, Type } from '@google/genai';

export enum UserRole {
  MEMBER = 'Member',
  LEADER = 'Leader',
  ADMINISTRATOR = 'Administrator',
}

export interface User {
  id: string;
  name: string;
  profilePicture: string; // Base64 or URL
  bio: string;
  role: UserRole;
  points: number;
}

export enum TimeslotDuration {
  THIRTY_MINUTES = 30,
  SIXTY_MINUTES = 60,
}

export interface Timeslot {
  id: string;
  hostUserId: string;
  startTime: Date; // ISO string for persistence
  durationMinutes: TimeslotDuration;
  locationId: string;
  isBooked: boolean;
  bookedByUserId?: string; // Optional, only if booked
  repeatWeekly: boolean; // For recurring slots
}

export enum MeetingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Meeting {
  id: string;
  hostUserId: string;
  attendeeUserId: string;
  timeslotId: string;
  locationId: string;
  startTime: Date; // ISO string for persistence
  durationMinutes: TimeslotDuration;
  status: MeetingStatus;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isApproved: boolean;
  submittedByUserId?: string; // Optional, if submitted by a member
  isStatic?: boolean; // If true, strictly use lat/long and skip geocoding
  approxDriveMinutes?: number; // Drive time from church
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorUserId: string;
  timestamp: Date; // ISO string for persistence
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FunctionCall {
  args: { [key: string]: unknown };
  name: string;
  id: string;
}

// Minimal definition for GoogleGenAI types used in the app
export interface LiveServerMessage {
  serverContent?: {
    modelTurn?: {
      parts: Array<{
        inlineData: {
          data: string;
          mimeType: string;
        };
      }>;
    };
    outputTranscription?: {
      text: string;
    };
    inputTranscription?: {
      text: string;
    };
    turnComplete?: boolean;
    interrupted?: boolean;
  };
  toolCall?: {
    functionCalls: FunctionCall[];
  };
}

export interface GoogleGenAIChatMessage {
  message: string;
}

export interface GoogleGenAIChatConfig {
  systemInstruction?: string;
  tools?: Array<{
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: Record<string, never>;
    googleMaps?: Record<string, never>;
  }>;
  toolConfig?: {
    retrievalConfig?: {
      latLng?: {
        latitude: number;
        longitude: number;
      };
    };
  };
}

export interface GoogleGenAIModelConfig {
  topK?: number;
  topP?: number;
  temperature?: number;
  responseMimeType?: string;
  seed?: number;
  maxOutputTokens?: number;
  thinkingConfig?: {
    thinkingBudget?: number;
  };
  responseSchema?: {
    type: Type;
    items?: {
      type: Type;
      properties?: Record<string, unknown>;
      propertyOrdering?: string[];
    };
    properties?: Record<string, unknown>;
    propertyOrdering?: string[];
  };
  tools?: Array<{
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: Record<string, never>;
    googleMaps?: Record<string, never>;
  }>;
  toolConfig?: {
    retrievalConfig?: {
      latLng?: {
        latitude: number;
        longitude: number;
      };
    };
  };
}

export interface GoogleGenAIGenerateContentResponse {
  text: string;
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          data: string;
          mimeType: string;
        };
        text?: string;
      }>;
    };
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: {
          uri: string;
          title: string;
        };
        maps?: {
          uri: string;
          title: string;
          placeAnswerSources?: Array<{
            reviewSnippets?: Array<{
              uri: string;
            }>;
          }>;
        };
      }>;
    };
  }>;
  functionCalls?: FunctionCall[];
}

export interface GoogleGenAIGenerateContentStreamResponse extends AsyncIterable<GoogleGenAIGenerateContentResponse> {}

export interface GoogleGenAILiveConnectConfig {
  model: string;
  callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
  };
  config?: {
    responseModalities: string[];
    speechConfig?: {
      voiceConfig?: {
        prebuiltVoiceConfig: {
          voiceName: string;
        };
      };
      multiSpeakerVoiceConfig?: {
        speakerVoiceConfigs: Array<{
          speaker: string;
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: string;
            };
          };
        }>;
      };
    };
    systemInstruction?: string;
    outputAudioTranscription?: Record<string, never>;
    inputAudioTranscription?: Record<string, never>;
    tools?: Array<{
      functionDeclarations?: FunctionDeclaration[];
    }>;
  };
}

export interface GoogleGenAIBlob {
  data: string;
  mimeType: string;
}

export interface GoogleGenAISession {
  sendRealtimeInput: (input: { media: GoogleGenAIBlob | { data: string; mimeType: string } }) => void;
  sendToolResponse: (response: {
    functionResponses: {
      id: string;
      name: string;
      response: {
        result: string;
      };
    };
  }) => void;
  close: () => void;
}

/**
 * Defines the possible views for the main application navigation.
 */
export type AppView = 'Calendar' | 'Leaderboard' | 'Profile' | 'Admin';