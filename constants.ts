// Cal.com API
export const CAL_API_KEY = import.meta.env.VITE_CAL_API_KEY || '';
export const CAL_API_BASE = 'https://api.cal.com/v1';

// Firebase — fill in your own project in .env.local
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Event — configure per show (CES, Computex, etc.)
export const APP_YEAR = import.meta.env.VITE_APP_YEAR || String(new Date().getFullYear());
export const APP_EVENT_NAME = import.meta.env.VITE_APP_EVENT_NAME || 'Event';
export const APP_TITLE = `${APP_EVENT_NAME} ${APP_YEAR} Meeting Manager`;
export const TIMEZONE = import.meta.env.VITE_TIMEZONE || 'UTC';
export const LOCALE = import.meta.env.VITE_LOCALE || 'en-US';

// Earliest booking year to keep. Defaults to APP_YEAR.
export const FILTER_YEAR_FROM = Number(
  import.meta.env.VITE_FILTER_YEAR_FROM || APP_YEAR
);
