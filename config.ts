
/**
 * APPLICATION CONFIGURATION
 * -------------------------
 * Centralized configuration for API keys and settings.
 * Update this file when deploying to a new Google Account.
 */

export const CONFIG = {
  // GOOGLE MAPS API KEY
  // Used in: components/LocationMap.tsx
  // Required permissions: "Maps JavaScript API"
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",

  // GEMINI AI API KEY
  // Used in: services/geminiService.ts
  // Required permissions: "Generative Language API"
  // If deploying to production, you can hardcode it here OR use environment variables.
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || "",

  // APP SETTINGS
  APP_NAME: "Timbercreek Men's Connect",
  CHURCH_ADDRESS: "20505 Circle Gate Dr, Monument, CO 80132",
};
