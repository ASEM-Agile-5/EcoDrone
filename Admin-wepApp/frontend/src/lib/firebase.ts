import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

/**
 * Copy values from Firebase Console → Project settings → Your apps → Web app.
 * Local: create Admin-wepApp/frontend/.env with VITE_* vars (see .env.example).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

/** Required for RTDB + Auth: at least API key + database URL. */
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_DATABASE_URL,
);

let app: FirebaseApp | undefined;
let db: Database | undefined;
let firebaseAuth: Auth | undefined;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    firebaseAuth = getAuth(app);
  } catch (e) {
    console.error("[Firebase] initializeApp failed:", e);
  }
} else {
  console.error(
    "[Firebase] Missing VITE_FIREBASE_API_KEY or VITE_FIREBASE_DATABASE_URL — copy .env.example to .env and fill values, then restart `npm run dev`.",
  );
}

export { db, firebaseAuth };
