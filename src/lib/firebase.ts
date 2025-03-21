const isAuthEnabled = process.env.NEXT_PUBLIC_AUTHENTICATION === "true";

let auth: any = null;

if (isAuthEnabled) {
  const { initializeApp } = require("firebase/app");
  const { getAuth } = require("firebase/auth");

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Initialize Firebase only if authentication is enabled
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };
