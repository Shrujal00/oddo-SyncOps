"use client";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { useAppStore } from "../store/app-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const clearAuth = useAppStore((s) => s.clearAuth);

  useEffect(() => {
    const storedAuth = window.localStorage.getItem("syncops-auth");
    if (storedAuth?.includes("syncops-demo-token")) {
      clearAuth();
      window.localStorage.removeItem("syncops-auth");
      document.cookie = "syncops-token=; path=/; max-age=0";
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }, [clearAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
