import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration should be provided via environment variables
// VITE_FIREBASE_API_KEY, etc.
console.log("Firebase: Initializing...");
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if config is loaded
if (!firebaseConfig.apiKey) {
    console.error("Firebase: Missing API Key! Check .env.local");
} else {
    console.log("Firebase: Config loaded (API Key present)");
}

let app;
let authExports;
let dbExports;

try {
    app = initializeApp(firebaseConfig);
    authExports = getAuth(app);
    dbExports = getFirestore(app);
    console.log("Firebase: Initialization success");
} catch (e) {
    console.error("Firebase: Initialization FAILED", e);
    throw e; // Re-throw to see the error, but at least we logged it.
}

export const auth = authExports;
export const db = dbExports;
