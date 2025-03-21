"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

// Get allowed domains from environment variable
const ALLOWED_DOMAINS = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS
  ? process.env.NEXT_PUBLIC_ALLOWED_DOMAINS.split(",").map((domain) =>
      domain.trim()
    )
  : [];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    if (!auth) {
      console.error("Firebase auth is not initialized");
      toast.error("Authentication service is not available");
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      // If domains are restricted, force account selection to prevent auto-login with unauthorized accounts
      if (ALLOWED_DOMAINS.length > 0) {
        provider.setCustomParameters({
          prompt: "select_account",
        });
      }

      const result = await signInWithPopup(auth, provider);

      // Check if the user's email domain is allowed
      if (ALLOWED_DOMAINS.length > 0) {
        const emailDomain = result.user.email?.split("@")[1];
        if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
          // Sign out the user immediately
          await auth.signOut();
          toast.error(
            "Your email domain is not authorized to access this application"
          );
          return;
        }
      }

      router.push("/");
      toast.success("Successfully logged in!");
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome to Text-to-Speech</CardTitle>
          <CardDescription>
            Sign in to access the text-to-speech synthesis tool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
            )}
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
      <Toaster />
    </main>
  );
}
