"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const isAuthEnabled = process.env.NEXT_PUBLIC_AUTHENTICATION === "true";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If authentication is disabled, don't do anything
    if (!isAuthEnabled) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    // Function to set up auth state listener
    const setupAuthListener = () => {
      if (!auth) {
        // If auth is not initialized yet, retry after a short delay
        const timeoutId = setTimeout(setupAuthListener, 100);
        return () => clearTimeout(timeoutId);
      }

      unsubscribe = auth.onAuthStateChanged((user: User | null) => {
        console.log("Auth state changed:", user ? "User logged in" : "No user");
        setUser(user);
        setLoading(false);

        // Only redirect to login if we're not already there and user is not authenticated
        if (!user && pathname !== "/login") {
          router.push("/login");
        }
      });
    };

    // Start the auth listener setup
    setupAuthListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router, pathname]); // Remove auth from dependencies as it's handled inside setupAuthListener

  // Show loading state while Firebase is initializing
  if (isAuthEnabled && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
