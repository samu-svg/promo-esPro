import { storage } from "@/lib/storage";

const MATCHES_KEY = "alert_matches";

function readKeys(): string[] {
  try {
    const raw = storage.getItem(MATCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function wasAlertNotified(alertId: string, promoId: string): boolean {
  return readKeys().includes(`${alertId}:${promoId}`);
}

export function markAlertNotified(alertId: string, promoId: string): void {
  const keys = readKeys();
  const key = `${alertId}:${promoId}`;
  if (keys.includes(key)) return;
  keys.push(key);
  storage.setItem(MATCHES_KEY, JSON.stringify(keys.slice(-500)));
}
