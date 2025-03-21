"use client";

import type { Auth } from "firebase/auth";

// Get environment variables with fallbacks
const config = {
  isAuthEnabled: process.env.NEXT_PUBLIC_AUTHENTICATION === "true",
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  },
};

let auth: Auth | null = null;

// Function to check if all required Firebase config is present
function hasRequiredConfig(): boolean {
  const required = ["apiKey", "authDomain", "projectId"] as const;
  const missing = required.filter((key) => !config.firebase[key]);

  if (missing.length > 0) {
    console.warn(
      "Missing required Firebase configuration:",
      missing.join(", "),
      "\nCurrent config:",
      {
        isAuthEnabled: config.isAuthEnabled,
        apiKey: config.firebase.apiKey ? "✓" : "✗",
        authDomain: config.firebase.authDomain ? "✓" : "✗",
        projectId: config.firebase.projectId ? "✓" : "✗",
      }
    );
    return false;
  }
  return true;
}

// Initialize Firebase only in the browser and only if auth is enabled
if (typeof window !== "undefined" && config.isAuthEnabled) {
  // Initialize immediately to avoid race conditions
  (async function initializeFirebase() {
    try {
      if (!hasRequiredConfig()) {
        return;
      }

      const { initializeApp } = await import("firebase/app");
      const { getAuth } = await import("firebase/auth");

      // Initialize Firebase only if not already initialized
      if (!auth) {
        const app = initializeApp(config.firebase);
        auth = getAuth(app);
        console.log("Firebase initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      // Don't throw the error, just log it and continue with auth as null
    }
  })();
}

export { auth };
