"use client";

import { useEffect } from "react";

import { AlertRealtimeListener } from "@/components/alert-realtime-listener";
import { useAlertsStore } from "@/store/use-alerts-store";
import { useSavedStore } from "@/store/use-saved-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const loadSaved = useSavedStore((s) => s.load);
  const loadAlerts = useAlertsStore((s) => s.load);

  useEffect(() => {
    loadSaved();
    loadAlerts();
  }, [loadSaved, loadAlerts]);

  return (
    <>
      <AlertRealtimeListener />
      {children}
    </>
  );
}
