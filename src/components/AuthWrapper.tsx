"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const isAuthEnabled = process.env.NEXT_PUBLIC_AUTHENTICATION === "true";

function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthEnabled && !loading && !user && pathname !== "/login") {
      redirect("/login");
    }
  }, [user, loading, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthEnabled && !user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <AuthCheck>{children}</AuthCheck>
    </AuthProvider>
  );
}
